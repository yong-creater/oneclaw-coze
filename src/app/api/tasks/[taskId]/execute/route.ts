import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { buildPrompt } from '@/lib/prompt-engine';
import { normalizePrompt, buildNegativePrompt, validateGenerationResult, getMaxRetries } from '@/lib/generation-guardrail';
import { generateWithModel } from '@/lib/model-selector';
import { RATIO_TO_SIZE } from '@/lib/prompt-engine';
import { HeaderUtils } from 'coze-coding-dev-sdk';

const supabase = getSupabaseClient();

/**
 * POST /api/tasks/[taskId]/execute
 * 执行任务生成（带 Guardrail 自动重试）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  // 1. 获取任务，原子锁（只有 pending 可执行）
  const { data: task, error: fetchErr } = await supabase
    .from('generation_tasks')
    .select('*')
    .eq('task_id', taskId)
    .single();

  if (fetchErr || !task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  if (task.status !== 'pending') {
    return NextResponse.json({ error: `任务状态为 ${task.status}，不可重复执行` }, { status: 409 });
  }

  // 2. 原子更新 status → generating
  const { error: lockErr } = await supabase
    .from('generation_tasks')
    .update({ status: 'generating', started_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .eq('status', 'pending'); // 乐观锁

  if (lockErr) {
    return NextResponse.json({ error: '任务已被执行' }, { status: 409 });
  }

  // 3. 获取模型配置
  const toolSlug = task.tool_type || 'product-generator';

  let modelConfig: { model: string; providerSlug: string; apiUrl: string; apiKey: string } | null = null;

  // 从 utility_tools 表获取模型配置
  const { data: utilTool } = await supabase
    .from('utility_tools')
    .select('model_provider_id, model_name')
    .eq('slug', toolSlug)
    .single();

  if (utilTool?.model_provider_id) {
    const { data: provider } = await supabase
      .from('model_providers')
      .select('slug, api_url, api_key')
      .eq('id', utilTool.model_provider_id)
      .single();

    if (provider && utilTool.model_name) {
      modelConfig = {
        model: utilTool.model_name,
        providerSlug: provider.slug,
        apiUrl: provider.api_url,
        apiKey: provider.api_key,
      };
    }
  }

  // 4. 构建 Prompt（使用 Prompt Engine + Guardrail）
  const userPrompt = task.prompt || '';
  const style = task.style || undefined;
  const ratio = task.ratio || '1:1';
  const layoutMode = task.layout_mode || undefined;

  // 4a. Prompt Normalization（清洗用户输入）
  const cleanedPrompt = normalizePrompt(userPrompt);

  // 4b. 构建 Guardrail 增强后的 Prompt
  const promptResult = buildPrompt({
    prompt: cleanedPrompt,
    toolType: toolSlug,
    style,
    ratio,
    layoutMode,
    hasImage: !!(task.uploaded_images && (task.uploaded_images as string[]).length > 0),
  });

  const finalPrompt = promptResult.fullPrompt;
  const negativePrompt = promptResult.negativePrompt || buildNegativePrompt(toolSlug);
  const size = RATIO_TO_SIZE[ratio] || '1024x1024';

  // 5. 生成循环（带自动重试）
  const maxRetries = getMaxRetries();
  let lastError = '';
  let resultImages: Array<{ url: string }> = [];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 更新进度
      if (attempt > 0) {
        await supabase
          .from('generation_tasks')
          .update({
            progress: Math.min(90, 30 + attempt * 25),
            error_message: attempt > 0 ? `第${attempt}次重试中...` : null,
          })
          .eq('task_id', taskId);
      } else {
        await supabase
          .from('generation_tasks')
          .update({ progress: 30 })
          .eq('task_id', taskId);
      }

      // 调用模型生成
      // Build custom headers: MUST forward auth headers from original request for Coze SDK
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      // Also add API key/URL for OpenAI-compatible providers
      if (modelConfig?.apiKey) {
        customHeaders['Authorization'] = `Bearer ${modelConfig.apiKey}`;
      }
      if (modelConfig?.apiUrl) {
        customHeaders['X-Api-Url'] = modelConfig.apiUrl;
      }

      const result = await generateWithModel(
        finalPrompt,
        modelConfig?.model,
        size,
        customHeaders,
        toolSlug,
        (task.uploaded_images as string[])?.[0] || undefined,
        negativePrompt,
      );

      // 检查生成结果
      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        const imageUrls = result.imageUrls;

        // 4c. 结果验证（Guardrail validateGenerationResult）
        const validation = validateGenerationResult(imageUrls, toolSlug, task.count || 1);

        if (validation.passed) {
          // 验证通过，使用此结果
          resultImages = imageUrls.map((url: string) => ({ url }));
          break;
        } else if (validation.shouldRetry && attempt < maxRetries) {
          console.warn(`[Execute] 生成质量验证失败(第${attempt + 1}次): ${validation.issues.join(', ')}，将重试`);
          lastError = '生成质量不达标，正在重试...';
          continue;
        } else {
          // 验证不通过但已达到最大重试次数，仍然保存结果
          console.warn(`[Execute] 生成质量验证失败(达到最大重试次数): ${validation.issues.join(', ')}，仍保存结果`);
          resultImages = imageUrls.map((url: string) => ({ url }));
          break;
        }
      } else {
        const rawErr = result.error || '模型生成返回空结果';
        if (rawErr.includes('403') || rawErr.includes('Forbidden')) {
          lastError = '模型服务暂时不可用，请稍后重试';
        } else if (rawErr.includes('429') || rawErr.includes('Too Many')) {
          lastError = '生成次数已达上限，请稍后再试';
        } else if (rawErr.includes('timeout') || rawErr.includes('ETIMEDOUT')) {
          lastError = '生成超时，请检查网络后重试';
        } else {
          lastError = rawErr;
        }
        console.warn(`[Execute] 生成失败(第${attempt + 1}次): ${rawErr}`);
        if (attempt < maxRetries) continue;
      }
    } catch (genErr: any) {
      const rawMsg = genErr.message || '未知生成错误';
      // 对用户友好的错误消息
      if (rawMsg.includes('403') || rawMsg.includes('Forbidden')) {
        lastError = '模型服务暂时不可用，请稍后重试';
      } else if (rawMsg.includes('429') || rawMsg.includes('Too Many')) {
        lastError = '生成次数已达上限，请稍后再试';
      } else if (rawMsg.includes('timeout') || rawMsg.includes('ETIMEDOUT')) {
        lastError = '生成超时，请检查网络后重试';
      } else if (rawMsg.includes('ENOTFOUND') || rawMsg.includes('ECONNREFUSED')) {
        lastError = '网络连接异常，请稍后重试';
      } else {
        lastError = rawMsg;
      }
      console.error(`[Execute] 生成异常(第${attempt + 1}次):`, rawMsg);
      if (attempt < maxRetries) continue;
    }
  }

  // 6. 更新最终状态
  if (resultImages.length > 0) {
    await supabase
      .from('generation_tasks')
      .update({
        status: 'completed',
        progress: 100,
        result_images: resultImages,
        model_used: modelConfig?.model || 'unknown',
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('task_id', taskId);

    return NextResponse.json({
      success: true,
      taskId,
      status: 'completed',
      resultImages,
    });
  } else {
    await supabase
      .from('generation_tasks')
      .update({
        status: 'failed',
        error_message: lastError || '生成失败，请重试',
        completed_at: new Date().toISOString(),
      })
      .eq('task_id', taskId);

    return NextResponse.json({
      success: false,
      taskId,
      status: 'failed',
      error: lastError || '生成失败，请重试',
    });
  }
}
