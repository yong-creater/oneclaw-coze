/**
 * OneClaw 前端认证工具
 * 用于浏览器端
 */

import { AUTH_CONFIG, getMainDomain, getAppId } from './config.js';
import type { JWTPayload } from './jwt.js';

const COOKIE_NAME = AUTH_CONFIG.cookie.name;

/**
 * 获取当前域名的 Cookie
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * 设置 Cookie
 */
function setCookie(name: string, value: string, options: {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}) {
  if (typeof document === 'undefined') return;
  
  let cookieStr = `${name}=${value}`;
  
  if (options.maxAge !== undefined) {
    cookieStr += `; max-age=${options.maxAge}`;
  }
  if (options.path) {
    cookieStr += `; path=${options.path}`;
  }
  if (options.domain) {
    cookieStr += `; domain=${options.domain}`;
  }
  if (options.secure) {
    cookieStr += '; secure';
  }
  if (options.sameSite) {
    cookieStr += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookieStr;
}

/**
 * 清除 Cookie
 */
function clearCookie(name: string, domain?: string) {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; max-age=0; path=/${domain ? `; domain=${domain}` : ''}`;
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): JWTPayload | null {
  const token = getCookie(COOKIE_NAME);
  if (!token) return null;
  
  try {
    // 解码 JWT（不验证，用于获取用户信息）
    const payload = atob(token.split('.')[1]);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * 检查是否为管理员
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.userType === 'admin';
}

/**
 * 获取登录跳转 URL
 */
export function getLoginUrl(redirectUrl?: string): string {
  const currentPath = redirectUrl || (typeof window !== 'undefined' ? window.location.href : '/');
  return `https://${getMainDomain()}/login?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * 退出登录
 */
export function logout(redirectTo?: string) {
  const mainDomain = getMainDomain();
  const targetUrl = redirectTo || `https://${mainDomain}`;
  
  // 清除当前域名和主域名的 Cookie
  clearCookie(COOKIE_NAME);
  clearCookie(COOKIE_NAME, `.${mainDomain}`);
  
  // 跳转
  if (typeof window !== 'undefined') {
    window.location.href = targetUrl;
  }
}

/**
 * 跳转到登录页（如果未登录）
 */
export function requireAuth(callback?: () => void) {
  if (!isLoggedIn()) {
    window.location.href = getLoginUrl();
    return false;
  }
  
  if (callback) {
    callback();
  }
  
  return true;
}

/**
 * 跳转到登录页（如果非管理员）
 */
export function requireAdmin(callback?: () => void) {
  if (!isAdmin()) {
    window.location.href = '/';
    return false;
  }
  
  if (callback) {
    callback();
  }
  
  return true;
}

/**
 * 检查当前应用是否有权限访问
 */
export function checkAppPermission(appId: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // admin 可以访问所有应用
  if (user.userType === 'admin') return true;
  
  // 普通用户只能访问自己的应用
  return user.appId === appId;
}
