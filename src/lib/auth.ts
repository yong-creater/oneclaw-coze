import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// JWT Secret 配置 - 生产环境必须设置
const JWT_SECRET_CONFIG = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_CONFIG && JWT_SECRET_CONFIG.length > 0 
  ? JWT_SECRET_CONFIG 
  : 'oneclaw-dev-secret-fallback-2024';
const TOKEN_EXPIRES_IN = '24h';

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
  must_change_password?: boolean;
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 严格使用 bcrypt 比较，禁止明文比较
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (e: any) {
    console.error('[verifyPassword] bcrypt compare error:', e.message);
    return false;
  }
}

// 生成密码哈希
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// 生成JWT Token（使用jose，Edge Runtime兼容）
export async function generateToken(user: AdminUser): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRES_IN)
    .sign(secret);
}

// 兼容 createToken 别名
export const createToken = generateToken;

// 验证JWT Token（使用jose，Edge Runtime兼容）
export async function verifyToken(token: string): Promise<{ id: number; username: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: number; username: string; role: string };
  } catch {
    return null;
  }
}

// 从请求头获取Token
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

// 验证管理员用户
export async function authenticateAdmin(username: string, password: string): Promise<{ user: AdminUser; token: string } | null> {
  const client = getSupabaseClient();
  
  let user: any;
  let error: any;
  
  try {
    const result = await client
      .from('admin_users')
      .select('id, username, password_hash, email, role, is_active, must_change_password')
      .eq('username', username)
      .single();
    
    user = result.data;
    error = result.error;
  } catch (e: any) {
    // 表可能不存在，尝试创建管理员
    console.error('[Auth] 查询管理员失败，尝试初始化:', e.message);
    
    // 尝试初始化管理员
    await initializeAdminUser(client);
    
    // 重新查询
    const result = await client
      .from('admin_users')
      .select('id, username, password_hash, email, role, is_active, must_change_password')
      .eq('username', username)
      .single();
    
    user = result.data;
    error = result.error;
  }
  
  if (error || !user) {
    // 如果还是没有用户，说明表确实不存在
    console.error('[Auth] 管理员不存在或查询失败:', error?.message);
    return null;
  }
  
  if (!user.is_active) {
    console.log('[Auth] User is not active:', username);
    return null;
  }
  
  console.log('[Auth] Verifying password for:', username, 'hash:', user.password_hash.substring(0, 20) + '...');
  const isValid = await verifyPassword(password, user.password_hash);
  console.log('[Auth] Password verification result:', isValid);
  if (!isValid) {
    console.log('[Auth] Password invalid for user:', username);
    return null;
  }
  
  // 更新最后登录时间
  await client
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);
  
  const adminUser: AdminUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    must_change_password: user.must_change_password || false,
  };
  
  const token = await generateToken(adminUser);
  
  // 保存会话到数据库
  await client.from('admin_sessions').insert({
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  
  return { user: adminUser, token };
}

// 验证会话
export async function validateSession(token: string): Promise<AdminUser | null> {
  const decoded = await verifyToken(token);
  if (!decoded) {
    console.log('[Auth] Token verification failed');
    return null;
  }
  
  const client = getSupabaseClient();
  
  // 检查会话是否存在且未过期
  const { data: session, error } = await client
    .from('admin_sessions')
    .select('id, expires_at')
    .eq('token', token)
    .single();
  
  if (error || !session) {
    console.log('[Auth] Session not found in DB:', error?.message);
    return null;
  }
  
  // 检查是否过期
  if (new Date(session.expires_at) < new Date()) {
    console.log('[Auth] Session expired');
    // 删除过期会话
    await client.from('admin_sessions').delete().eq('token', token);
    return null;
  }
  
  // 获取用户信息
  const { data: user, error: userError } = await client
    .from('admin_users')
    .select('id, username, email, role, is_active, must_change_password')
    .eq('id', decoded.id)
    .single();
  
  if (userError || !user || !user.is_active) {
    console.log('[Auth] User not found or inactive:', userError?.message);
    return null;
  }
  
  console.log('[Auth] Session validated for user:', user.username);
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    must_change_password: user.must_change_password || false,
  };
}

// 登出
export async function logout(token: string): Promise<void> {
  try {
    const client = getSupabaseClient();
    await client.from('admin_sessions').delete().eq('token', token);
  } catch (error) {
    console.error('删除会话失败:', error);
  }
}

