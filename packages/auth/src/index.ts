/**
 * OneClaw Auth SDK
 * 统一认证解决方案
 * 
 * @example
 * // 服务端
 * import { withAuth, verifyToken } from '@oneclaw/auth';
 * 
 * export async function GET(request: Request) {
 *   const user = await verifyToken(request);
 *   if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   // ...
 * }
 * 
 * // 前端
 * import { isLoggedIn, getCurrentUser, logout } from '@oneclaw/auth';
 */

// 配置
export { AUTH_CONFIG, getAppId, getMainDomain, getAdminDomain } from './config.js';

// JWT
export { signToken, verifyToken, decodeToken, getCookieConfig, type JWTPayload } from './jwt.js';

// 服务端中间件
export { withAuth, getCurrentUser, createAuthResponse, clearAuthCookie } from './middleware.js';

// 前端工具
export {
  getCurrentUser,
  isLoggedIn,
  isAdmin,
  getLoginUrl,
  logout,
  requireAuth,
  requireAdmin,
  checkAppPermission,
} from './client.js';
