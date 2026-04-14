/**
 * OneClaw 统一认证配置
 */

// 共享配置（所有应用使用相同的值）
export const AUTH_CONFIG = {
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-shared-jwt-secret-change-in-production',
    issuer: 'oneclaw',
    audience: ['oneclaw', 'admin', 'app', 'writer'] as const,
    expiresIn: '30d' as const,
  },
  
  // Cookie 配置
  cookie: {
    name: 'access_token',
    domain: process.env.COOKIE_DOMAIN || '.oneclaw.shop',  // 根域名，所有子域共享
    maxAge: 30 * 24 * 60 * 60, // 30天（秒）
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
  
  // 用户类型
  userTypes: {
    admin: 'admin',     // 管理员
    user: 'user',       // 普通用户
  } as const,
  
  // 默认跳转
  defaultRedirect: '/',
  loginPath: '/login',
};

/**
 * 获取当前应用标识
 * 用于区分不同应用的 Token
 */
export function getAppId(): string {
  // admin.oneclaw.shop -> 'admin'
  // oneclaw.shop -> 'oneclaw'
  // app.oneclaw.shop -> 'app'
  // writer.oneclaw.shop -> 'writer'
  
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host.split('.')[0];
  }
  
  return process.env.APP_ID || 'oneclaw';
}

/**
 * 获取完整域名
 */
export function getMainDomain(): string {
  return process.env.MAIN_DOMAIN || 'oneclaw.shop';
}

/**
 * 获取管理后台域名
 */
export function getAdminDomain(): string {
  return process.env.ADMIN_DOMAIN || 'admin.oneclaw.shop';
}
