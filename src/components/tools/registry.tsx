/**
 * 工具注册系统
 * OneClaw - 全品类AI工具导航站
 */

import supabase from '@/lib/supabase';

// 工具分类
export type ToolCategory = 
  | 'image-processing'  // AI修图
  | 'ai-generation'     // AI生成
  | 'ecommerce'         // 电商图片
  | 'social-media';     // 自媒体图片

// 工具配置接口
export interface ToolConfig {
  key: string;                    // 唯一标识
  name: string;                    // 显示名称
  description: string;            // 简短描述
  category: ToolCategory;          // 所属分类
  icon: string;                   // Emoji 图标
  color: {
    bg: string;                    // 背景色类
    gradient: string;              // 渐变色类
  };
  guide: string;                   // 使用提示
  requiresAuth: boolean;           // 是否需要登录
  credits: number;                // 消耗积分
  quota?: {                        // 免费额度
    daily?: number;
    total?: number;
  };
}

// 工具注册表（运行时加载）
const TOOL_REGISTRY: Record<string, ToolConfig> = {};

/**
 * 注册工具
 */
export function registerTool(config: ToolConfig) {
  TOOL_REGISTRY[config.key] = config;
  return config;
}

/**
 * 获取所有已注册工具
 */
export function getAllTools(): ToolConfig[] {
  return Object.values(TOOL_REGISTRY);
}

/**
 * 根据 key 获取工具
 */
export function getToolByKey(key: string): ToolConfig | null {
  return TOOL_REGISTRY[key] ?? null;
}

/**
 * 根据分类获取工具
 */
export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.category === category);
}

/**
 * 从数据库获取工具列表（带封面图）
 */
export async function getToolsFromDB() {
  const client = supabase;
  
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch tools:', error);
    return [];
  }

  return data || [];
}

/**
 * 更新工具封面图
 */
export async function updateToolCover(toolKey: string, coverUrl: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from('tools')
    .update({ cover_image: coverUrl, updated_at: new Date().toISOString() })
    .eq('key', toolKey)
    .select()
    .single();

  if (error) {
    console.error('Failed to update cover:', error);
    return null;
  }

  return data;
}

/**
 * 权限检查
 */
export function checkToolAccess(tool: ToolConfig, user: { role?: string } | null): {
  allowed: boolean;
  reason?: string;
} {
  // 公开工具
  if (!tool.requiresAuth) {
    return { allowed: true };
  }

  // 需要登录
  if (!user) {
    return { allowed: false, reason: '请先登录' };
  }

  return { allowed: true };
}

/**
 * 积分检查
 */
export function checkCredits(credits: number, userCredits: number): {
  allowed: boolean;
  reason?: string;
} {
  if (credits === 0) {
    return { allowed: true };
  }

  if (userCredits < credits) {
    return { allowed: false, reason: `需要 ${credits} 积分，当前 ${userCredits} 积分` };
  }

  return { allowed: true };
}
