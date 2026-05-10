import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyUserToken } from '@/lib/user-auth';

async function getUserId(request: NextRequest): Promise<string | null> {
  const tokenCookie = request.cookies.get('user_token');
  if (!tokenCookie?.value) return null;
  try {
    const user = await verifyUserToken(tokenCookie.value);
    return user?.user_id || null;
  } catch {
    return null;
  }
}

// GET /api/tasks/[taskId] — 获取任务状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('generation_tasks')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    // 只能查看自己的任务
    if (data.user_id !== userId) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err) {
    console.error('[Task] GET error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST /api/tasks/[taskId] — 重试失败任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseClient();

    const { data: task, error } = await supabase
      .from('generation_tasks')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    if (task.user_id !== userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    // 只有失败任务可重试
    if (task.status !== 'failed') {
      return NextResponse.json({ error: '只有失败的任务可以重试' }, { status: 400 });
    }

    // 检查并发
    const { data: activeTasks } = await supabase
      .from('generation_tasks')
      .select('task_id')
      .eq('user_id', userId)
      .eq('status', 'generating')
      .limit(1);

    if (activeTasks && activeTasks.length > 0) {
      return NextResponse.json({ error: '你有任务正在生成中' }, { status: 429 });
    }

    // 重置任务状态为 pending
    const { error: updateError } = await supabase
      .from('generation_tasks')
      .update({
        status: 'pending',
        progress: 0,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('task_id', taskId);

    if (updateError) {
      return NextResponse.json({ error: '重试失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, taskId });
  } catch (err) {
    console.error('[Task] POST error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
