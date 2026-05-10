import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** GET /api/settings/daily-limit — 获取每日生成额度配置（公开） */
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'daily_generation_limit')
      .single();

    if (error || !data) {
      // 默认值
      return NextResponse.json({ limit: 3, unlimited: false });
    }

    const config = data.value as { limit?: number; unlimited?: boolean };
    return NextResponse.json({
      limit: config.unlimited ? -1 : (config.limit ?? 3),
      unlimited: config.unlimited ?? false,
    });
  } catch {
    return NextResponse.json({ limit: 3, unlimited: false });
  }
}
