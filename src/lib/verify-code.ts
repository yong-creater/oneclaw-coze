// 验证码存储（适合单实例部署）
// 生产环境建议使用 Redis
const codeStore = new Map<string, { code: string; expiresAt: number; used: boolean; type: string }>();

// 验证码有效期（毫秒）
export const CODE_EXPIRY = 10 * 60 * 1000; // 10分钟

// 存储验证码
export function storeCode(email: string, code: string, type: 'register' | 'login') {
  const key = `${type}:${email}`;
  codeStore.set(key, {
    code,
    expiresAt: Date.now() + CODE_EXPIRY,
    used: false,
    type
  });
}

// 验证验证码
export async function verifyCode(
  email: string, 
  code: string, 
  type: 'register' | 'login'
): Promise<{ valid: boolean; error?: string }> {
  const key = `${type}:${email}`;
  const record = codeStore.get(key);

  if (!record) {
    return { valid: false, error: '验证码不存在或已过期' };
  }

  if (record.used) {
    return { valid: false, error: '验证码已使用' };
  }

  if (Date.now() > record.expiresAt) {
    codeStore.delete(key);
    return { valid: false, error: '验证码已过期' };
  }

  if (record.code !== code) {
    return { valid: false, error: '验证码错误' };
  }

  // 标记为已使用
  record.used = true;
  codeStore.delete(key);

  return { valid: true };
}

// 清理过期验证码（定时任务）
export function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [key, record] of codeStore.entries()) {
    if (now > record.expiresAt) {
      codeStore.delete(key);
    }
  }
}

// 获取验证码状态（用于调试）
export function getCodeStatus(email: string, type: 'register' | 'login') {
  const key = `${type}:${email}`;
  const record = codeStore.get(key);

  if (!record) {
    return { exists: false };
  }

  const remaining = Math.max(0, Math.floor((record.expiresAt - Date.now()) / 1000));

  return {
    exists: true,
    remaining,
    expired: remaining <= 0
  };
}
