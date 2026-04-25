/**
 * OneClaw 工具配置
 * 
 * 这是我们自主开发的 AI 工具集合，不是从数据库读取的第三方工具
 * 所有工具信息在此处定义，工具页面直接引用此配置
 */

// 工具分类
export type ToolCategory = 
  | 'image-processing'  // 图片处理
  | 'product-image'      // 商品图
  | 'model-image'        // 模特图
  | 'portrait-image'     // 人像图
  | 'poster'             // 海报
  | 'video'              // 视频
  | 'batch'              // 批量处理
  | 'design';            // 设计

// 工具类型
export type FreeType = 'free' | 'limited' | 'paid';

// 工具接口
export interface ToolConfig {
  /** 唯一标识 */
  id: string;
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 所属分类 */
  category: ToolCategory;
  /** 分类显示名称 */
  categoryName: string;
  /** 图标 emoji */
  icon: string;
  /** 渐变色类 */
  color: string;
  /** 免费类型 */
  freeType: FreeType;
  /** 是否推荐 */
  isFeatured: boolean;
  /** 使用次数（数据库同步） */
  usageCount: number;
  /** 跳转路径 */
  href: string;
  /** 标签 */
  tags?: string[];
}

// 工具分类映射
export const TOOL_CATEGORIES: Record<ToolCategory, { name: string; slug: string; count?: number }> = {
  'image-processing': { name: '图片编辑', slug: 'image-processing' },
  'product-image': { name: '商品图', slug: 'product-image' },
  'model-image': { name: '模特图', slug: 'model-image' },
  'portrait-image': { name: '人像图', slug: 'portrait-image' },
  'poster': { name: '海报', slug: 'poster' },
  'video': { name: '视频', slug: 'video' },
  'batch': { name: '批量处理', slug: 'batch' },
  'design': { name: '设计', slug: 'design' },
};

