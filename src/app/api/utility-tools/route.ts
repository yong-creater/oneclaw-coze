import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 5分钟服务端缓存 — 工具配置变更不频繁
export const revalidate = 300;

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
        headers: { 'Cache-Control': 'public, max-age=60' }
      });
    }

    return NextResponse.json({ success: true, tools: data || [] }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
    });
  } catch (err) {
    console.error('[utility-tools] Catch error:', err);
    return NextResponse.json({ success: false, error: String(err), tools: [] }, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  }
}
