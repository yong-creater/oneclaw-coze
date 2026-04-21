import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 清理脏数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    if (body.secret !== 'oneclaw-clean-2024') {
      return NextResponse.json({ success: false, error: '密钥无效' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const results: Record<string, number> = {};
    const now = new Date().toISOString();

    // 1. 清理过期验证码
    const { count: expiredCodes } = await client.from('verification_codes')
      .delete().lt('expires_at', now);
    results.expired_codes = expiredCodes || 0;

    // 2. 清理过期会话
    const { count: expiredSessions } = await client.from('admin_sessions')
      .delete().lt('expires_at', now);
    results.expired_admin_sessions = expiredSessions || 0;

    const { count: userExpiredSessions } = await client.from('user_sessions')
      .delete().lt('expires_at', now);
    results.expired_user_sessions = userExpiredSessions || 0;

    // 3. 获取统计
    const { count: totalUsers } = await client.from('users').select('*', { count: 'exact' });
    results.total_users = totalUsers || 0;

    return NextResponse.json({ success: true, message: '清理完成', results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 查看统计
export async function GET() {
  try {
    const client = getSupabaseClient();
    const stats: Record<string, number> = {};

    const { count: totalUsers } = await client.from('users').select('*', { count: 'exact' });
    stats.total_users = totalUsers || 0;

    const { count: totalCodes } = await client.from('verification_codes').select('*', { count: 'exact' });
    stats.total_codes = totalCodes || 0;

    const { count: adminSessions } = await client.from('admin_sessions').select('*', { count: 'exact' });
    stats.admin_sessions = adminSessions || 0;

    const { count: userSessions } = await client.from('user_sessions').select('*', { count: 'exact' });
    stats.user_sessions = userSessions || 0;

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
