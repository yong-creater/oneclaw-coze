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
      .from('skills')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category_id', parseInt(category));
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: skills, error } = await query;

    if (error) throw error;

    // 获取分类信息
    const { data: categories } = await supabase
      .from('skill_categories')
      .select('id, name, slug')
      .order('sort_order');

    // 关联分类
    const skillsWithCategory = skills?.map(skill => {
      const cat = categories?.find(c => c.id === skill.category_id);
      return { ...skill, category: cat };
    });

    return NextResponse.json({
      success: true,
      data: skillsWithCategory || []
    });
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
