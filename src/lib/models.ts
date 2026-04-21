// 模型配置类型定义 - 动态数据由 API 提供

// 模型选项接口
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  icon: string;
  description?: string;
  recommended?: boolean;
  isPaid?: boolean;
}

// 模型分组接口
export interface ModelGroup {
  provider: string;
  icon: string;
  models: ModelGroupItem[];
}

export interface ModelGroupItem {
  value: string;
  label: string;
  region: string;
  recommended?: boolean;
}

// 品牌配置（用于图标和颜色映射）
export const MODEL_PROVIDER_CONFIG: Record<string, { icon: string; color: string }> = {
  '豆包': { icon: 'Bot', color: 'bg-emerald-500' },
  'DeepSeek': { icon: 'Zap', color: 'bg-violet-500' },
  'Kimi': { icon: 'Moon', color: 'bg-amber-500' },
  'GLM': { icon: 'BarChart3', color: 'bg-blue-500' },
  'Qwen': { icon: 'Mountain', color: 'bg-orange-500' },
  'GPT (4sAPI)': { icon: 'Cpu', color: 'bg-green-500' },
  'Claude (4sAPI)': { icon: 'Brain', color: 'bg-amber-600' },
  'Gemini (4sAPI)': { icon: 'Sparkles', color: 'bg-blue-400' },
};

// 默认选中的模型ID
export const DEFAULT_MODEL_ID = 'deepseek-r1-250528';

// 获取提供商配置
export function getProviderConfig(provider: string) {
  return MODEL_PROVIDER_CONFIG[provider] || { icon: 'Bot', color: 'bg-slate-500' };
}
