import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户浏览历史
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = getSupabaseClient();

    const { data: history, count } = await supabase
      .from('user_history')
      .select(`
        *,
        tools (
          id,
          name,
          logo,
          producer,
          highlight,
          free_type,
          feature_tags,
          categories (name)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({
      success: true,
      data: history || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 记录浏览历史
export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getOptionalUserId(request);

    if (!currentUserId) {
      return NextResponse.json({ success: true, message: '未登录，跳过记录' });
    }

    const body = await request.json();
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 检查是否已有记录
    const { data: existing } = await supabase
      .from('user_history')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('tool_id', tool_id)
      .single();

    if (existing) {
      // 更新浏览时间
      await supabase
        .from('user_history')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // 创建新记录
      await supabase
        .from('user_history')
        .insert({ user_id: currentUserId, tool_id, viewed_at: new Date().toISOString() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 清除浏览历史
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const supabase = getSupabaseClient();
    await supabase
      .from('user_history')
      .delete()
      .eq('user_id', userId);

    return NextResponse.json({ success: true, message: '浏览历史已清除' });
  } catch (error) {
    console.error('清除浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
