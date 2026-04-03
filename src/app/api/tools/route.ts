import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取前台工具列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
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
    
    // 构建基础查询 - 使用JOIN直接关联分类，避免额外查询
    let query = client
      .from('tools')
      .select('*, categories!inner(id, name, slug)', { count: 'exact' })
      .eq('is_active', true);
    
    // 分类筛选 - 直接用关联表的slug筛选
    if (category_slug && category_slug !== 'all') {
      query = query.eq('categories.slug', category_slug);
    }
    
    // 免费类型筛选
    if (free_types.length > 0) {
      query = query.in('free_type', free_types);
    }
    
    // 功能标签筛选 (使用数组重叠)
    if (feature_tags.length > 0) {
      query = query.contains('feature_tags', feature_tags);
    }
    
    // 搜索
    if (search) {
      query = query.or(`name.ilike.%${search}%,producer.ilike.%${search}%,highlight.ilike.%${search}%`);
    }
    
    // 排序：推荐优先，然后按创建时间降序
    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    
    // 添加缓存头，静态数据缓存更长时间
    const cacheControl = search || free_types.length || feature_tags.length
      ? 'public, max-age=30, stale-while-revalidate=60' // 有筛选参数，短缓存
      : 'public, max-age=60, stale-while-revalidate=300'; // 无筛选，长缓存
    
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
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}
