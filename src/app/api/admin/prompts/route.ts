import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// GET /api/admin/prompts - 管理后台获取灵感库列表（包含所有状态）
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const offset = (page - 1) * pageSize;

    let query = client
      .from('prompts')
      .select('id, title, content, category, tags, author, uses, likes, is_featured, status, tool_id, created_at, updated_at', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query.order('updated_at', { ascending: false }).range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('获取灵感库列表失败:', error);
    return NextResponse.json({ success: false, error: '获取列表失败' }, { status: 500 });
  }
}

// POST /api/admin/prompts - 新增灵感
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { title, content, category, tags, is_featured, status } = body;
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, error: '标题和内容不能为空' }, { status: 400 });
    }

    const insertData: Record<string, unknown> = {
      title: title.trim(),
      content: content.trim(),
      category: category || '场景描述',
      tags: Array.isArray(tags) ? tags : [],
      is_featured: !!is_featured,
      status: status || 'published',
      author: 'OneClaw官方',
      uses: 0,
      likes: 0,
    };

    const { data, error } = await client
      .from('prompts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('新增灵感失败:', error);
    return NextResponse.json({ success: false, error: '新增失败' }, { status: 500 });
  }
}
