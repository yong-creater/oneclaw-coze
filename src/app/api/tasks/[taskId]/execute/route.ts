import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithModel } from '@/lib/model-selector';
import { buildPrompt, ratioToSize } from '@/lib/prompt-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 3. 构建生成参数（使用独立 Prompt Engine）
    const { fullPrompt, toolLabel } = buildPrompt({
      prompt: (task.prompt as string) || '',
      toolType: (task.tool_type as string) || '',
      style: (task.style as string) || undefined,
      subtype: (task.generation_type as string) || undefined,
      ratio: (task.ratio as string) || undefined,
      layoutMode: (task.layout_mode as string) || undefined,
      hasImage: !!((task.uploaded_images as Array<{ url: string }>)?.length),
      count: (task.count as number) || 1,
    });
    const uploadedImages = (task.uploaded_images as Array<{ url: string }>) || [];
    const count = (task.count as number) || 1;
    const ratio = (task.ratio as string) || '1:1';
    const size = ratioToSize(ratio);

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
        size,
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
        title: `${toolLabel} #${idx + 1}`,
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