// 我们自己的工具配置
export const OUR_TOOLS: ToolConfig[] = [
  {
    id: 'remove-bg',
    name: '智能抠图',
    description: 'AI 一键移除背景，精准识别主体，边缘清晰自然',
    category: 'image-processing',
    categoryName: '图片编辑',
    icon: '✂️',
    color: 'from-blue-100 to-cyan-100',
    freeType: 'free',
    isFeatured: true,
    usageCount: 125000,
    href: '/tools/remove-bg',
    tags: ['抠图', '去背景', 'AI'],
  },
  {
    id: 'product-hero',
    name: '商品主图生成',
    description: '上传商品照片，自动生成淘宝/京东/亚马逊主图模板',
    category: 'product-image',
    categoryName: '商品图',
    icon: '🛍️',
    color: 'from-orange-100 to-amber-100',
    freeType: 'limited',
    isFeatured: true,
    usageCount: 89000,
    href: '/tools/product-hero',
    tags: ['电商', '主图', '生成'],
  },
  {
    id: 'model-try-on',
    name: '模特试衣',
    description: '服装上身效果展示，AI 虚拟试穿，省去拍摄成本',
    category: 'model-image',
    categoryName: '模特图',
    icon: '👗',
    color: 'from-pink-100 to-rose-100',
    freeType: 'limited',
    isFeatured: true,
    usageCount: 78000,
    href: '/tools/model-try-on',
    tags: ['模特', '试衣', '虚拟'],
  },
  {
    id: 'ap-detail',
    name: 'A+详情页',
    description: '自动生成亚马逊 A+ 详情页面，提升转化率',
    category: 'product-image',
    categoryName: '商品图',
    icon: '📦',
    color: 'from-purple-100 to-violet-100',
    freeType: 'paid',
    isFeatured: false,
    usageCount: 56000,
    href: '/tools/ap-detail',
    tags: ['亚马逊', 'A+', '详情页'],
  },
  {
    id: 'id-photo',
    name: '证件照',
    description: '一键生成各尺寸证件照，自动换底色',
    category: 'portrait-image',
    categoryName: '人像图',
    icon: '📸',
    color: 'from-emerald-100 to-teal-100',
    freeType: 'free',
    isFeatured: true,
    usageCount: 234000,
    href: '/tools/id-photo',
    tags: ['证件照', '换底', '一寸'],
  },
  {
    id: 'enhance',
    name: '图片变清晰',
    description: '模糊图片 AI 增强，一键高清修复，还原细节',
    category: 'image-processing',
    categoryName: '图片编辑',
    icon: '🔍',
    color: 'from-amber-100 to-orange-100',
    freeType: 'free',
    isFeatured: true,
    usageCount: 450000,
    href: '/tools/enhance',
    tags: ['超分', '放大', '清晰'],
  },
  {
    id: 'poster',
    name: '海报设计',
    description: '输入描述词，AI 生成创意海报，适用于各种场景',
    category: 'poster',
    categoryName: '海报',
    icon: '🎨',
    color: 'from-red-100 to-pink-100',
    freeType: 'limited',
    isFeatured: false,
    usageCount: 89000,
    href: '/tools/poster',
    tags: ['海报', '设计', 'AI生成'],
  },
  {
    id: 'video-cover',
    name: '视频封面',
    description: '自动截取视频精彩片段，生成吸引眼球的视频封面',
    category: 'video',
    categoryName: '视频',
    icon: '🎬',
    color: 'from-indigo-100 to-blue-100',
    freeType: 'free',
    isFeatured: true,
    usageCount: 340000,
    href: '/tools/video-cover',
    tags: ['视频', '封面', '剪辑'],
  },
  {
    id: 'batch-process',
    name: '批量处理',
    description: '一次处理多张图片，大幅提高工作效率',
    category: 'batch',
    categoryName: '批量处理',
    icon: '⚡',
    color: 'from-slate-100 to-gray-100',
    freeType: 'paid',
    isFeatured: false,
    usageCount: 56000,
    href: '/tools/batch-process',
    tags: ['批量', '效率', '自动化'],
  },
  {
    id: 'replace-bg',
    name: '背景替换',
    description: '智能识别并替换图片背景，支持多种场景模板',
    category: 'image-processing',
    categoryName: '图片编辑',
    icon: '🖼️',
    color: 'from-sky-100 to-cyan-100',
    freeType: 'limited',
    isFeatured: false,
    usageCount: 42000,
    href: '/tools/replace-bg',
    tags: ['换背景', '场景', '模板'],
  },
  {
    id: 'product-enhance',
    name: '商品图增强',
    description: '提升商品图的视觉效果，让产品更突出',
    category: 'product-image',
    categoryName: '商品图',
    icon: '✨',
    color: 'from-lime-100 to-green-100',
    freeType: 'free',
    isFeatured: true,
    usageCount: 123000,
    href: '/tools/product-enhance',
    tags: ['增强', '优化', '电商'],
  },
  {
    id: 'remove-object',
    name: 'AI 消除',
    description: '去除图片中不需要的元素，无痕修复',
    category: 'image-processing',
    categoryName: '图片编辑',
    icon: '🧹',
    color: 'from-fuchsia-100 to-pink-100',
    freeType: 'limited',
    isFeatured: true,
    usageCount: 280000,
    href: '/tools/remove-object',
    tags: ['消除', '去水印', '修复'],
  },
];

// 根据 ID 获取工具
export function getToolById(id: string): ToolConfig | undefined {
  return OUR_TOOLS.find(tool => tool.id === id);
}

// 根据分类获取工具
export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return OUR_TOOLS.filter(tool => tool.category === category);
}

// 获取推荐工具
export function getFeaturedTools(): ToolConfig[] {
  return OUR_TOOLS.filter(tool => tool.isFeatured);
}

// 获取所有分类（带工具数量）
export function getCategoriesWithCount(): { name: string; slug: string; count: number }[] {
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>();
  
  // 添加"全部"
  categoryMap.set('all', { name: '全部', slug: 'all', count: OUR_TOOLS.length });
  
  // 统计每个分类的工具数量
  for (const tool of OUR_TOOLS) {
    const existing = categoryMap.get(tool.category);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(tool.category, {
        name: tool.categoryName,
        slug: tool.category,
        count: 1,
      });
    }
  }
  
  return Array.from(categoryMap.values());
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
