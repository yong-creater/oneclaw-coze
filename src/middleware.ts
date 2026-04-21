import { NextRequest, NextResponse } from 'next/server';

// 简单的健康检查中间件
// 数据库初始化已移至 API 路由中自动处理

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路径，排除静态资源和 API 路由
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
