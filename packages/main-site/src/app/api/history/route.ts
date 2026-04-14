import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';

// 获取用户浏览历史
export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;
    
    const { data: history, error, count } = await client
      .from('user_history')
      .select('*, tools(id, name, logo, producer, highlight, free_type, feature_tags, categories(name))', { count: 'exact' })
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

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
    // 获取当前登录用户（可选登录）
    const currentUserId = await getOptionalUserId(request);
    
    if (!currentUserId) {
      // 未登录用户不记录浏览历史，但不报错
      return NextResponse.json({ success: true, message: '未登录，跳过记录' });
    }

    const client = getSupabaseClient();
    const body = await request.json();
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    // 检查是否已存在记录
    const { data: existing } = await client
      .from('user_history')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('tool_id', tool_id)
      .maybeSingle();

    let data, error;

    if (existing) {
      // 更新浏览时间
      const result = await client
        .from('user_history')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // 创建新记录
      const result = await client
        .from('user_history')
        .insert({ user_id: currentUserId, tool_id })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('记录浏览历史失败:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 清除浏览历史
export async function DELETE(request: NextRequest) {
  try {
    // 验证登录
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const client = getSupabaseClient();

    const { error } = await client
      .from('user_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '浏览历史已清除' });
  } catch (error) {
    console.error('清除浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
