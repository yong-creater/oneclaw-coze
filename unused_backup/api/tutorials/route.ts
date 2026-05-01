import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取教程列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('tutorials')
      .select('*', { count: 'exact' })
      .eq('status', 'published');
    
    // 工具筛选
    if (toolId) {
      query = query.eq('tool_id', parseInt(toolId));
    }
    
    // 分类筛选
    if (category) {
      query = query.eq('category', category);
    }
    
    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, count, error } = await query;
    
    if (error) {
      console.error('获取教程列表失败:', error);
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
    console.error('获取教程列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
