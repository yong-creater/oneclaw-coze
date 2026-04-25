/**
 * OneClaw 工具配置
 * 
 * 这是我们自主开发的 AI 工具集合，不是从数据库读取的第三方工具
 * 所有工具信息在此处定义，前台直接引用此配置
 * 
 * 后台管理说明：
 * - 工具是代码内置的，不能增删
 * - 后台可以：查看使用统计、设置价格/积分、启用/禁用
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// 工具分类（简化版）
// ============================================
export type ToolCategory = 
  | 'image'          // 图片处理
  | 'ecommerce'      // 电商工具
  | 'portrait'       // 人像设计
  | 'batch';         // 批量工具

// 分类显示名称和图标
export const TOOL_CATEGORIES: Record<ToolCategory, { name: string; icon: string }> = {
  'image': { name: '图片处理', icon: '🖼️' },
  'ecommerce': { name: '电商工具', icon: '🛒' },
  'portrait': { name: '人像设计', icon: '👤' },
  'batch': { name: '批量工具', icon: '⚡' },
};

// ============================================
// 工具配置
// ============================================
export interface ToolConfig {
  /** 唯一标识 */
  id: string;
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 所属分类 */
  category: ToolCategory;
  /** 图标 emoji */
  icon: string;
  /** 渐变色类 */
  color: string;
  /** 跳转路径 */
  href: string;
  /** 标签 */
  tags?: string[];
}

// 工具基础配置（静态）
export const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: 'remove-bg',
    name: '智能抠图',
    description: 'AI 一键移除背景，精准识别主体，边缘清晰自然',
    category: 'image',
    icon: '✂️',
    color: 'from-blue-100 to-cyan-100',
    href: '/tools/remove-bg',
    tags: ['抠图', '去背景', 'AI'],
  },
  {
    id: 'enhance',
    name: '图片变清晰',
    description: '模糊图片 AI 增强，一键高清修复，还原细节',
    category: 'image',
    icon: '🔍',
    color: 'from-amber-100 to-orange-100',
    href: '/tools/enhance',
    tags: ['超分', '放大', '清晰'],
  },
  {
    id: 'replace-bg',
    name: '背景替换',
    description: '智能识别并替换图片背景，支持多种场景模板',
    category: 'image',
    icon: '🖼️',
    color: 'from-sky-100 to-cyan-100',
    href: '/tools/replace-bg',
    tags: ['换背景', '场景', '模板'],
  },
  {
    id: 'remove-object',
    name: 'AI 消除',
    description: '去除图片中不需要的元素，无痕修复',
    category: 'image',
    icon: '🧹',
    color: 'from-fuchsia-100 to-pink-100',
    href: '/tools/remove-object',
    tags: ['消除', '去水印', '修复'],
  },
  {
    id: 'product-hero',
    name: '商品主图生成',
    description: '上传商品照片，自动生成淘宝/京东/亚马逊主图模板',
    category: 'ecommerce',
    icon: '🛍️',
    color: 'from-orange-100 to-amber-100',
    href: '/tools/product-hero',
    tags: ['电商', '主图', '生成'],
  },
  {
    id: 'model-try-on',
    name: '模特试衣',
    description: '服装上身效果展示，AI 虚拟试穿，省去拍摄成本',
    category: 'ecommerce',
    icon: '👗',
    color: 'from-pink-100 to-rose-100',
    href: '/tools/model-try-on',
    tags: ['模特', '试衣', '虚拟'],
  },
  {
    id: 'ap-detail',
    name: 'A+详情页',
    description: '自动生成亚马逊 A+ 详情页面，提升转化率',
    category: 'ecommerce',
    icon: '📦',
    color: 'from-purple-100 to-violet-100',
    href: '/tools/ap-detail',
    tags: ['亚马逊', 'A+', '详情页'],
  },
  {
    id: 'product-enhance',
    name: '商品图增强',
    description: '提升商品图的视觉效果，让产品更突出',
    category: 'ecommerce',
    icon: '✨',
    color: 'from-lime-100 to-green-100',
    href: '/tools/product-enhance',
    tags: ['增强', '优化', '电商'],
  },
  {
    id: 'id-photo',
    name: '证件照',
    description: '一键生成各尺寸证件照，自动换底色',
    category: 'portrait',
    icon: '📸',
    color: 'from-emerald-100 to-teal-100',
    href: '/tools/id-photo',
    tags: ['证件照', '换底', '一寸'],
  },
  {
    id: 'poster',
    name: '海报设计',
    description: '输入描述词，AI 生成创意海报，适用于各种场景',
    category: 'portrait',
    icon: '🎨',
    color: 'from-red-100 to-pink-100',
    href: '/tools/poster',
    tags: ['海报', '设计', 'AI生成'],
  },
  {
    id: 'video-cover',
    name: '视频封面',
    description: '自动截取视频精彩片段，生成吸引眼球的视频封面',
    category: 'portrait',
    icon: '🎬',
    color: 'from-indigo-100 to-blue-100',
    href: '/tools/video-cover',
    tags: ['视频', '封面', '剪辑'],
  },
  {
    id: 'batch-process',
    name: '批量处理',
    description: '一次处理多张图片，大幅提高工作效率',
    category: 'batch',
    icon: '⚡',
    color: 'from-slate-100 to-gray-100',
    href: '/tools/batch-process',
    tags: ['批量', '效率', '自动化'],
  },
];

