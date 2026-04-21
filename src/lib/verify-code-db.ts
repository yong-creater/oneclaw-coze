// 验证码数据库存储
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 验证码有效期（秒）
export const CODE_EXPIRY = 10 * 60; // 10分钟

// 存储验证码到数据库
export async function storeCode(email: string, code: string, type: 'register' | 'login') {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${type}:${normalizedEmail}`;
  const expiresAt = new Date(Date.now() + CODE_EXPIRY * 1000).toISOString();

  // 删除旧的验证码
  await supabase
    .from('verification_codes')
    .delete()
    .eq('email_key', key);

  // 插入新验证码
  const { error } = await supabase
    .from('verification_codes')
    .insert({
      email_key: key,
      email: normalizedEmail,
      code,
      type,
      expires_at: expiresAt,
      used: false
    });

  if (error) {
    console.error('[storeCode] 存储验证码失败:', error);
  } else {
    console.log(`[storeCode] 验证码已存储: key=${key}, code=${code}`);
  }
}

// 验证验证码
export async function verifyCode(
  email: string,
  code: string,
  type: 'register' | 'login'
): Promise<{ valid: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${type}:${normalizedEmail}`;

  console.log(`[verifyCode] 查询验证码: key=${key}, code=${code}`);

  // 查询验证码
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email_key', key)
    .eq('code', code)
    .single();

  if (error || !data) {
    return { valid: false, error: '验证码不存在或已过期' };
  }

  // 检查是否已使用
  if (data.used) {
    return { valid: false, error: '验证码已使用' };
  }

  // 检查是否过期
  if (new Date(data.expires_at) < new Date()) {
    // 删除过期验证码
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email_key', key);
    return { valid: false, error: '验证码已过期' };
  }

  // 标记为已使用
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('email_key', key);

  return { valid: true };
}

// 获取验证码状态（用于调试）
export async function getCodeStatus(email: string, type: 'register' | 'login') {
  const supabase = getSupabaseClient();
  const key = `${type}:${email}`;

  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email_key', key)
    .single();

  if (error || !data) {
    return { exists: false };
  }

  const remaining = Math.max(0, Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000));

  return {
    exists: true,
    remaining,
    expired: remaining <= 0
  };
}
