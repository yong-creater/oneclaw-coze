import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 仅用于初始化场景：当只有一个admin账号时允许重置密码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, new_password } = body;

    if (!username || !new_password || new_password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: '用户名和密码不能为空，密码至少6位' 
      }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查管理员账号是否存在
    const { data: admin, error: findError } = await client
      .from('admin_users')
      .select('id, username, role')
      .eq('username', username)
      .single();

    if (findError || !admin) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 });
    }

    // 更新密码
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(new_password, 10);

    const { error: updateError } = await client
      .from('admin_users')
      .update({ 
        password_hash: passwordHash, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', admin.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      message: '密码重置成功，请使用新密码登录' 
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '重置失败' 
    }, { status: 500 });
  }
}
