import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword } from '@/lib/auth';

// 重置管理员密码
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { secret_key, new_password, environment } = body;

    // 根据环境选择密钥（必须显式指定 environment 参数）
    const devKey = process.env.ADMIN_RESET_KEY_DEV || 'oneclaw-dev-reset-2024';
    const prodKey = process.env.ADMIN_RESET_KEY || 'oneclaw-reset-2024';
    
    // 显式通过 environment 参数区分环境（避免依赖 host 判断）
    const isDev = environment === 'dev';
    const isProd = environment === 'prod';
    
    // 如果显式指定了环境，使用对应密钥
    if (isDev) {
      // 开发环境
    } else if (isProd) {
      // 生产环境
    } else {
      // 没有显式指定环境，拒绝请求，避免误操作
      return NextResponse.json({ 
        success: false, 
        error: '必须显式指定 environment 参数（dev 或 prod）' 
      }, { status: 400 });
    }
    
    const expectedKey = isDev ? devKey : prodKey;
    
    // 验证密钥
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
