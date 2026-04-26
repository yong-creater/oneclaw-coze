/**
 * 操作日志审计模块
 * 记录所有敏感操作，用于安全审计
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
}

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'STATUS_CHANGE'
  | 'CHANGE_PASSWORD'
  | 'BATCH_UPDATE'
  | 'MODERATE'
  | 'UPLOAD';

export type AuditResource = 
  | 'TOOL'
  | 'UTILITY_TOOL'
  | 'UTILITY_GROUP'
  | 'TEMPLATE'
  | 'CATEGORY'
  | 'TUTORIAL'
  | 'PROMPT'
  | 'MEMBER'
  | 'REVIEW'
  | 'ORDER'
  | 'AD'
  | 'USER'
  | 'GROUP'
  | 'ADMIN_USER'
  | 'SYSTEM';

interface AuditLogEntry {
  user_id: string;
  username: string;
  action: AuditAction;
  resource: AuditResource;
  resource_id?: string;
  resource_name?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
}

// 操作描述映射
export const AuditActionDescriptions: Record<AuditAction, string> = {
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
  VIEW: '查看',
  LOGIN: '登录',
  LOGOUT: '退出登录',
  LOGIN_FAILED: '登录失败',
  PASSWORD_CHANGE: '修改密码',
  PERMISSION_CHANGE: '权限变更',
  STATUS_CHANGE: '状态变更',
  CHANGE_PASSWORD: '修改密码',
  BATCH_UPDATE: '批量更新',
  MODERATE: '审核',
  UPLOAD: '上传',
};

export const AuditResourceDescriptions: Record<AuditResource, string> = {
  TOOL: 'AI应用',
  UTILITY_TOOL: '精选工具',
  UTILITY_GROUP: '精选工具分组',
  TEMPLATE: '模板',
  CATEGORY: '分类',
  TUTORIAL: '教程',
  PROMPT: '提示词',
  MEMBER: '会员',
  REVIEW: '评论',
  ORDER: '订单',
  AD: '广告',
  USER: '用户',
  GROUP: '分组',
  ADMIN_USER: '管理员',
  SYSTEM: '系统',
};

/**
 * 记录操作日志
 */
export async function logAudit(
  entry: AuditLogEntry,
  request?: Request
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // 获取IP和User-Agent
    let ipAddress = 'unknown';
    let userAgent = 'unknown';
    
    if (request) {
      ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
      userAgent = request.headers.get('user-agent') || 'unknown';
    }

    const logEntry = {
      ...entry,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    };

    // 异步写入日志，不阻塞主流程
    supabase
      .from('admin_audit_logs')
      .insert(logEntry)
      .then(({ error }) => {
        if (error) {
          console.error('[Audit] Failed to write audit log:', error);
        }
      });
  } catch (error) {
    // 审计日志记录失败不应该影响主流程
    console.error('[Audit] Exception while writing audit log:', error);
  }
}

/**
 * 记录成功操作
 */
export async function logSuccess(
  user: AdminUser | null | undefined,
  action: AuditAction,
  resource: AuditResource,
  resourceId?: string | number,
  resourceName?: string,
  details?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  await logAudit({
    user_id: String(user?.id || 'unknown'),
    username: user?.username || 'unknown',
    action,
    resource,
    resource_id: String(resourceId),
    resource_name: resourceName,
    details,
    success: true,
  }, request as unknown as Request);
}

/**
 * 记录失败操作
 */
export async function logFailure(
  user: AdminUser | null | undefined,
  action: AuditAction,
  resource: AuditResource,
  errorMessage: string,
  request?: Request
): Promise<void> {
  await logAudit({
    user_id: String(user?.id || 'anonymous'),
    username: user?.username || 'anonymous',
    action,
    resource,
    success: false,
    error_message: errorMessage,
  }, request as unknown as Request);
}

/**
 * 记录登录操作
 */
export async function logLogin(
  user: string,
  success: boolean,
  errorMessage?: string,
  request?: Request
): Promise<void> {
  await logAudit({
    user_id: 'auth',
    username: user,
    action: success ? 'LOGIN' : 'LOGIN_FAILED',
    resource: 'SYSTEM',
    success,
    error_message: errorMessage,
  }, request as unknown as Request);
}

/**
 * 获取审计日志列表（带分页）
 */
export async function getAuditLogs(options: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  startDate?: string;
  endDate?: string;
}): Promise<{
  logs: unknown[];
  total: number;
  page: number;
  limit: number;
}> {
  const supabase = getSupabaseClient();
  const { page = 1, limit = 20, userId, action, resource, startDate, endDate } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('admin_audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (action) {
    query = query.eq('action', action);
  }
  if (resource) {
    query = query.eq('resource', resource);
  }
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Audit] Failed to fetch audit logs:', error);
    throw error;
  }

  return {
    logs: data || [],
    total: count || 0,
    page,
    limit,
  };
}

/**
 * 清理旧审计日志（保留90天）
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const { error, count } = await supabase
    .from('admin_audit_logs')
    .delete()
    .lt('created_at', cutoffDate.toISOString());

  if (error) {
    console.error('[Audit] Failed to cleanup old logs:', error);
    throw error;
  }

  return count || 0;
}
