import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 筛选参数
    const category = searchParams.get('category');
    const style = searchParams.get('style');
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search');

    // 构建查询
    let query = client
      .from('templates')
      .select('*', { count: 'exact' });

    // 应用筛选
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (style && style !== 'all') {
      query = query.eq('style', style);
    }
    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 应用排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    // 获取分类
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug')
      .eq('type', 'template');

    return NextResponse.json({
      success: true,
      data: data || [],
      categories: categories || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
      stats: {
        total: count || 0,
        active: data?.filter((t: any) => t.is_active).length || 0,
      }
    });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败'
    }, { status: 500 });
  }
}

// 创建模板
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, style, description, thumbnail, tags, is_active } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：名称和分类' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('templates')
      .insert({
        name,
        category,
        style: style || 'minimal',
        description: description || '',
        thumbnail: thumbnail || '',
        tags: tags || [],
        is_active: is_active !== false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('创建模板失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建失败'
    }, { status: 500 });
  }
}
