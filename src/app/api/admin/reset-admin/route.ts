import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword } from '@/lib/auth';

// 重置管理员密码（仅限生产环境首次使用）
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { secret_key, new_password } = body;

    // 简单的安全验证（防止滥用）
    const expectedKey = process.env.ADMIN_RESET_KEY || 'oneclaw-reset-2024';
    if (secret_key !== expectedKey) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的密钥' 
      }, { status: 403 });
    }

    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: '密码长度至少6位' 
      }, { status: 400 });
    }

    // 检查管理员是否存在
    const { data: existingAdmin } = await client
      .from('admin_users')
      .select('id, username')
      .eq('username', 'admin')
      .single();

    const passwordHash = await hashPassword(new_password);

    if (existingAdmin) {
      // 更新密码
      const { error } = await client
        .from('admin_users')
        .update({ 
          password_hash: passwordHash,
          must_change_password: false,
        })
        .eq('username', 'admin');

      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: '更新密码失败' 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: '管理员密码已重置',
        username: 'admin',
      });
    } else {
      // 创建管理员
      const { error } = await client
        .from('admin_users')
        .insert({
          username: 'admin',
          password_hash: passwordHash,
          email: 'admin@oneclaw.shop',
          role: 'super_admin',
          is_active: true,
          must_change_password: false,
        });

      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: '创建管理员失败' 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: '管理员账号已创建',
        username: 'admin',
      });
    }
  } catch (error) {
    console.error('重置管理员密码失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}
