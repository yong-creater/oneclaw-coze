import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 验证管理员身份 */
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;

  const supabase = getSupabaseClient();
  const { data: session } = await supabase
    .from('admin_sessions')
    .select('user_id, admin_users(role)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  return session ? (session.admin_users as unknown as { role: string }) : null;
}

/** GET /api/admin/settings — 获取所有配置 */
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key');

  if (error) return NextResponse.json({ error: '查询失败' }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

/** PATCH /api/admin/settings — 更新配置 */
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: '缺少 key 或 value' }, { status: 400 });
    }

    // 验证 daily_generation_limit 的值
    if (key === 'daily_generation_limit') {
      if (typeof value !== 'object' || value === null) {
        return NextResponse.json({ error: '值格式错误' }, { status: 400 });
      }
      if (value.unlimited !== true && value.unlimited !== false) {
        return NextResponse.json({ error: 'unlimited 必须为布尔值' }, { status: 400 });
      }
      if (!value.unlimited && (typeof value.limit !== 'number' || value.limit < 0)) {
        return NextResponse.json({ error: 'limit 必须为非负整数' }, { status: 400 });
      }
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      console.error('[settings] upsert error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[settings] PATCH error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
