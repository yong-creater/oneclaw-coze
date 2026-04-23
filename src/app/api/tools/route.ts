import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('tools')
      .select(`
        id, name, logo, producer, highlight, category_id,
        free_type, is_featured, feature_tags, official_url,
        promotion_url, view_count
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category_id', parseInt(category));
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,highlight.ilike.%${search}%`);
    }

    const { data: tools, error } = await query;

    if (error) throw error;

    // 获取分类信息
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('sort_order');

    // 关联分类
    const toolsWithCategory = tools?.map(tool => {
      const cat = categories?.find(c => c.id === tool.category_id);
      return {
        ...tool,
        category: cat
      };
    });

    return NextResponse.json({
      success: true,
      data: toolsWithCategory || []
    });
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}
