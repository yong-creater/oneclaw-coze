import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取技能列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    const supabase = getSupabaseClient();
    
    // 构建基础查询
    let query = supabase
      .from('skills')
      .select('*, skill_categories(id, name, slug, color)', { count: 'exact' })
      .eq('is_active', true);
    
    // 分类筛选
    if (category && category !== 'all') {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        query = query.eq('category_id', categoryId);
      }
    }
    
    // 精选筛选
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    // 搜索
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // 排序和分页
    query = query
      .order('is_featured', { ascending: false })
      .order('view_count', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, count, error } = await query;
    
    if (error) {
      console.error('获取技能列表失败:', error);
      return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (error) {
    console.error('获取技能列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