// 验证管理员 Token（用于 API 路由）
export async function verifyAdminToken(request: NextRequest): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const token = request.cookies.get('admin_token')?.value || 
                  getTokenFromHeader(request.headers.get('authorization'));

    if (!token) {
      return { success: false, error: '未登录' };
    }

    const user = await validateSession(token);
    
    if (!user) {
      return { success: false, error: '会话已过期' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('验证管理员 Token 失败:', error);
    return { success: false, error: '验证失败' };
  }
}

// 初始化管理员用户
async function initializeAdminUser(client: any): Promise<boolean> {
  try {
    console.log('[Auth] 尝试初始化管理员...');
    
    const passwordHash = await hashPassword('Admin123456');
    
    const { error } = await client
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
    
    if (error) {
      console.error('[Auth] 初始化管理员失败:', error.message);
      return false;
    }
    
    console.log('[Auth] 管理员初始化成功!');
    return true;
  } catch (e: any) {
    console.error('[Auth] 初始化管理员异常:', e.message);
    return false;
  }
}

// 简化版管理员权限验证（用于 API 路由）
export async function requireAdminAuth(request: NextRequest): Promise<{ user?: AdminUser; error?: string }> {
  try {
    const result = await verifyAdminToken(request);
    if (!result.success || !result.user) {
      return { error: result.error || '未授权' };
    }
    return { user: result.user };
  } catch (error) {
    console.error('[Auth] 权限验证异常:', error);
    return { error: '验证失败' };
  }
}

// ========== 增强版权限验证 ==========

import { Permission, Role, hasPermission, hasAnyPermission, hasAllPermissions, Roles } from './permissions';

// 权限验证选项
interface RequirePermissionOptions {
  requireAll?: boolean; // 是否需要所有权限，默认为 false（只需要任一权限）
}

// 增强版权限验证 - 检查用户是否拥有指定权限
export async function requirePermission(
  request: NextRequest,
  permission: Permission | Permission[],
  options: RequirePermissionOptions = {}
): Promise<{ user?: AdminUser; error?: string }> {
  try {
    // 首先进行基本认证
    const result = await verifyAdminToken(request);
    if (!result.success || !result.user) {
      return { error: result.error || '未授权' };
    }

    const { user } = result;
    const userRole = user.role as Role;

    // 超级管理员拥有所有权限
    if (userRole === Roles.SUPER_ADMIN) {
      return { user };
    }

    // 检查权限
    const permissions = Array.isArray(permission) ? permission : [permission];
    
    if (options.requireAll) {
      if (!hasAllPermissions(userRole, permissions)) {
        console.warn(`[Auth] User ${user.username} lacks required permissions: ${permissions.join(', ')}`);
        return { error: '权限不足' };
      }
    } else {
      if (!hasAnyPermission(userRole, permissions)) {
        console.warn(`[Auth] User ${user.username} lacks any of required permissions: ${permissions.join(', ')}`);
        return { error: '权限不足' };
      }
    }

    return { user };
  } catch (error) {
    console.error('[Auth] 权限验证异常:', error);
    return { error: '验证失败' };
  }
}

// 角色验证 - 检查用户是否拥有指定角色
export async function requireRole(
  request: NextRequest,
  allowedRoles: Role | Role[]
): Promise<{ user?: AdminUser; error?: string }> {
  try {
    const result = await verifyAdminToken(request);
    if (!result.success || !result.user) {
      return { error: result.error || '未授权' };
    }

    const { user } = result;
    const userRole = user.role as Role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      console.warn(`[Auth] User ${user.username} with role ${userRole} is not in allowed roles: ${roles.join(', ')}`);
      return { error: '角色权限不足' };
    }

    return { user };
  } catch (error) {
    console.error('[Auth] 角色验证异常:', error);
    return { error: '验证失败' };
  }
}

// 验证用户状态 - 检查用户是否被禁用或需要修改密码
export async function requireActiveUser(
  request: NextRequest
): Promise<{ user?: AdminUser; error?: string; needsPasswordChange?: boolean }> {
  try {
    const result = await verifyAdminToken(request);
    if (!result.success || !result.user) {
      return { error: result.error || '未授权' };
    }

    const { user } = result;

    if (!user.is_active) {
      return { error: '账户已被禁用' };
    }

    if (user.must_change_password) {
      return { user, needsPasswordChange: true };
    }

    return { user };
  } catch (error) {
    console.error('[Auth] 用户状态验证异常:', error);
    return { error: '验证失败' };
  }
}
