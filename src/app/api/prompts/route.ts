import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取Prompt列表（前台公开，仅返回published状态）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = client
      .from('prompts')
      .select('id, title, content, category, tags, author, uses, created_at, tools(id, name, logo)')
      .eq('status', 'published');

    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query.order('uses', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      prompts: data || [],
    });
  } catch (error) {
    console.error('获取Prompt列表失败:', error);
    return NextResponse.json({
      success: true,
      prompts: [],
    });
  }
}
