/**
 * 工具配置定义
 * 
 * 此文件集中管理所有工具的配置信息
 */

import { ToolConfig, ToolCategory } from './registry';

// ============================================
// 分类配置
// ============================================

export const TOOL_CATEGORIES: Record<ToolCategory, {
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  'image-processing': {
    name: '图片处理',
    icon: '🖼️',
    color: 'from-blue-400 to-cyan-500',
    description: 'AI智能处理图片，一键完成复杂操作'
  },
  'marketing': {
    name: '营销图',
    icon: '📢',
    color: 'from-red-400 to-orange-500',
    description: '快速生成各平台营销封面图'
  },
  'ai-design': {
    name: 'AI设计',
    icon: '✨',
    color: 'from-purple-400 to-pink-500',
    description: '智能设计工具，无需设计基础'
  },
  'video': {
    name: '视频处理',
    icon: '🎬',
    color: 'from-violet-400 to-purple-500',
    description: 'AI视频剪辑与生成'
  },
  'document': {
    name: '文档处理',
    icon: '📄',
    color: 'from-green-400 to-emerald-500',
    description: '文档智能处理与转换'
  },
  'audio': {
    name: '音频处理',
    icon: '🎵',
    color: 'from-yellow-400 to-amber-500',
    description: '音频生成与处理'
  },
  'chat': {
    name: '对话助手',
    icon: '💬',
    color: 'from-teal-400 to-cyan-500',
    description: 'AI对话与问答'
  }
};

// ============================================
// 工具配置
// ============================================

export const TOOLS_CONFIG: ToolConfig[] = [
  // ===== 图片处理 =====
  {
    key: 'remove-bg',
    name: 'AI抠图',
    shortName: '抠图',
    description: '一键去除图片背景，秒变透明图',
    category: 'image-processing',
    icon: '✂️',
    color: {
      gradient: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-100'
    },
    difficulty: 'easy',
    guide: '上传图片 → 点击按钮 → 下载透明背景图',
    requiresAuth: false,
    quota: { daily: 10, credits: 1 },
    maxFileSize: 10,
    outputFormats: ['png', 'webp'],
    relatedTools: ['enhance', 'resize']
  },
  
  {
    key: 'enhance',
    name: '变清晰',
    description: '模糊图片一键修复高清',
    category: 'image-processing',
    icon: '🔍',
    color: {
      gradient: 'from-purple-400 to-violet-500',
      bg: 'bg-purple-100'
    },
    difficulty: 'easy',
    guide: '上传模糊图 → 选择倍数 → 一键变清晰',
    requiresAuth: false,
    quota: { daily: 10, credits: 2 },
    maxFileSize: 20,
    outputFormats: ['jpg', 'png'],
    relatedTools: ['remove-bg', 'resize']
  },
  
  {
    key: 'resize',
    name: '改尺寸',
    description: '无损放大或缩小图片',
    category: 'image-processing',
    icon: '📐',
    color: {
      gradient: 'from-green-400 to-emerald-500',
      bg: 'bg-green-100'
    },
    difficulty: 'easy',
    guide: '上传图片 → 选择尺寸 → 下载无损图',
    requiresAuth: false,
    quota: { daily: 20, credits: 0 },
    maxFileSize: 30,
    outputFormats: ['jpg', 'png', 'webp'],
    relatedTools: ['enhance', 'remove-bg']
  },
  
  // ===== 营销图 =====
  {
    key: 'xiaohongshu',
    name: '小红书封面',
    description: '小红书爆款封面一键生成',
    category: 'marketing',
    icon: '📕',
    color: {
      gradient: 'from-red-400 to-orange-500',
      bg: 'bg-red-100'
    },
    difficulty: 'easy',
    guide: '输入标题 → 选择类型 → 一键生成封面',
    requiresAuth: false,
    quota: { daily: 20, credits: 1 },
    outputFormats: ['jpg', 'png'],
    relatedTools: ['douyin', 'festival-poster']
  },
  
  {
    key: 'douyin',
    name: '视频封面',
    description: '抖音/视频号封面生成',
    category: 'marketing',
    icon: '🎬',
    color: {
      gradient: 'from-violet-400 to-purple-500',
      bg: 'bg-violet-100'
    },
    difficulty: 'easy',
    guide: '输入标题 → 选择类型 → 一键生成封面',
    requiresAuth: false,
    quota: { daily: 20, credits: 1 },
    outputFormats: ['jpg', 'png'],
    relatedTools: ['xiaohongshu', 'festival-poster']
  },
  
  {
    key: 'festival-poster',
    name: '节日海报',
    description: '节日营销海报一键生成',
    category: 'marketing',
    icon: '🎊',
    color: {
      gradient: 'from-rose-400 to-pink-500',
      bg: 'bg-rose-100'
    },
    difficulty: 'easy',
    guide: '选择节日 → 输入祝福语 → 一键生成海报',
    requiresAuth: false,
    quota: { daily: 10, credits: 1 },
    outputFormats: ['jpg', 'png', 'pdf'],
    relatedTools: ['xiaohongshu', 'douyin']
  },
  
  {
    key: 'productpage',
    name: '商品主图',
    description: '电商主图/详情页生成',
    category: 'marketing',
    icon: '🛍️',
    color: {
      gradient: 'from-teal-400 to-cyan-500',
      bg: 'bg-teal-100'
    },
    difficulty: 'medium',
    guide: '上传产品图 → 选择配色 → 一键生成主图',
    requiresAuth: true,
    quota: { daily: 5, credits: 3 },
    maxFileSize: 15,
    outputFormats: ['jpg', 'png'],
    relatedTools: ['xiaohongshu', 'remove-bg']
  },
  
  // ===== AI设计 =====
  {
    key: 'restaurant-menu',
    name: '菜单设计',
    description: '餐厅菜单智能生成',
    category: 'ai-design',
    icon: '🍽️',
    color: {
      gradient: 'from-amber-400 to-yellow-500',
      bg: 'bg-amber-100'
    },
    difficulty: 'easy',
    guide: '添加菜品 → 选择风格 → 一键生成菜单',
    requiresAuth: false,
    quota: { daily: 10, credits: 1 },
    outputFormats: ['jpg', 'png', 'pdf'],
    relatedTools: ['festival-poster']
  }
];
