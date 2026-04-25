/**
 * 模板列表 API
 * 
 * 前台获取模板列表接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const offset = (page - 1) * pageSize;
    
    // 筛选参数
    const category = searchParams.get('category') || 'all';
    const style = searchParams.get('style') || 'all';
    const search = searchParams.get('search') || '';

    // 构建查询（只获取激活的模板）
    let query = client
      .from('templates')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // 应用筛选
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    if (style !== 'all') {
      query = query.eq('style', style);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 应用排序和分页
    query = query
      .order('is_featured', { ascending: false })
      .order('usage_count', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('数据库查询失败:', error);
      // 如果数据库查询失败，返回空数据
      return NextResponse.json({
        success: true,
        data: {
          templates: [],
          pagination: { page, pageSize, total: 0, totalPages: 0 },
          stats: { total: 0, active: 0, totalUses: 0 },
          categories: [],
        },
      });
    }

    // 获取分类统计
    const { data: allTemplates } = await client
      .from('templates')
      .select('category')
      .eq('is_active', true);

    const categoryStats: Record<string, number> = {};
    allTemplates?.forEach((t: any) => {
      categoryStats[t.category] = (categoryStats[t.category] || 0) + 1;
    });

    const categories = Object.entries(categoryStats).map(([slug, count]) => ({
      slug,
      name: slug,
      count,
    }));

    // 计算统计数据
    const totalUses = data?.reduce((sum: number, t: any) => sum + (t.usage_count || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        templates: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
        stats: {
          total: count || 0,
          active: data?.filter((t: any) => t.is_active).length || 0,
          totalUses,
        },
        categories,
      },
    });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败'
    }, { status: 500 });
  }
}
