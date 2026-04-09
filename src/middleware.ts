import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'oneclaw-admin-secret-key-2024';

// 需要认证的API路径前缀
const PROTECTED_PATHS = [
  '/api/admin/tools',
  '/api/admin/categories',
  '/api/admin/tags',
  '/api/admin/tutorials',
  '/api/admin/prompts',
  '/api/admin/reviews',
  '/api/admin/members',
  '/api/admin/orders',
  '/api/admin/ads',
  '/api/admin/init-data',
  '/api/admin/health-check',
];

// 只读路径（GET请求不需要认证）
const READ_ONLY_PATHS = [
  '/api/admin/stats',
];

// 首次初始化路径（无管理员时允许访问）
const FIRST_TIME_INIT_PATHS = [
  '/api/admin/init-production',
];

// 验证JWT Token（Edge Runtime兼容，使用jose）
async function verifyToken(token: string): Promise<{ id: number; username: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: number; username: string; role: string };
  } catch {
    return null;
  }
}

// 从请求头获取Token
function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是首次初始化路径
  const isFirstTimeInit = FIRST_TIME_INIT_PATHS.some(path => pathname.startsWith(path));
  
  if (isFirstTimeInit) {
    // 对于首次初始化路径，允许通过（在route中检查是否有管理员）
    return NextResponse.next();
  }
  
  // 检查是否是受保护的路径
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isReadOnlyPath = READ_ONLY_PATHS.some(path => pathname.startsWith(path));
  
  if (!isProtectedPath && !isReadOnlyPath) {
    return NextResponse.next();
  }
  
  // 只读路径的GET请求不需要认证
  if (isReadOnlyPath && request.method === 'GET') {
    return NextResponse.next();
  }
  
  // 获取Token
  const token = request.cookies.get('admin_token')?.value || 
                getTokenFromHeader(request.headers.get('authorization'));
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: '未授权访问，请先登录', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  
  // 验证JWT Token（仅验证签名和过期时间，不查数据库）
  const decoded = await verifyToken(token);
  
  if (!decoded) {
    return NextResponse.json(
      { success: false, error: '会话已过期，请重新登录', code: 'SESSION_EXPIRED' },
      { status: 401 }
    );
  }
  
  // 将用户信息添加到请求头，供后续API使用
  const response = NextResponse.next();
  response.headers.set('x-admin-user', JSON.stringify(decoded));
  response.headers.set('x-admin-token', token);
  
  return response;
}

export const config = {
  matcher: '/api/admin/:path*',
};
