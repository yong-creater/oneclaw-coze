import { NextRequest, NextResponse } from 'next/server';
import { validateSession, hashPassword } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 修改管理员密码
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

    const body = await request.json();
    const { new_password } = body;

    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: '密码长度至少6位' 
      }, { status: 400 });
    }

    const passwordHash = await hashPassword(new_password);

    const client = getSupabaseClient();
    const { error } = await client
      .from('admin_users')
      .update({ 
        password_hash: passwordHash, 
        must_change_password: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', admin.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: '密码修改成功' 
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '修改失败' 
    }, { status: 500 });
  }
}
