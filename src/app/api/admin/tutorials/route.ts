import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取教程列表（后台）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = client
      .from('tutorials')
      .select('*, tools(id, name, logo)', { count: 'exact' });
    
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }
    
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('获取教程列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}

// 创建教程
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    if (!body.title || !body.content || !body.category || !body.difficulty) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必填字段' 
      }, { status: 400 });
    }
    
    const { data, error } = await client
      .from('tutorials')
      .insert({
        title: body.title,
        content: body.content,
        tool_id: body.tool_id,
        category: body.category,
        difficulty: body.difficulty,
        cover_image: body.cover_image,
        author: body.author,
        status: body.status || 'published'
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建教程失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '创建失败' 
    }, { status: 500 });
  }
}

// 更新教程
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少教程ID' 
      }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    const updatableFields = [
      'title', 'content', 'tool_id', 'category', 'difficulty', 
      'cover_image', 'author', 'status', 'views', 'likes'
    ];
    
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    const { data, error } = await client
      .from('tutorials')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新教程失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '更新失败' 
    }, { status: 500 });
  }
}

// 删除教程
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少教程ID' 
      }, { status: 400 });
    }
    
    const { error } = await client
      .from('tutorials')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除教程失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '删除失败' 
    }, { status: 500 });
  }
}
