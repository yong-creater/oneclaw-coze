/**
 * OneClaw 认证中间件
 * 用于 Next.js App Router
 * 
 * 使用方式：
 * import { withAuth } from '@oneclaw/auth/middleware';
 * 
 * export default withAuth({
 *   // 配置
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JWTPayload } from './jwt.js';
import { AUTH_CONFIG, getMainDomain, getAppId } from './config.js';

// 中间件配置
export interface WithAuthOptions {
  // 需要管理员权限
  requireAdmin?: boolean;
  // 需要特定用户类型
  allowedUserTypes?: ('admin' | 'user')[];
  // 自定义回调
  callback?: (payload: JWTPayload, request: NextRequest) => NextResponse | Response | null;
  // 自定义未授权处理
  onUnauthorized?: (request: NextRequest) => NextResponse;
}

// 默认登录页
function getLoginUrl(request: NextRequest): string {
  const mainDomain = getMainDomain();
  const currentUrl = request.nextUrl.clone();
  
  // 构建重定向 URL
  const redirectUrl = `${currentUrl.origin}${currentUrl.pathname}${currentUrl.search}`;
  
  // 跳转到主站的登录页
  return `https://${mainDomain}/login?redirect=${encodeURIComponent(redirectUrl)}`;
}

// 验证请求的 Token
async function validateRequest(request: NextRequest): Promise<JWTPayload | null> {
  // 1. 尝试从 Cookie 获取
  const cookieToken = request.cookies.get(AUTH_CONFIG.cookie.name)?.value;
  
  if (cookieToken) {
    const payload = await verifyToken(cookieToken);
    if (payload) {
      return payload;
    }
  }
  
  // 2. 尝试从 Authorization Header 获取（API 请求）
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return await verifyToken(token);
  }
  
  return null;
}

// 认证中间件包装器
export function withAuth(options: WithAuthOptions = {}) {
  return async function AuthMiddleware(
    request: NextRequest
  ): Promise<NextResponse | Response | null> {
    const payload = await validateRequest(request);
    
    // 未登录
    if (!payload) {
      if (options.onUnauthorized) {
        return options.onUnauthorized(request);
      }
      return NextResponse.redirect(getLoginUrl(request));
    }
    
    // 检查管理员权限
    if (options.requireAdmin && payload.userType !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // 检查用户类型
    if (options.allowedUserTypes && !options.allowedUserTypes.includes(payload.userType)) {
      if (options.onUnauthorized) {
        return options.onUnauthorized(request);
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // 执行自定义回调
    if (options.callback) {
      const result = options.callback(payload, request);
      if (result) {
        return result;
      }
    }
    
    return null; // 继续执行
  };
}

// 获取当前用户（服务端组件用）
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  return await validateRequest(request);
}

// 创建响应并设置 Cookie
export function createAuthResponse(
  payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss'>,
  redirectTo?: string
): NextResponse {
  // Token 已经在主站签发，这里只是传递
  const response = redirectTo 
    ? NextResponse.redirect(new URL(redirectTo, `https://${getMainDomain()}`))
    : NextResponse.json({ success: true, data: payload });
  
  return response;
}

// 清除登录状态
export function clearAuthCookie(): { name: string; value: string; options: object } {
  return {
    name: AUTH_CONFIG.cookie.name,
    value: '',
    options: {
      httpOnly: true,
      secure: AUTH_CONFIG.cookie.secure,
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/',
      domain: AUTH_CONFIG.cookie.domain,
    },
  };
}
