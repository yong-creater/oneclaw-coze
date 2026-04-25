/**
 * 工具配置
 * OneClaw - 全品类AI工具导航站
 */

import { ToolCategory, ToolConfig } from './registry';

// 重新导出类型
export type { ToolCategory, ToolConfig } from './registry';

// 工具分类定义
export const TOOL_CATEGORIES: Record<ToolCategory, {
  name: string;
  icon: string;
  description: string;
  color: string;
}> = {
  'image-processing': {
    name: 'AI修图',
    icon: '🖼️',
    description: '智能处理图片，一键完成专业效果',
    color: 'from-blue-400 to-cyan-500'
  },
  'ai-generation': {
    name: 'AI生成',
    icon: '✨',
    description: '输入文字，AI生成精美图片',
    color: 'from-violet-400 to-purple-500'
  },
  'ecommerce': {
    name: '电商图片',
    icon: '🛒',
    description: '电商场景专用，一键生成商品图',
    color: 'from-emerald-400 to-green-500'
  },
  'social-media': {
    name: '自媒体图片',
    icon: '📱',
    description: '社交媒体封面，专为流量而生',
    color: 'from-rose-400 to-pink-500'
  }
};

// 工具配置
export const TOOLS_CONFIG: ToolConfig[] = [
  // AI修图
  {
    key: 'remove-bg',
    name: '智能抠图',
    description: '一键去除背景，保留主体毛发/透明发丝',
    category: 'image-processing',
    icon: '✂️',
    color: { bg: 'bg-blue-100', gradient: 'from-blue-400 to-cyan-500' },
    guide: '上传图片，AI自动识别主体并去除背景',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 10 }
  },
  {
    key: 'enhance',
    name: '变清晰',
    description: '模糊图片秒变清晰，支持4K超分',
    category: 'image-processing',
    icon: '🔍',
    color: { bg: 'bg-purple-100', gradient: 'from-purple-400 to-violet-500' },
    guide: '上传模糊图片，一键提升清晰度',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 5 }
  },
  {
    key: 'resize',
    name: '改尺寸',
    description: '任意调整尺寸，不变形不模糊',
    category: 'image-processing',
    icon: '📐',
    color: { bg: 'bg-green-100', gradient: 'from-green-400 to-emerald-500' },
    guide: '上传图片，选择目标尺寸即可',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 20 }
  },
  {
    key: 'compress',
    name: '图片压缩',
    description: '无损压缩，支持PNG/JPG/WebP',
    category: 'image-processing',
    icon: '📦',
    color: { bg: 'bg-amber-100', gradient: 'from-amber-400 to-orange-500' },
    guide: '上传图片，一键压缩到最小体积',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 20 }
  },
  {
    key: 'watermark',
    name: '去水印',
    description: '智能移除图片中的水印文字',
    category: 'image-processing',
    icon: '🧹',
    color: { bg: 'bg-slate-100', gradient: 'from-slate-400 to-gray-500' },
    guide: '涂抹水印区域，AI自动修补背景',
    requiresAuth: false,
    credits: 5,
    quota: { daily: 5 }
  },

  // AI生成
  {
    key: 'text-to-image',
    name: '文字生图',
    description: '输入描述词，AI生成精美图片',
    category: 'ai-generation',
    icon: '🎨',
    color: { bg: 'bg-violet-100', gradient: 'from-violet-400 to-purple-500' },
    guide: '输入文字描述，选择风格即可生成',
    requiresAuth: false,
    credits: 10,
    quota: { daily: 5 }
  },
  {
    key: 'remove-handwriting',
    name: '消除手写',
    description: '一键消除试卷、手写笔记上的字迹',
    category: 'ai-generation',
    icon: '📝',
    color: { bg: 'bg-cyan-100', gradient: 'from-cyan-400 to-blue-500' },
    guide: '上传含手写文字的图片，自动清除',
    requiresAuth: false,
    credits: 5,
    quota: { daily: 10 }
  },
  {
    key: 'image-extend',
    name: '图片扩展',
    description: '智能扩展图片边界，延展画面',
    category: 'ai-generation',
    icon: '🔄',
    color: { bg: 'bg-indigo-100', gradient: 'from-indigo-400 to-blue-500' },
    guide: '上传图片，选择扩展方向即可',
    requiresAuth: false,
    credits: 5,
    quota: { daily: 5 }
  },

  // 电商图片
  {
    key: 'xiaohongshu',
    name: '小红书封面',
    description: '一键生成小红书爆款封面图',
    category: 'ecommerce',
    icon: '📕',
    color: { bg: 'bg-red-100', gradient: 'from-red-400 to-orange-500' },
    guide: '输入笔记主题，自动生成精美封面',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 10 }
  },
  {
    key: 'productpage',
    name: '商品主图',
    description: '生成电商品牌商品展示图',
    category: 'ecommerce',
    icon: '🏷️',
    color: { bg: 'bg-emerald-100', gradient: 'from-emerald-400 to-green-500' },
    guide: '上传商品图，生成多种展示场景',
    requiresAuth: false,
    credits: 5,
    quota: { daily: 5 }
  },
  {
    key: 'restaurant-menu',
    name: '菜单设计',
    description: '餐饮商家专属，一键生成精美菜单',
    category: 'ecommerce',
    icon: '🍽️',
    color: { bg: 'bg-orange-100', gradient: 'from-orange-400 to-amber-500' },
    guide: '输入菜品名称，自动排版生成菜单',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 10 }
  },

  // 自媒体图片
  {
    key: 'douyin',
    name: '视频封面',
    description: '生成抖音/B站等平台的视频封面',
    category: 'social-media',
    icon: '🎬',
    color: { bg: 'bg-violet-100', gradient: 'from-violet-400 to-purple-500' },
    guide: '输入视频主题，生成吸引眼球的封面',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 10 }
  },
  {
    key: 'festival-poster',
    name: '节日海报',
    description: '节日节气专属海报，一键生成',
    category: 'social-media',
    icon: '🎊',
    color: { bg: 'bg-rose-100', gradient: 'from-rose-400 to-pink-500' },
    guide: '选择节日，输入祝福语即可生成',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 10 }
  },
  {
    key: 'twitter',
    name: '推文配图',
    description: '生成社交媒体推文配图',
    category: 'social-media',
    icon: '🐦',
    color: { bg: 'bg-sky-100', gradient: 'from-sky-400 to-blue-500' },
    guide: '输入推文内容，一键生成配图',
    requiresAuth: false,
    credits: 0,
    quota: { daily: 10 }
  },
  {
    key: 'avatar',
    name: 'AI头像',
    description: '生成卡通/艺术风格头像',
    category: 'social-media',
    icon: '👤',
    color: { bg: 'bg-pink-100', gradient: 'from-pink-400 to-rose-500' },
    guide: '上传照片，生成多种风格头像',
    requiresAuth: false,
    credits: 5,
    quota: { daily: 3 }
  }
];
