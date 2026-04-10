import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword } from '@/lib/auth';

// 重置管理员密码
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { secret_key, new_password, environment } = body;

    // 根据环境选择密钥
    const devKey = process.env.ADMIN_RESET_KEY_DEV || 'oneclaw-dev-reset-2024';
    const prodKey = process.env.ADMIN_RESET_KEY || 'oneclaw-reset-2024';
    
    // 允许通过 environment 参数或 secret_key 后缀来区分环境
    const isDev = environment === 'dev' || request.headers.get('host')?.includes('dev.coze') || secret_key?.endsWith('-dev');
    const expectedKey = isDev ? devKey : prodKey;
    
    // 如果提供了带环境后缀的密钥，也接受
    const keyWithoutSuffix = secret_key?.replace(/-dev$/, '');
    if (keyWithoutSuffix !== expectedKey && secret_key !== expectedKey) {
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
      // 更新密码，并标记需要修改密码
      const { error } = await client
        .from('admin_users')
        .update({ 
          password_hash: passwordHash,
          must_change_password: true,
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
        message: `管理员密码已重置（${isDev ? '开发' : '生产'}环境），首次登录后需修改密码`,
        username: 'admin',
        environment: isDev ? 'dev' : 'prod',
      });
    } else {
      // 创建管理员，并标记需要修改密码
      const { error } = await client
        .from('admin_users')
        .insert({
          username: 'admin',
          password_hash: passwordHash,
          email: 'admin@oneclaw.shop',
          role: 'super_admin',
          is_active: true,
          must_change_password: true,
        });

      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: '创建管理员失败' 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `管理员账号已创建（${isDev ? '开发' : '生产'}环境）`,
        username: 'admin',
        environment: isDev ? 'dev' : 'prod',
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
