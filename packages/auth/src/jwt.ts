/**
 * OneClaw JWT 工具函数
 */
import * as jose from 'jose';
import { AUTH_CONFIG } from './config.js';

// JWT Payload 类型
export interface JWTPayload {
  userId: number;
  userType: 'admin' | 'user';
  username?: string;
  email?: string;
  nickname?: string;
  avatarUrl?: string;
  appId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

// 签发 JWT Token
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss'>): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_CONFIG.jwt.secret);
  
  const token = await new jose.SignJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(AUTH_CONFIG.jwt.issuer)
    .setAudience(AUTH_CONFIG.jwt.audience)
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.jwt.expiresIn)
    .sign(secret);
  
  return token;
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(AUTH_CONFIG.jwt.secret);
    
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: AUTH_CONFIG.jwt.issuer,
      audience: AUTH_CONFIG.jwt.audience,
    });
    
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

// 解码 Token（不验证）
export function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = jose.decodeJwt(token);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// 生成 Cookie 配置
export function getCookieConfig(token: string) {
  return {
    name: AUTH_CONFIG.cookie.name,
    value: token,
    httpOnly: AUTH_CONFIG.cookie.httpOnly,
    secure: AUTH_CONFIG.cookie.secure,
    sameSite: AUTH_CONFIG.cookie.sameSite,
    maxAge: AUTH_CONFIG.cookie.maxAge,
    path: AUTH_CONFIG.cookie.path,
    domain: AUTH_CONFIG.cookie.domain,
  };
}
