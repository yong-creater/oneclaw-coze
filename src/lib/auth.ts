import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || 'oneclaw-admin-secret-key-2024';
const TOKEN_EXPIRES_IN = '24h';

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 简单密码比较（实际生产环境应使用bcrypt）
  if (hash === password) return true;
  
  // 尝试bcrypt比较
  try {
    return await bcrypt.compare(password, hash);
  } catch {
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
  
  const { data: user, error } = await client
    .from('admin_users')
    .select('id, username, password_hash, email, role, is_active')
    .eq('username', username)
    .single();
  
  if (error || !user) {
    return null;
  }
  
  if (!user.is_active) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
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
    .select('id, username, email, role, is_active')
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
