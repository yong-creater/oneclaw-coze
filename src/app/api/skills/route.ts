import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('skills')
      .select(`
        *,
        skill_categories:id (
          id,
          name,
          slug,
          color
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('view_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category_id', parseInt(category));
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取技能列表失败:', error);
      return NextResponse.json({ success: false, error: '获取技能列表失败' }, { status: 500 });
    }

    // 更新浏览量
    if (data && data.length > 0) {
      const ids = data.map(s => s.id);
      try {
        await supabase.rpc('increment_skill_views', { skill_ids: ids });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取技能列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
