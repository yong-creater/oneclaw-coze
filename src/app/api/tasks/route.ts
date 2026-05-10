import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyUserToken } from '@/lib/user-auth';
import { randomUUID } from 'crypto';

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

// POST /api/tasks — 创建生成任务
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, uploadedImages, toolType, generationType, style, ratio, count, layoutMode } = body;

    if (!toolType) {
      return NextResponse.json({ error: '缺少工具类型' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 并发检查：免费用户同时只能有1个generating任务
    const { data: activeTasks } = await supabase
      .from('generation_tasks')
      .select('task_id')
      .eq('user_id', userId)
      .eq('status', 'generating')
      .limit(1);

    if (activeTasks && activeTasks.length > 0) {
      return NextResponse.json({
        error: '你有任务正在生成中，请稍后再试',
        activeTaskId: activeTasks[0].task_id,
      }, { status: 429 });
    }

    const taskId = `task_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

    const { data, error } = await supabase
      .from('generation_tasks')
      .insert({
        task_id: taskId,
        user_id: userId,
        prompt: prompt || '',
        uploaded_images: uploadedImages || [],
        tool_type: toolType,
        generation_type: generationType || null,
        style: style || null,
        ratio: ratio || null,
        count: count || 1,
        layout_mode: layoutMode || 'single-product',
        status: 'pending',
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[Tasks] 创建任务失败:', error);
      return NextResponse.json({ error: '创建任务失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err) {
    console.error('[Tasks] POST error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// GET /api/tasks — 获取任务列表
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    let query = getSupabaseClient()
      .from('generation_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Tasks] 查询失败:', error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tasks: data });
  } catch (err) {
    console.error('[Tasks] GET error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
