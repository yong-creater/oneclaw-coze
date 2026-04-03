import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const toolId = searchParams.get('tool_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (userId) {
      // 获取用户的收藏列表
      const offset = (page - 1) * limit;
      
      const { data: favorites, error, count } = await client
        .from('user_favorites')
        .select('*, tools(id, name, logo, producer, highlight, free_type, feature_tags, categories(name))', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: favorites || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      });
    }

    if (toolId) {
      // 检查工具是否被收藏
      const checkUserId = searchParams.get('check_user_id');
      if (!checkUserId) {
        return NextResponse.json({ success: false, error: '缺少check_user_id参数' }, { status: 400 });
      }

      const { data } = await client
        .from('user_favorites')
        .select('id')
        .eq('user_id', checkUserId)
        .eq('tool_id', toolId)
        .single();

      return NextResponse.json({
        success: true,
        data: { is_favorited: !!data }
      });
    }

    return NextResponse.json({ success: false, error: '缺少user_id或tool_id参数' }, { status: 400 });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { user_id, tool_id } = body;

    if (!user_id || !tool_id) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 检查是否已收藏
    const { data: existing } = await client
      .from('user_favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('tool_id', tool_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: '已收藏该工具' }, { status: 400 });
    }

    // 添加收藏
    const { data, error } = await client
      .from('user_favorites')
      .insert({ user_id, tool_id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const toolId = searchParams.get('tool_id');

    if (!userId || !toolId) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const { error } = await client
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '已取消收藏' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
