import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 重置管理员密码（仅限超级管理员）
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const admin = await validateSession(token);
    if (!admin) {
      return NextResponse.json({ success: false, error: '登录已过期' }, { status: 401 });
    }

    // 只有超级管理员可以重置密码
    if (admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { new_password } = body;

    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: '密码长度至少6位' 
      }, { status: 400 });
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(new_password, 10);

    const client = getSupabaseClient();
    const { error } = await client
      .from('admin_users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', admin.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: '密码修改成功' 
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '重置失败' 
    }, { status: 500 });
  }
}
