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
    
    // 构建基础查询 - 只查询上架的工具
    let query = client
      .from('tools')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_active', true);
    
    // 分类筛选
    if (category_slug && category_slug !== 'all') {
      // 先获取分类ID
      const { data: category } = await client
        .from('categories')
        .select('id')
        .eq('slug', category_slug)
        .maybeSingle();
      
      if (category) {
        query = query.eq('category_id', category.id);
      }
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
    console.error('获取工具列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}
