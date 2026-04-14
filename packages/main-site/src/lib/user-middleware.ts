import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '@/lib/user-auth';

// 验证用户是否登录
export async function requireAuth(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const token = request.cookies.get('user_token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: '请先登录', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  
  const user = await validateUserSession(token);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: '登录已过期，请重新登录', code: 'SESSION_EXPIRED' },
      { status: 401 }
    );
  }
  
  return { userId: user.user_id };
}

// 从请求中获取用户ID（可选登录）
export async function getOptionalUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('user_token')?.value;
  
  if (!token) {
    return null;
  }
  
  const user = await validateUserSession(token);
  return user?.user_id || null;
}
