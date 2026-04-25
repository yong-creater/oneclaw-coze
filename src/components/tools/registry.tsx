/**
 * OneClaw 工具注册系统
 * 
 * 提供统一的工具注册、配置、渲染能力
 * 支持动态加载和扩展新工具
 */

import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================
// 类型定义
// ============================================

export type ToolCategory = 
  | 'image-processing'   // 图片处理
  | 'marketing'           // 营销图
  | 'ai-design'           // AI设计
  | 'video'               // 视频处理
  | 'document'            // 文档处理
  | 'audio'               // 音频处理
  | 'chat';               // 对话助手

export type ToolDifficulty = 'easy' | 'medium' | 'advanced';

export interface ToolQuota {
  daily?: number;    // 每日限制
  total?: number;    // 总限制
  credits?: number;   // 消耗积分
}

export interface ToolSetting {
  key: string;
  label: string;
  type: 'select' | 'input' | 'toggle' | 'slider';
  options?: { value: string; label: string }[];
  default?: string | boolean | number;
}

export interface ToolConfig {
  key: string;                          // 唯一标识（URL中使用）
  name: string;                         // 显示名称
  shortName?: string;                   // 简短名称
  description: string;                   // 详细描述
  category: ToolCategory;               // 所属分类
  icon: string;                         // Emoji 或图标名称
  color: {
    gradient: string;                    // 渐变色类
    bg: string;                         // 背景色类
  };
  difficulty: ToolDifficulty;           // 难度等级
  guide: string;                        // 使用提示（一句话）
  requiresAuth: boolean;                // 是否需要登录
  quota?: ToolQuota;                    // 使用额度
  settings?: ToolSetting[];             // 可配置项
  outputFormats?: string[];             // 输出格式
  maxFileSize?: number;                 // 最大文件大小(MB)
  relatedTools?: string[];              // 相关工具
  createdAt?: string;                  // 创建时间
}

export interface ToolResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================
// 工具注册表
// ============================================

export const TOOL_REGISTRY: Record<string, ToolConfig> = {};

// ============================================
// 工具查询函数
// ============================================

/**
 * 获取所有工具
 */
export function getAllTools(): ToolConfig[] {
  return Object.values(TOOL_REGISTRY);
}

/**
 * 获取工具配置
 */
export function getToolConfig(key: string): ToolConfig | null {
  return TOOL_REGISTRY[key] || null;
}

/**
 * 按分类获取工具
 */
export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return getAllTools().filter(tool => tool.category === category);
}

/**
 * 搜索工具
 */
export function searchTools(query: string): ToolConfig[] {
  const lowerQuery = query.toLowerCase();
  return getAllTools().filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.key.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 获取相关工具
 */
export function getRelatedTools(key: string, limit = 4): ToolConfig[] {
  const tool = getToolConfig(key);
  if (!tool?.relatedTools) return [];
  
  return tool.relatedTools
    .slice(0, limit)
    .map(k => getToolConfig(k))
    .filter(Boolean) as ToolConfig[];
}

// ============================================
// 工具权限检查
// ============================================

export interface PermissionContext {
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  usedQuota?: Record<string, number>;
}

/**
 * 检查用户是否有权使用工具
 */
export function canUseTool(key: string, context: PermissionContext): { allowed: boolean; reason?: string } {
  const tool = getToolConfig(key);
  if (!tool) {
    return { allowed: false, reason: '工具不存在' };
  }
  
  // 检查登录要求
  if (tool.requiresAuth && !context.isAuthenticated) {
    return { allowed: false, reason: '请先登录' };
  }
  
  // 检查额度
  if (tool.quota && context.usedQuota) {
    const used = context.usedQuota[key] || 0;
    if (tool.quota.daily && used >= tool.quota.daily) {
      return { allowed: false, reason: '今日额度已用完' };
    }
  }
  
  return { allowed: true };
}

// ============================================
// 工具额度管理
// ============================================

export interface QuotaInfo {
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt?: string;
}

/**
 * 获取用户工具额度信息
 */
export function getQuotaInfo(key: string, usedToday: number): QuotaInfo {
  const tool = getToolConfig(key);
  const limit = tool?.quota?.daily || null;
  
  return {
    used: usedToday,
    limit,
    remaining: limit ? Math.max(0, limit - usedToday) : null,
    resetAt: limit ? getResetTime() : undefined
  };
}

function getResetTime(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

// ============================================
// 工具统计
// ============================================

export interface ToolStats {
  totalTools: number;
  totalUsage: number;
  categoryStats: Record<ToolCategory, number>;
}

/**
 * 获取工具统计信息
 */
export function getToolStats(): ToolStats {
  const tools = getAllTools();
  
  return {
    totalTools: tools.length,
    totalUsage: 0,
    categoryStats: {
      'image-processing': tools.filter(t => t.category === 'image-processing').length,
      'marketing': tools.filter(t => t.category === 'marketing').length,
      'ai-design': tools.filter(t => t.category === 'ai-design').length,
      'video': tools.filter(t => t.category === 'video').length,
      'document': tools.filter(t => t.category === 'document').length,
      'audio': tools.filter(t => t.category === 'audio').length,
      'chat': tools.filter(t => t.category === 'chat').length,
    }
  };
}

// ============================================
// 工具验证
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证工具输入
 */
export function validateToolInput(key: string, data: any): ValidationResult {
  const tool = getToolConfig(key);
  if (!tool) {
    return { valid: false, error: '工具不存在' };
  }
  
  if (!data || Object.keys(data).length === 0) {
    return { valid: false, error: '请提供输入数据' };
  }
  
  return { valid: true };
}

// ============================================
// 工具加载占位符
// ============================================

export function ToolLoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );
}
