import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** GET /api/quota/daily-generations — 获取用户今日剩余免费生成次数 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('user_token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const supabase = getSupabaseClient();

    // 验证用户身份
    const { data: session, error: sessionErr } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (sessionErr || !session) return NextResponse.json({ error: '会话过期' }, { status: 401 });

    // 查询今日已生成次数
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count, error: countErr } = await supabase
      .from('generation_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user_id)
      .gte('created_at', todayStart.toISOString())
      .in('status', ['completed', 'generating', 'pending']);

    if (countErr) {
      console.error('[quota] count error:', countErr);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    // 从数据库读取配置（支持后台动态调整）
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'daily_generation_limit')
      .single();

    const config = (settingData?.value as { limit?: number; unlimited?: boolean }) || {};
    const isUnlimited = config.unlimited === true;
    const DAILY_FREE_LIMIT = isUnlimited ? -1 : (config.limit ?? 3);
    const used = count ?? 0;
    const remaining = isUnlimited ? 999 : Math.max(0, DAILY_FREE_LIMIT - used);

    return NextResponse.json({
      limit: isUnlimited ? -1 : DAILY_FREE_LIMIT,
      used,
      remaining,
      unlimited: isUnlimited,
      canGenerate: isUnlimited || remaining > 0,
    });
  } catch (err) {
    console.error('[quota] error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
