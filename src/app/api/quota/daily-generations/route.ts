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

    const DAILY_FREE_LIMIT = 3;
    const used = count ?? 0;
    const remaining = Math.max(0, DAILY_FREE_LIMIT - used);

    return NextResponse.json({
      limit: DAILY_FREE_LIMIT,
      used,
      remaining,
      canGenerate: remaining > 0,
    });
  } catch (err) {
    console.error('[quota] error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
