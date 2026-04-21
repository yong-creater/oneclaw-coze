import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword } from '@/lib/auth';

// 创建所有必要的表
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret_key, admin_password } = body;

    // 验证密钥
    if (secret_key !== 'oneclaw-setup-2024') {
      return NextResponse.json({ 
        success: false, 
        error: '无效的密钥' 
      }, { status: 403 });
    }

    const client = getSupabaseClient();
    const errors: string[] = [];

    // 1. 创建 admin_users 表
    console.log('创建 admin_users 表...');
    const { error: adminError } = await client.from('admin_users').insert({
      id: 1,
      username: 'admin',
      password_hash: await hashPassword(admin_password || 'Admin123456'),
      email: 'admin@oneclaw.shop',
      role: 'super_admin',
      is_active: true,
      created_at: new Date().toISOString(),
    }).select();

    if (adminError && !adminError.message.includes('duplicate')) {
      errors.push(`admin_users: ${adminError.message}`);
    }

    // 2. 创建 users 表
    console.log('创建 users 表...');
    const { error: usersError } = await client.from('users').insert({
      user_id: 'system-init',
      nickname: '系统初始化',
      created_at: new Date().toISOString(),
    }).select();

    if (usersError && !usersError.message.includes('duplicate')) {
      errors.push(`users: ${usersError.message}`);
    }

    // 3. 创建 categories 表
    console.log('创建 categories 表...');
    const { error: catError } = await client.from('categories').insert({
      id: 1,
      name: '视频生成',
      slug: 'video-generation',
      sort_order: 1,
    }).select();

    if (catError && !catError.message.includes('duplicate')) {
      errors.push(`categories: ${catError.message}`);
    }

    // 4. 创建 tags 表
    console.log('创建 tags 表...');
    const { error: tagError } = await client.from('tags').insert({
      id: 1,
      name: '文生视频',
      type: 'feature',
    }).select();

    if (tagError && !tagError.message.includes('duplicate')) {
      errors.push(`tags: ${tagError.message}`);
    }

    // 5. 创建 tools 表
    console.log('创建 tools 表...');
    const { error: toolError } = await client.from('tools').insert({
      id: 1,
      name: '测试工具',
      slug: 'test-tool',
    }).select();

    if (toolError && !toolError.message.includes('duplicate')) {
      errors.push(`tools: ${toolError.message}`);
    }

    // 6. 创建 verification_codes 表
    console.log('创建 verification_codes 表...');
    const { error: verifyError } = await client.from('verification_codes').insert({
      email_key: 'test:test@test.com',
      email: 'test@test.com',
      code: '123456',
      type: 'register',
      expires_at: new Date(Date.now() + 600000).toISOString(),
      used: false,
    }).select();

    if (verifyError && !verifyError.message.includes('duplicate')) {
      errors.push(`verification_codes: ${verifyError.message}`);
    }

    // 7. 创建 admin_sessions 表
    console.log('创建 admin_sessions 表...');
    const { error: sessionError } = await client.from('admin_sessions').insert({
      id: 1,
      user_id: 1,
      token: 'init-token',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    }).select();

    if (sessionError && !sessionError.message.includes('duplicate')) {
      errors.push(`admin_sessions: ${sessionError.message}`);
    }

    // 8. 创建 user_sessions 表
    console.log('创建 user_sessions 表...');
    const { error: userSessionError } = await client.from('user_sessions').insert({
      id: 1,
      user_id: 'system-init',
      token: 'init-token',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    }).select();

    if (userSessionError && !userSessionError.message.includes('duplicate')) {
      errors.push(`user_sessions: ${userSessionError.message}`);
    }

    if (errors.length > 0) {
      console.log('部分表创建失败:', errors);
      return NextResponse.json({
        success: false,
        error: '部分表创建失败',
        details: errors,
      }, { status: 500 });
    }

    console.log('✅ 数据库表创建成功！');
    return NextResponse.json({
      success: true,
      message: '数据库表创建成功！',
      admin: {
        username: 'admin',
        password: admin_password || 'Admin123456',
      },
    });

  } catch (error: any) {
    console.error('创建数据库表失败:', error);
    return NextResponse.json({
      success: false,
      error: `创建失败: ${error.message}`,
    }, { status: 500 });
  }
}
