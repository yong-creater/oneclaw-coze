import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || 'oneclaw-sso-secret-key-2024';
const TOKEN_EXPIRES_IN = '30d'; // 用户Token有效期30天

export interface User {
  user_id: string;
  openid?: string;
  email?: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
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

// 生成用户ID
export function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `user_${timestamp}${random}`;
}

// 生成JWT Token
export async function generateUserToken(user: User): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new SignJWT({
    user_id: user.user_id,
    openid: user.openid,
    nickname: user.nickname,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRES_IN)
    .sign(secret);
}

// 验证JWT Token
export async function verifyUserToken(token: string): Promise<User | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as User;
  } catch {
    return null;
  }
}

// 创建或获取用户（通过openid）
export async function createOrGetUser(openid: string, nickname?: string, avatarUrl?: string): Promise<User> {
  const client = getSupabaseClient();
  
  // 查找已有用户
  const { data: existingUser } = await client
    .from('users')
    .select('*')
    .eq('openid', openid)
    .maybeSingle();
  
  if (existingUser) {
    // 更新最后登录时间
    await client
      .from('users')
      .update({ 
        last_login_at: new Date().toISOString(),
        nickname: nickname || existingUser.nickname,
        avatar_url: avatarUrl || existingUser.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id);
    
    return existingUser;
  }
  
  // 创建新用户
  const userId = generateUserId();
  const { data: newUser, error } = await client
    .from('users')
    .insert({
      user_id: userId,
      openid,
      nickname: nickname || `用户${userId.slice(-6)}`,
      avatar_url: avatarUrl,
      last_login_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error || !newUser) {
    throw new Error('创建用户失败');
  }
  
  return newUser;
}

// 通过user_id获取用户
export async function getUserById(userId: string): Promise<User | null> {
  const client = getSupabaseClient();
  
  const { data: user, error } = await client
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// 创建会话
export async function createUserSession(userId: string, token: string): Promise<void> {
  const client = getSupabaseClient();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30天后过期
  
  await client.from('user_sessions').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString()
  });
}

// 验证会话
export async function validateUserSession(token: string): Promise<User | null> {
  const decoded = await verifyUserToken(token);
  if (!decoded) {
    return null;
  }
  
  const client = getSupabaseClient();
  
  // 检查会话是否存在且未过期
  const { data: session, error } = await client
    .from('user_sessions')
    .select('id, expires_at')
    .eq('token', token)
    .maybeSingle();
  
  if (error || !session) {
    return null;
  }
  
  // 检查是否过期
  if (new Date(session.expires_at) < new Date()) {
    // 删除过期会话
    await client.from('user_sessions').delete().eq('token', token);
    return null;
  }
  
  // 获取用户信息
  return await getUserById(decoded.user_id);
}

// 删除会话（登出）
export async function deleteUserSession(token: string): Promise<void> {
  const client = getSupabaseClient();
  await client.from('user_sessions').delete().eq('token', token);
}

// 创建登录请求（用于扫码登录状态跟踪）
export async function createLoginRequest(sceneId: string): Promise<void> {
  const client = getSupabaseClient();
  
  // 设置5分钟过期
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  
  await client.from('login_requests').insert({
    scene_id: sceneId,
    status: 'pending', // pending, scanned, confirmed, expired
    expires_at: expiresAt.toISOString()
  });
}

// 检查登录请求状态
export async function checkLoginRequest(sceneId: string): Promise<{
  status: 'pending' | 'scanned' | 'confirmed' | 'expired';
  user?: User;
  token?: string;
}> {
  const client = getSupabaseClient();
  
  const { data: loginRequest, error } = await client
    .from('login_requests')
    .select('*')
    .eq('scene_id', sceneId)
    .maybeSingle();
  
  if (error || !loginRequest) {
    return { status: 'expired' };
  }
  
  // 检查是否过期
  if (new Date(loginRequest.expires_at) < new Date()) {
    await client.from('login_requests').delete().eq('scene_id', sceneId);
    return { status: 'expired' };
  }
  
  // 如果已确认，获取用户信息
  if (loginRequest.status === 'confirmed' && loginRequest.user_id) {
    const user = await getUserById(loginRequest.user_id);
    const token = loginRequest.token;
    
    // 清理登录请求
    await client.from('login_requests').delete().eq('scene_id', sceneId);
    
    return { status: 'confirmed', user: user || undefined, token };
  }
  
  return { status: loginRequest.status };
}

// 更新登录请求状态（微信回调时调用）
export async function updateLoginRequest(
  sceneId: string, 
  status: 'scanned' | 'confirmed',
  userId?: string,
  token?: string
): Promise<void> {
  const client = getSupabaseClient();
  
  await client
    .from('login_requests')
    .update({
      status,
      user_id: userId,
      token,
      updated_at: new Date().toISOString()
    })
    .eq('scene_id', sceneId);
}

// 获取微信二维码URL
export async function getWechatQRCode(): Promise<{ qrUrl: string; sceneId: string }> {
  const client = getSupabaseClient();
  
  const { data: config } = await client
    .from('wechat_config')
    .select('qr_code_url, app_id, app_secret')
    .single();
  
  // 生成唯一的场景ID（用于标识这次登录请求）
  const sceneId = `login_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  // 创建登录请求记录
  await createLoginRequest(sceneId);
  
  // 如果有配置，生成带参数的二维码URL
  // 实际生产环境需要调用微信API生成带参数二维码
  // 这里返回配置的二维码URL或默认占位图
  
  const qrUrl = config?.qr_code_url || generatePlaceholderQR(sceneId);
  
  return { qrUrl, sceneId };
}

// 生成占位二维码（开发环境）
function generatePlaceholderQR(sceneId: string): string {
  // 使用在线二维码生成服务生成一个带场景ID的二维码
  // 实际生产环境应该调用微信API
  const content = `oneclaw://login?scene=${sceneId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content)}`;
}

// 模拟微信登录（开发环境使用）
export async function mockWechatLogin(): Promise<{ user: User; token: string }> {
  // 生成模拟的openid
  const mockOpenid = `mock_openid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  // 创建或获取用户
  const user = await createOrGetUser(mockOpenid, undefined, undefined);
  
  // 生成Token
  const token = await generateUserToken(user);
  
  // 创建会话
  await createUserSession(user.user_id, token);
  
  return { user, token };
}

// ============================================================
// 邮箱登录相关函数
// ============================================================

// 检查邮箱是否已注册
export async function checkEmailExists(email: string): Promise<boolean> {
  const client = getSupabaseClient();
  
  const { data } = await client
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  
  return !!data;
}

// 邮箱注册
export async function registerWithEmail(
  email: string,
  password: string,
  nickname?: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  const client = getSupabaseClient();
  
  try {
    // 检查邮箱是否已存在
    const { data: existingUser } = await client
      .from('users')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (existingUser) {
      return { success: false, error: '该邮箱已被注册' };
    }
    
    // 加密密码
    const passwordHash = await hashPassword(password);
    
    // 生成用户ID
    const userId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // 创建用户 - 使用user_id作为唯一标识，id使用数据库自增
    const { data: newUser, error: userError } = await client
      .from('users')
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        encrypted_password: passwordHash,
        nickname: nickname || email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (userError) {
      console.error('[注册] 创建用户失败, userError:', JSON.stringify(userError));
      return { success: false, error: '注册失败，请稍后重试' };
    }
    
    // 生成Token
    const token = await generateUserToken(newUser);
    
    // 创建会话
    await createUserSession(userId, token);
    
    return { success: true, user: newUser, token };
  } catch (err) {
    console.error('[注册] 邮箱注册异常:', err);
    return { success: false, error: '注册失败，请稍后重试' };
  }
}

// 邮箱登录
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  const client = getSupabaseClient();
  
  try {
    // 查找用户
    const { data: user, error: userError } = await client
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (userError || !user) {
      return { success: false, error: '邮箱或密码错误' };
    }
    
    // 验证密码 - 使用表中的实际字段名 encrypted_password
    const isValid = await verifyPassword(password, user.encrypted_password);
    if (!isValid) {
      return { success: false, error: '邮箱或密码错误' };
    }
    
    // 生成Token
    const token = await generateUserToken(user);
    
    // 创建会话
    await createUserSession(user.id, token);
    
    return { success: true, user, token };
  } catch (err) {
    console.error('邮箱登录错误:', err);
    return { success: false, error: '登录失败，请稍后重试' };
  }
}

// 获取所有用户列表（用于后台管理）
export async function getAllUsers(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ users: User[]; total: number }> {
  const client = getSupabaseClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const offset = (page - 1) * pageSize;
  
  let query = client
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);
  
  if (options?.search) {
    query = query.or(`email.ilike.%${options.search}%,nickname.ilike.%${options.search}%`);
  }
  
  const { data: users, count, error } = await query;
  
  if (error) {
    console.error('获取用户列表失败:', error);
    return { users: [], total: 0 };
  }
  
  return { users: (users || []) as User[], total: count || 0 };
}
