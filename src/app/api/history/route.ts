import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户浏览历史
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少user_id参数' }, { status: 400 });
    }

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
    const client = getSupabaseClient();
    const body = await request.json();
    const { user_id, tool_id } = body;

    if (!user_id || !tool_id) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 记录浏览历史
    const { data, error } = await client
      .from('user_history')
      .insert({ user_id, tool_id })
      .select()
      .single();

    if (error) {
      // 如果失败，可能是唯一约束冲突，尝试更新时间
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
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少user_id参数' }, { status: 400 });
    }

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
