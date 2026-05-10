import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithModel } from '@/lib/model-selector';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ===== Prompt 前缀 =====
const PRODUCT_FIDELITY_PREFIX = `CRITICAL: You MUST preserve the EXACT product from the reference image. The product's shape, color, material, proportions, and ALL visual details must remain IDENTICAL. ONLY change the background, lighting, and scene environment. NEVER deform, distort, or reimagine the product.

RULES:
1. Product MUST look EXACTLY like the reference image — same shape, color, material, proportions.
2. NEVER deform, distort, reshape, or stylize the product.
3. ONLY modify: background, lighting, scene, environment, and mood.
4. Output a photorealistic product photo in the specified style.`;

const XIAOHONGSHU_PREFIX = `Create a Xiaohongshu (Little Red Book) style cover image. Requirements:
1. Trendy, aesthetic, eye-catching composition
2. Soft, warm lighting with natural feel
3. Clean layout with visual focus
4. Social media optimized vertical format
5. Fashion/lifestyle aesthetic quality`;

const PHOTO_PREFIX = `Create a professional AI portrait photo. Requirements:
1. Maintain facial features and identity from reference photo
2. Apply the specified style naturally
3. Professional lighting and composition
4. High-quality magazine/campaign level output`;

// ===== 多角度拼图 Prompt =====
const MULTI_ANGLE_INSTRUCTION = `Create a SINGLE composite image showing the product from MULTIPLE angles in a clean grid/collage layout. The image should show the product from front, side, back, and detail views arranged in a professional product photography grid. Each angle should be clearly visible and well-lit.`;

function buildPrompt(task: Record<string, unknown>): string {
  const toolType = task.tool_type as string;
  const prompt = (task.prompt as string) || '';
  const style = task.style as string;
  const ratio = task.ratio as string;
  const layoutMode = (task.layout_mode as string) || 'single-product';

  let prefix = '';
  if (toolType === 'product-generator') prefix = PRODUCT_FIDELITY_PREFIX;
  else if (toolType === 'xiaohongshu-generator') prefix = XIAOHONGSHU_PREFIX;
  else if (toolType === 'ai-photo') prefix = PHOTO_PREFIX;

  let fullPrompt = prefix ? `${prefix}\n\nUser request: ${prompt}` : prompt;
  if (style) fullPrompt += `\nStyle: ${style}`;
  if (ratio) fullPrompt += `\nAspect ratio: ${ratio}`;

  // 布局模式：多角度拼图时追加拼图指令
  if (layoutMode === 'multi-angle') {
    fullPrompt += `\n\n${MULTI_ANGLE_INSTRUCTION}`;
  }

  return fullPrompt;
}

// POST /api/tasks/[taskId]/execute — 执行任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    // 1. 获取任务（带锁：只有 pending 状态可执行）
    const { data: task, error } = await supabase
      .from('generation_tasks')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    if (task.status !== 'pending') {
      return NextResponse.json({
        error: `任务状态为 ${task.status}，不可重复执行`,
        task,
      }, { status: 400 });
    }

    // 2. 原子更新：pending → generating
    const { error: lockError } = await supabase
      .from('generation_tasks')
      .update({
        status: 'generating',
        progress: 10,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('task_id', taskId)
      .eq('status', 'pending'); // 乐观锁

    if (lockError) {
      return NextResponse.json({ error: '任务已被锁定' }, { status: 409 });
    }

    // 3. 构建生成参数
    const fullPrompt = buildPrompt(task);
    const uploadedImages = (task.uploaded_images as Array<{ url: string }>) || [];
    const count = (task.count as number) || 1;
    const ratio = (task.ratio as string) || '1:1';

    // 4. 更新进度
    await supabase
      .from('generation_tasks')
      .update({ progress: 30, updated_at: new Date().toISOString() })
      .eq('task_id', taskId);

    // 5. 调用模型生成
    let resultImages: string[] = [];

    try {
      const images = uploadedImages.map((img) => img.url).filter(Boolean);
      const generateResult = await generateWithModel(
        fullPrompt,
        'coze-image',
        '2K',
        {},
        task.tool_type as string,
        images.length > 0 ? images : undefined
      );

      resultImages = generateResult.imageUrls || [];
    } catch (genErr) {
      // 生成失败
      await supabase
        .from('generation_tasks')
        .update({
          status: 'failed',
          error_message: genErr instanceof Error ? genErr.message : '生成失败',
          progress: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('task_id', taskId);

      return NextResponse.json({
        success: false,
        error: '生成失败',
        task: { ...task, status: 'failed' },
      }, { status: 500 });
    }

    // 6. 更新进度
    await supabase
      .from('generation_tasks')
      .update({ progress: 80, updated_at: new Date().toISOString() })
      .eq('task_id', taskId);

    // 7. 保存结果（result_images 统一为 [{url: string}] 格式）
    const formattedResults = resultImages.map(url => ({ url }));
    const { error: updateError } = await supabase
      .from('generation_tasks')
      .update({
        status: 'completed',
        progress: 100,
        result_images: formattedResults,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('task_id', taskId);

    if (updateError) {
      console.error('[Task Execute] 保存结果失败:', updateError);
    }

    // 8. 也保存到 user_generations（作品库）
    const userId = task.user_id as string;
    if (userId && resultImages.length > 0) {
      const insertData = resultImages.map((url, idx) => ({
        user_id: userId,
        tool_type: task.tool_type,
        prompt: task.prompt || '',
        image_url: url,
        parameters: {
          style: task.style,
          ratio: task.ratio,
          count,
          task_id: taskId,
        },
        title: `${task.tool_type === 'product-generator' ? 'AI商品图' : task.tool_type === 'xiaohongshu-generator' ? '小红书封面' : 'AI写真'} #${idx + 1}`,
      }));

      const { error: genError } = await supabase
        .from('user_generations')
        .insert(insertData);

      if (genError) {
        console.error('[Task Execute] 写入作品库失败:', genError);
      }
    }

    return NextResponse.json({ success: true, taskId, resultImages });
  } catch (err) {
    console.error('[Task Execute] error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
