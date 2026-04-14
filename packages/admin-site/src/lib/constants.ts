// 共享常量定义

// 免费类型颜色映射
export const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

// 免费类型列表
export const FREE_TYPES = ['完全免费', '免费额度', '限时免费', '付费工具'] as const;

// 分类图标映射
export const CATEGORY_ICONS: Record<string, string> = {
  'video-generation': '🎬',
  'digital-human': '👤',
  'video-editing': '✂️',
  'ai-dubbing': '🎙️',
  'anime-creation': '🎨',
  'ai-image': '🖼️',
  'ai-writing': '✍️',
  'ai-coding': '💻',
  'ai-audio': '🎵',
  'ai-office': '📊',
  'ai-learning': '📚',
  'ai-chat': '💬',
  'ai-search': '🔍',
  'ai-marketing': '📈',
};

// 分页默认配置
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 缓存时间配置（毫秒）
export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1分钟
  MEDIUM: 5 * 60 * 1000, // 5分钟
  LONG: 30 * 60 * 1000, // 30分钟
};

// API缓存响应头
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
};
