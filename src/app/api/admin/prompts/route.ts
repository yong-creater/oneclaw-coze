import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// 获取Prompt列表（后台）
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.PROMPTS_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
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
      .from('prompts')
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
    console.error('获取Prompt列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}

// 创建Prompt
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.PROMPTS_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    // 输入安全检查
    if (body.title && (containsXss(body.title) || containsSqlInjection(body.title))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }
    if (body.content && (containsXss(body.content) || containsSqlInjection(body.content))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    if (!body.title || !body.content || !body.category) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必填字段' 
      }, { status: 400 });
    }
    
    const { data, error } = await client
      .from('prompts')
      .insert({
        title: body.title,
        content: body.content,
        tool_id: body.tool_id,
        category: body.category,
        tags: body.tags || [],
        author: body.author,
        status: body.status || 'published'
      })
      .select()
      .single();
    
    if (error) {
      await logFailure(auth.user, 'CREATE', 'PROMPT', error.message, request);
      throw error;
    }
    
    await logSuccess(auth.user, 'CREATE', 'PROMPT', data.id, body.title, { category: body.category }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建Prompt失败:', error);
    await logFailure(auth.user, 'CREATE', 'PROMPT', error instanceof Error ? error.message : 'Unknown', request);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '创建失败' 
    }, { status: 500 });
  }
}

// 更新Prompt
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.PROMPTS_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少Prompt ID' 
      }, { status: 400 });
    }
    
    // 输入安全检查
    if (body.title && (containsXss(body.title) || containsSqlInjection(body.title))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await client
      .from('prompts')
      .select('title')
      .eq('id', body.id)
      .single();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    const updatableFields = [
      'title', 'content', 'tool_id', 'category', 'tags', 
      'author', 'status', 'uses'
    ];
    
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    const { data, error } = await client
      .from('prompts')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) {
      await logFailure(auth.user, 'UPDATE', 'PROMPT', error.message, request);
      throw error;
    }
    
    await logSuccess(auth.user, 'UPDATE', 'PROMPT', body.id, oldData?.title || body.title, { changes: Object.keys(updateData) }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新Prompt失败:', error);
    await logFailure(auth.user, 'UPDATE', 'PROMPT', error instanceof Error ? error.message : 'Unknown', request);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '更新失败' 
    }, { status: 500 });
  }
}

// 删除Prompt
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.PROMPTS_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少Prompt ID' 
      }, { status: 400 });
    }
    
    // 获取删除前的数据用于日志
    const { data: promptData } = await client
      .from('prompts')
      .select('title')
      .eq('id', parseInt(id))
      .single();

    const { error } = await client
      .from('prompts')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) {
      await logFailure(auth.user, 'DELETE', 'PROMPT', error.message, request);
      throw error;
    }
    
    await logSuccess(auth.user, 'DELETE', 'PROMPT', parseInt(id), promptData?.title || 'Unknown', {}, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除Prompt失败:', error);
    await logFailure(auth.user, 'DELETE', 'PROMPT', error instanceof Error ? error.message : 'Unknown', request);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '删除失败' 
    }, { status: 500 });
  }
}