// ============================================
// 工具运行时配置（后台可修改）
// ============================================
export interface ToolRuntimeConfig {
  /** 工具 ID */
  toolId: string;
  /** 是否启用 */
  enabled: boolean;
  /** 积分消耗（0 表示免费） */
  credits: number;
  /** 是否推荐 */
  featured: boolean;
  /** 总使用次数（数据库同步） */
  totalUsage: number;
  /** 今日使用次数（数据库同步） */
  todayUsage: number;
  /** 独立用户数（数据库同步） */
  uniqueUsers: number;
}

// 工具运行时状态管理
interface ToolState {
  // 运行时配置
  configs: Record<string, ToolRuntimeConfig>;
  // 是否已加载
  isLoaded: boolean;
  // 加载配置
  loadConfigs: () => void;
  // 更新配置
  updateConfig: (toolId: string, updates: Partial<ToolRuntimeConfig>) => void;
  // 重置配置
  resetConfigs: () => void;
}

// 默认运行时配置
const DEFAULT_CONFIGS: Record<string, ToolRuntimeConfig> = {
  'remove-bg': { toolId: 'remove-bg', enabled: true, credits: 0, featured: true, totalUsage: 125000, todayUsage: 342, uniqueUsers: 8900 },
  'enhance': { toolId: 'enhance', enabled: true, credits: 0, featured: true, totalUsage: 450000, todayUsage: 1234, uniqueUsers: 23400 },
  'replace-bg': { toolId: 'replace-bg', enabled: true, credits: 5, featured: false, totalUsage: 42000, todayUsage: 89, uniqueUsers: 5600 },
  'remove-object': { toolId: 'remove-object', enabled: true, credits: 5, featured: true, totalUsage: 280000, todayUsage: 567, uniqueUsers: 15600 },
  'product-hero': { toolId: 'product-hero', enabled: true, credits: 10, featured: true, totalUsage: 89000, todayUsage: 234, uniqueUsers: 7800 },
  'model-try-on': { toolId: 'model-try-on', enabled: true, credits: 15, featured: true, totalUsage: 78000, todayUsage: 189, uniqueUsers: 6700 },
  'ap-detail': { toolId: 'ap-detail', enabled: true, credits: 20, featured: false, totalUsage: 56000, todayUsage: 67, uniqueUsers: 4500 },
  'product-enhance': { toolId: 'product-enhance', enabled: true, credits: 5, featured: true, totalUsage: 123000, todayUsage: 345, uniqueUsers: 11200 },
  'id-photo': { toolId: 'id-photo', enabled: true, credits: 0, featured: true, totalUsage: 234000, todayUsage: 678, uniqueUsers: 18900 },
  'poster': { toolId: 'poster', enabled: true, credits: 10, featured: false, totalUsage: 89000, todayUsage: 123, uniqueUsers: 7800 },
  'video-cover': { toolId: 'video-cover', enabled: true, credits: 0, featured: true, totalUsage: 340000, todayUsage: 890, uniqueUsers: 21200 },
  'batch-process': { toolId: 'batch-process', enabled: true, credits: 20, featured: false, totalUsage: 56000, todayUsage: 45, uniqueUsers: 3400 },
};

// 创建状态管理
export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      configs: { ...DEFAULT_CONFIGS },
      isLoaded: false,

      loadConfigs: () => {
        if (get().isLoaded) return;
        set({ isLoaded: true });
      },

      updateConfig: (toolId, updates) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [toolId]: {
              ...state.configs[toolId],
              ...updates,
            },
          },
        }));
      },

      resetConfigs: () => {
        set({ configs: { ...DEFAULT_CONFIGS } });
      },
    }),
    {
      name: 'oneclaw-tool-configs',
    }
  )
);

// ============================================
// 辅助函数
// ============================================

// 获取完整的工具卡片数据
export interface ToolCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  tags: string[];
  category: ToolCategory;
  categoryName: string;
  enabled: boolean;
  credits: number;
  isFree: boolean;
  featured: boolean;
  totalUsage: number;
  todayUsage: number;
  uniqueUsers: number;
}

export function getToolCards(): ToolCard[] {
  return TOOL_CONFIGS.map((tool) => {
    const config = useToolStore.getState().configs[tool.id] || DEFAULT_CONFIGS[tool.id];
    return {
      ...tool,
      categoryName: TOOL_CATEGORIES[tool.category].name,
      enabled: config.enabled,
      credits: config.credits,
      isFree: config.credits === 0,
      featured: config.featured,
      totalUsage: config.totalUsage,
      todayUsage: config.todayUsage,
      uniqueUsers: config.uniqueUsers,
    };
  });
}

// 获取启用的工具
export function getEnabledTools(): ToolCard[] {
  return getToolCards().filter((tool) => tool.enabled);
}

// 获取推荐工具
export function getFeaturedTools(): ToolCard[] {
  return getEnabledTools().filter((tool) => tool.featured);
}

// 获取分类工具数量
export function getCategoryStats(): { category: ToolCategory; name: string; icon: string; count: number; enabledCount: number }[] {
  const tools = getToolCards();
  const stats: Record<ToolCategory, { category: ToolCategory; name: string; icon: string; count: number; enabledCount: number }> = {
    'image': { category: 'image', name: '图片处理', icon: '🖼️', count: 0, enabledCount: 0 },
    'ecommerce': { category: 'ecommerce', name: '电商工具', icon: '🛒', count: 0, enabledCount: 0 },
    'portrait': { category: 'portrait', name: '人像设计', icon: '👤', count: 0, enabledCount: 0 },
    'batch': { category: 'batch', name: '批量工具', icon: '⚡', count: 0, enabledCount: 0 },
  };

  tools.forEach((tool) => {
    stats[tool.category].count++;
    if (tool.enabled) {
      stats[tool.category].enabledCount++;
    }
  });

  return Object.values(stats);
}

// 格式化使用次数
export function formatUsageCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}
