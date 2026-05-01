import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
}

// GET - 获取榜单数据
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot'; // hot, new, free
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('tools')
      .select('id, name, logo, highlight, category_id, view_count, click_count, free_type, is_featured, categories(name)')
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('categories.slug', category);
    }

    const { data: tools, error } = await query;

    if (error) {
      console.error('获取榜单失败:', error);
      return NextResponse.json({ error: '获取榜单失败' }, { status: 500 });
    }

    // 格式化数据
    const rankings = (tools || []).map((tool: any, index: number) => ({
      rank: index + 1,
      id: tool.id,
      name: tool.name,
      logo: tool.logo,
      highlight: tool.highlight,
      view_count: tool.view_count || 0,
      click_count: tool.click_count || 0,
      free_type: tool.free_type,
      category: tool.categories?.name || '其他',
    }));

    return NextResponse.json({
      success: true,
      type,
      rankings,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
