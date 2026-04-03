import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取Prompt列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // 检查表是否存在
    try {
      let query = client
        .from('prompts')
        .select('*, tools(id, name, logo)', { count: 'exact' })
        .eq('status', 'published')
        .order('uses', { ascending: false });

      if (toolId) {
        query = query.eq('tool_id', toolId);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const offset = (page - 1) * limit;
      const { data: prompts, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        // 如果表不存在，返回空数据
        if (error.message.includes('Could not find')) {
          return NextResponse.json({
            success: true,
            data: [],
            pagination: { page, limit, total: 0, total_pages: 0 }
          });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: prompts || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (tableError) {
      // 表不存在时返回空数据
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, total_pages: 0 }
      });
    }
  } catch (error) {
    console.error('获取Prompt失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建Prompt
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { title, content, tool_id, category, tags, author } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const { data, error } = await client
      .from('prompts')
      .insert({
        title,
        content,
        tool_id,
        category,
        tags: tags || [],
        author,
        status: 'published'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建Prompt失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 增加使用次数
export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id参数' }, { status: 400 });
    }

    // 获取当前使用次数
    const { data: prompt } = await client
      .from('prompts')
      .select('uses')
      .eq('id', id)
      .single();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt不存在' }, { status: 404 });
    }

    // 更新使用次数
    const { error } = await client
      .from('prompts')
      .update({ uses: (prompt.uses || 0) + 1 })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新Prompt失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
