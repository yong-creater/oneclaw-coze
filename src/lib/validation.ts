/**
 * 数据验证与安全防护模块
 * 防止 SQL 注入、XSS、CSRF 等攻击
 */

import { z } from 'zod';

/**
 * 通用输入验证
 */
export const ValidationRules = {
  // ID 验证
  id: z.number().int().positive(),

  // Slug 验证（URL 友好）
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正确'),

  // 名称验证
  name: z.string()
    .min(1, '名称不能为空')
    .max(100, '名称不能超过100个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）【】\[\]]+$/, '名称包含非法字符'),

  // URL 验证
  url: z.string()
    .url('URL 格式不正确')
    .max(500, 'URL 太长'),

  // Email 验证
  email: z.string()
    .email('邮箱格式不正确')
    .max(100, '邮箱太长'),

  // 手机号验证
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),

  // 描述文本
  description: z.string()
    .max(2000, '描述不能超过2000个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_.,!?，。！？、；;:'"（）【】\[\]()\n\r]+$/, '描述包含非法字符'),

  // 密码验证
  password: z.string()
    .min(8, '密码至少8个字符')
    .max(50, '密码不能超过50个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),

  // 内容验证（富文本）
  content: z.string()
    .max(50000, '内容太长')
    .refine((val) => !containsScriptInjection(val), '内容包含非法脚本'),

  // 标签数组
  tags: z.array(z.string().max(50)).max(20, '标签不能超过20个'),

  // 排序
  sortOrder: z.number().int().min(0).max(9999),

  // 分页
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
};

// SQL 注入防护 - 检测危险 SQL 关键字
const DANGEROUS_SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|UNION)\b)/i,
  /(--|;|'|"|\/|\*)/,
  /(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/i,
  /\bWAITFOR\b/i,
  /\bBENCHMARK\b/i,
  /\bSLEEP\b/i,
];

export function containsSqlInjection(input: string): boolean {
  return DANGEROUS_SQL_PATTERNS.some(pattern => pattern.test(input));
}

// XSS 防护 - 检测危险的 HTML/JS 内容
const DANGEROUS_XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/i,
  /<iframe[^>]*>[\s\S]*?<\/iframe>/i,
  /javascript:/i,
  /on\w+\s*=/i, // 事件处理器
  /<object[^>]*>[\s\S]*?<\/object>/i,
  /<embed[^>]*>/i,
  /<link[^>]*>/i,
  /<meta[^>]*>/i,
  /expression\s*\(/i, // CSS 表达式
  /@import/i,
];

export function containsXss(input: string): boolean {
  return DANGEROUS_XSS_PATTERNS.some(pattern => pattern.test(input));
}

// Script 注入检测（宽松版本，用于富文本）
export function containsScriptInjection(input: string): boolean {
  return /<script/i.test(input) || /javascript:/i.test(input) || /on\w+\s*=/i.test(input);
}

// CSRF Token 验证（简化版，实际应使用更复杂的方案）
export function validateCsrfToken(token: string | null, sessionToken: string | null): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  // 使用 timingSafeEqual 防止时序攻击
  if (token.length !== sessionToken.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
  }
  return result === 0;
}

// 危险字符清理
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // 移除 < >
    .replace(/javascript:/gi, '') // 移除 javascript:
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim();
}

// URL 清理（防止 XSS 通过 URL）
export function sanitizeUrl(url: string): string {
  // 只允许 http, https, mailto 协议
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  try {
    const parsed = new URL(url);
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

// HTML 清理（用于富文本）
export function sanitizeHtml(html: string): string {
  // 移除所有危险标签
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'];
  let result = html;
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    result = result.replace(regex, '');
    // 也移除自闭合标签
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
    result = result.replace(selfClosingRegex, '');
  });

  // 移除危险属性
  result = result.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
  result = result.replace(/javascript:/gi, '');
  result = result.replace(/expression\s*\(/gi, '');

  return result;
}

// 文件上传验证
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}, options: {
  maxSize?: number;
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

  // 文件大小检查
  if (file.size > maxSize) {
    return { valid: false, error: `文件大小不能超过 ${maxSize / 1024 / 1024}MB` };
  }

  // 文件类型检查
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `不支持的文件类型：${file.type}` };
  }

  // 文件名安全检查
  if (containsXss(file.name) || containsSqlInjection(file.name)) {
    return { valid: false, error: '文件名包含非法字符' };
  }

  // 文件扩展名检查
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExts = allowedTypes.map(type => {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    return map[type];
  });

  if (ext && !allowedExts.includes(ext)) {
    return { valid: false, error: `不支持的文件扩展名：${ext}` };
  }

  return { valid: true };
}

// 数值范围验证
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// 字符串长度验证
export function validateLength(input: string, min: number, max: number): boolean {
  return input.length >= min && input.length <= max;
}

// IP 地址验证
export function validateIpAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }
  
  return ipv6Regex.test(ip);
}

// 验证器工厂函数
export function createValidator<T extends z.ZodType>(schema: T) {
  return {
    safeParse: (data: unknown) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const errors = result.error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return { success: false, errors };
      }
      return { success: true, data: result.data };
    },
    parse: (data: unknown) => schema.parse(data),
  };
}

// 常用验证模式
export const Validators = {
  // 工具相关
  createTool: z.object({
    name: ValidationRules.name,
    slug: ValidationRules.slug,
    description: ValidationRules.description.optional(),
    category_id: z.number().int().positive().optional(),
    logo: ValidationRules.url.optional(),
    official_url: ValidationRules.url.optional(),
    promotion_url: ValidationRules.url.optional(),
  }),

  updateTool: z.object({
    id: ValidationRules.id,
    name: ValidationRules.name.optional(),
    slug: ValidationRules.slug.optional(),
    description: ValidationRules.description.optional(),
    category_id: z.number().int().positive().optional(),
    logo: ValidationRules.url.optional(),
    official_url: ValidationRules.url.optional(),
    promotion_url: ValidationRules.url.optional(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
  }),

  // 模板相关
  createTemplate: z.object({
    name: ValidationRules.name,
    slug: ValidationRules.slug.optional(),
    description: ValidationRules.description.optional(),
    content: ValidationRules.content,
    template_type: z.enum(['prompts', 'workflows']).optional(),
    category: z.string().max(50).optional(),
    thumbnail: ValidationRules.url.optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: ValidationRules.sortOrder.optional(),
  }),

  // 用户相关
  createUser: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    email: ValidationRules.email,
    password: ValidationRules.password.optional(),
    role: z.enum(['super_admin', 'admin', 'editor', 'viewer']),
  }),

  updateUser: z.object({
    id: ValidationRules.id,
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
    email: ValidationRules.email.optional(),
    password: ValidationRules.password.optional(),
    role: z.enum(['super_admin', 'admin', 'editor', 'viewer']).optional(),
    is_active: z.boolean().optional(),
  }),

  // 登录相关
  login: z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
  }),

  // 分页查询
  pagination: z.object({
    page: ValidationRules.page.optional(),
    limit: ValidationRules.limit.optional(),
    search: z.string().max(100).optional(),
    sort: z.enum(['asc', 'desc']).optional(),
    order: z.string().max(50).optional(),
  }),
};
