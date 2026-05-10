import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 生产环境为只读文件系统，ISR 缓存写入会 EROFS 报错；
// 且 ISR 可能在 RLS 修复前缓存空数据，导致页面空白。
// 强制动态渲染，每次请求都从数据库读取最新数据。
export const dynamic = 'force-dynamic';

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
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' }
    });
  } catch (err) {
    console.error('[utility-tools] Catch error:', err);
    return NextResponse.json({ success: false, error: String(err), tools: [] }, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  }
}
