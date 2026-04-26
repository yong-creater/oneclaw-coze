import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: '请输入用户名和密码' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 查询管理员
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return NextResponse.json({ success: false, error: '用户名或密码错误' }, { status: 401 });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return NextResponse.json({ success: false, error: '用户名或密码错误' }, { status: 401 });
    }

    // 生成 token
    const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

    // 保存会话
    await supabase.from('admin_sessions').insert({
      user_id: admin.id,
      token,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
