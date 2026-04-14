/**
 * OneClaw 管理后台认证模块
 * 
 * 注意：这是管理后台专用的认证逻辑
 * 签发 Token 后，Cookie 会设置在根域名 .oneclaw.shop
 * 所有子应用都能共享这个 Cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { createClient } from '@supabase/supabase-js';

// ============ 配置 ============

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'dev-secret-change-in-production';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.oneclaw.shop';
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'oneclaw.shop';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ============ 类型 ============

interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

interface JWTPayload {
  userId: number;
  userType: 'admin';
  username: string;
  email?: string;
  role: string;
  appId: string;
}

// ============ JWT 工具 ============

async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss'>): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new jose.SignJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('oneclaw')
    .setAudience(['oneclaw', 'admin'])
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: 'oneclaw',
      audience: ['oneclaw', 'admin'],
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============ Supabase 客户端 ============

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============ 认证 API ============

/**
 * POST /api/auth/login
 * 管理员登录
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '请输入用户名和密码' },
        { status: 400 }
      );
    }
    
    const client = getSupabaseClient();
    
    // 查询管理员
    const { data: admin, error } = await client
      .from('admin_users')
      .select('id, username, password_hash, email, role')
      .eq('username', username)
      .eq('is_active', true)
      .single();
    
    if (error || !admin) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 验证密码
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 签发 Token
    const token = await signToken({
      userId: admin.id,
      userType: 'admin',
      username: admin.username,
      email: admin.email || undefined,
      role: admin.role,
      appId: 'admin',
    });
    
    // 创建响应
    const response = NextResponse.json({
      success: true,
      data: {
        userId: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      }
    });
    
    // 设置 Cookie（根域名，所有子域共享）
    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
      domain: COOKIE_DOMAIN,
    });
    
    return response;
    
  } catch (error) {
    console.error('[Admin Auth] Login error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * 退出登录
 */
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // 清除 Cookie
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    domain: COOKIE_DOMAIN,
  });
  
  return response;
}

/**
 * GET /api/auth/me
 * 获取当前管理员信息
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: '未登录' },
      { status: 401 }
    );
  }
  
  const payload = await verifyToken(token);
  
  if (!payload || payload.userType !== 'admin') {
    return NextResponse.json(
      { success: false, error: '未授权' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    }
  });
}
