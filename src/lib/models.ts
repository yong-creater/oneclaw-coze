// 统一的AI模型配置 - 所有工具通用

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

// 品牌配置（使用 Lucide 图标）
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

// 统一的模型列表（用于下拉选择）
export const UNIFIED_MODEL_OPTIONS: ModelOption[] = [
  // 豆包
  { id: 'doubao-seed-1-8-251228', name: 'Seed 1.8', provider: '豆包', icon: 'Bot', description: '多模态优化', isPaid: false },
  { id: 'doubao-seed-2-0-pro-260215', name: 'Seed 2.0 Pro', provider: '豆包', icon: 'Bot', description: '旗舰全能', isPaid: false },
  { id: 'doubao-seed-2-0-lite-260215', name: 'Seed 2.0 Lite', provider: '豆包', icon: 'Bot', description: '轻量快速', isPaid: false },
  // DeepSeek
  { id: 'deepseek-v3-2-251201', name: 'V3', provider: 'DeepSeek', icon: 'Zap', description: '平衡推理', isPaid: false },
  { id: 'deepseek-r1-250528', name: 'R1 (推理)', provider: 'DeepSeek', icon: 'Zap', description: '深度推理', recommended: true, isPaid: false },
  // Kimi - 已停运，暂时移除
  // { id: 'kimi-k2-250905', name: 'K2', provider: 'Kimi', icon: 'Moon', description: '长文本', isPaid: false },
  // { id: 'kimi-k2-5-260127', name: 'K2.5', provider: 'Kimi', icon: 'Moon', description: 'Agent能力', isPaid: false },
  // GLM
  { id: 'glm-5-0-260211', name: 'GLM-5', provider: 'GLM', icon: 'BarChart3', description: '旗舰基座', isPaid: false },
  // Qwen
  { id: 'qwen-3-5-plus-260215', name: 'Qwen 3.5 Plus', provider: 'Qwen', icon: 'Mountain', description: '混合架构', isPaid: false },
  // GPT (4sAPI) - 付费
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'GPT (4sAPI)', icon: 'Cpu', description: '旗舰多模态', isPaid: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'GPT (4sAPI)', icon: 'Cpu', description: '轻量高效', isPaid: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'GPT (4sAPI)', icon: 'Cpu', description: '超强推理', isPaid: true },
  // Claude (4sAPI) - 付费
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Claude (4sAPI)', icon: 'Brain', description: '优雅写作', isPaid: true },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Claude (4sAPI)', icon: 'Brain', description: '极速响应', isPaid: true },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Claude (4sAPI)', icon: 'Brain', description: '最新旗舰', isPaid: true },
  // Gemini (4sAPI) - 付费
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Gemini (4sAPI)', icon: 'Sparkles', description: '极速多模态', isPaid: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Gemini (4sAPI)', icon: 'Sparkles', description: '超长上下文', isPaid: true },
];

// 模型分组（用于分组列表展示）
export const UNIFIED_MODEL_GROUPS: ModelGroup[] = [
  {
    provider: '豆包',
    icon: 'Bot',
    models: [
      { value: 'doubao-seed-1-8-251228', label: 'Seed 1.8', region: '免费' },
      { value: 'doubao-seed-2-0-pro-260215', label: 'Seed 2.0 Pro', region: '免费' },
      { value: 'doubao-seed-2-0-lite-260215', label: 'Seed 2.0 Lite', region: '免费' },
    ]
  },
  {
    provider: 'DeepSeek',
    icon: 'Zap',
    models: [
      { value: 'deepseek-v3-2-251201', label: 'V3', region: '免费' },
      { value: 'deepseek-r1-250528', label: 'R1 (推理)', region: '免费', recommended: true },
    ]
  },
  // Kimi 已停运，暂时移除
  // {
  //   provider: 'Kimi',
  //   icon: 'Moon',
  //   models: [
  //     { value: 'kimi-k2-5-260127', label: 'K2.5', region: '免费' },
  //     { value: 'kimi-k2-250905', label: 'K2', region: '免费' },
  //   ]
  // },
  {
    provider: 'GLM',
    icon: 'BarChart3',
    models: [
      { value: 'glm-5-0-260211', label: 'GLM-5', region: '免费' },
    ]
  },
  {
    provider: 'Qwen',
    icon: 'Mountain',
    models: [
      { value: 'qwen-3-5-plus-260215', label: 'Qwen 3.5 Plus', region: '免费' },
    ]
  },
  // 4sAPI 付费模型
  {
    provider: 'GPT (4sAPI)',
    icon: 'Cpu',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', region: '付费' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', region: '付费' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', region: '付费' },
    ]
  },
  {
    provider: 'Claude (4sAPI)',
    icon: 'Brain',
    models: [
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', region: '付费' },
      { value: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', region: '付费' },
      { value: 'claude-sonnet-4', label: 'Claude Sonnet 4', region: '付费' },
    ]
  },
  {
    provider: 'Gemini (4sAPI)',
    icon: 'Sparkles',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', region: '付费' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', region: '付费' },
    ]
  },
];

// 默认选中的模型
export const DEFAULT_MODEL_ID = 'deepseek-r1-250528';

// 获取模型信息
export function getModelById(id: string): ModelOption | undefined {
  return UNIFIED_MODEL_OPTIONS.find(m => m.id === id);
}

// 获取提供商配置
export function getProviderConfig(provider: string) {
  return MODEL_PROVIDER_CONFIG[provider] || { icon: 'Bot', color: 'bg-slate-500' };
}
