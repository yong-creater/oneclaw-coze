import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 获取当前登录用户
    const currentUserId = await getOptionalUserId(request);

    // 检查工具是否被收藏
    if (toolId) {
      if (!currentUserId) {
        return NextResponse.json({
          success: true,
          data: { is_favorited: false }
        });
      }

      const { data } = await client
        .from('user_favorites')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('tool_id', toolId)
        .single();

      return NextResponse.json({
        success: true,
        data: { is_favorited: !!data }
      });
    }

    // 获取用户的收藏列表（需要登录）
    if (!currentUserId) {
      return NextResponse.json({
        success: false,
        error: '请先登录',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const offset = (page - 1) * limit;
    
    const { data: favorites, error, count } = await client
      .from('user_favorites')
      .select('*, tools(id, name, logo, producer, highlight, free_type, feature_tags, categories(name))', { count: 'exact' })
      .eq('user_id', currentUserId)
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
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const client = getSupabaseClient();
    const body = await request.json();
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    // 检查是否已收藏
    const { data: existing } = await client
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', tool_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: '已收藏该工具' }, { status: 400 });
    }

    // 添加收藏
    const { data, error } = await client
      .from('user_favorites')
      .insert({ user_id: userId, tool_id })
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
    // 验证登录
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (!toolId) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    const { error } = await client
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
