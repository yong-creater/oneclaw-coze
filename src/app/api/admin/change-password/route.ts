import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, hashPassword } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { logSuccess, logFailure } from '@/lib/audit';

// 修改管理员密码
export async function POST(request: NextRequest) {
  // 需要登录才能修改密码
  const auth = await requirePermission(request, Permissions.SETTINGS_MANAGE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
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
      .eq('id', auth.user!.id);

    if (error) {
      await logFailure(auth.user, 'CHANGE_PASSWORD', 'ADMIN_USER', error.message, request);
      throw error;
    }

    await logSuccess(auth.user, 'CHANGE_PASSWORD', 'ADMIN_USER', auth.user!.id, '修改自己的密码', {}, request);
    return NextResponse.json({ 
      success: true, 
      message: '密码修改成功' 
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    await logFailure(auth.user, 'CHANGE_PASSWORD', 'ADMIN_USER', 'Unknown error', request);
    return NextResponse.json({ 
      success: false, 
      error: '修改失败' 
    }, { status: 500 });
  }
}
