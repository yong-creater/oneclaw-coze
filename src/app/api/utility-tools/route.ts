import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const revalidate = 0;

// 前台公开接口 - 获取活跃的工具列表
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('utility_tools')
      .select('id, name, slug, icon, description, cover_image, color, sort_order, use_cases')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[utility-tools] Supabase query error:', JSON.stringify(error));
      return NextResponse.json({ success: false, error: error.message, tools: [] }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    console.log('[utility-tools] Fetched tools:', data?.length || 0);

    return NextResponse.json({ success: true, tools: data || [] }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    console.error('[utility-tools] Catch error:', err);
    return NextResponse.json({ success: false, error: String(err), tools: [] }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}
