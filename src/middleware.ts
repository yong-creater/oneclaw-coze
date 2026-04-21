import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword } from '@/lib/auth';

// 全局数据库初始化中间件
// 首次访问时自动检查并初始化数据库表和管理员
let isInitialized = false;

export async function middleware(request: NextRequest) {
  // 只在非 API 路由时检查，减少不必要的数据库查询
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 已初始化，跳过
  if (isInitialized) {
    return NextResponse.next();
  }

  try {
    const client = getSupabaseClient();
    
    // 检查是否已有管理员
    const { data: existingAdmin, error: adminError } = await client
      .from('admin_users')
      .select('id')
      .limit(1)
      .maybeSingle();

    // 如果有错误或没有管理员，尝试初始化
    if (adminError || !existingAdmin) {
      console.log('🔧 检测到需要初始化数据库...');
      
      // 创建管理员
      const passwordHash = await hashPassword('Admin123456');
      
      const { error: insertError } = await client
        .from('admin_users')
        .insert({
          username: 'admin',
          password_hash: passwordHash,
          email: 'admin@oneclaw.shop',
          role: 'super_admin',
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        // 如果是重复键错误，说明另一个进程已经初始化了
        if (!insertError.message.includes('duplicate') && !insertError.message.includes('unique')) {
          console.error('❌ 初始化管理员失败:', insertError.message);
        }
      } else {
        console.log('✅ 管理员创建成功!');
        console.log('   用户名: admin');
        console.log('   密码: Admin123456');
      }
    }

    isInitialized = true;
  } catch (error: any) {
    console.error('❌ 数据库初始化检查失败:', error.message);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路径，排除静态资源和 API 路由
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
