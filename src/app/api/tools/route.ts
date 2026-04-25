import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取前台工具列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // 筛选参数
    const category_slug = searchParams.get('category');
    const free_types = searchParams.get('free_types')?.split(',').filter(Boolean) || [];
    const feature_tags = searchParams.get('features')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search');
    
    const supabase = getSupabaseClient();

    // 先获取分类ID（如果需要按分类筛选）
    let categoryId: number | null = null;
    if (category_slug && category_slug !== 'all') {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .or(`slug.ilike.${category_slug},name.ilike.${category_slug}`)
        .limit(1)
        .single();
      categoryId = catData?.id || null;
    }

    // 构建基础查询
    let query = supabase
      .from('tools')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_active', true);

    // 分类筛选
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    // 免费类型筛选
    if (free_types.length > 0) {
      query = query.in('free_type', free_types);
    }
    
    // 搜索
    if (search) {
      query = query.or(`name.ilike.%${search}%,producer.ilike.%${search}%,highlight.ilike.%${search}%`);
    }
    
    // 排序和分页
    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, count, error } = await query;
    
    if (error) {
      console.error('获取工具列表失败:', error);
      return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
    }
    
    // 添加缓存头
    const cacheControl = search || free_types.length || feature_tags.length
      ? 'public, max-age=30, stale-while-revalidate=60'
      : 'public, max-age=60, stale-while-revalidate=300';
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      }
    }, {
      headers: { 'Cache-Control': cacheControl }
    });
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}
