import { useState, useEffect } from 'react';

interface ToolModelConfig {
  tool_id: string;
  tool_name: string;
  tool_type: string;
  default_model: string;
  model_source: string;
  model_price_per_1k_tokens: number;
  is_free: boolean;
  is_active: boolean;
  config_params?: any;
}

/**
 * 获取工具的模型配置
 * @param toolSlug 工具slug (如 'novel', 'resume', 'xhs-generator')
 * @returns 模型配置和加载状态
 */
export function useToolModelConfig(toolSlug: string) {
  const [config, setConfig] = useState<ToolModelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toolSlug) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        // 从 utility_tools 表获取模型配置
        const res = await fetch(`/api/utility-tools?slug=${toolSlug}`);
        const data = await res.json();
        
        if (data.tools && data.tools.length > 0) {
          const tool = data.tools.find((t: any) => t.slug === toolSlug);
          if (tool && tool.model_config) {
            setConfig({
              tool_id: tool.slug,
              tool_name: tool.name,
              tool_type: tool.slug,
              default_model: tool.model_config.default_model || 'ep-20250312145957-p8xpp',
              model_source: tool.model_config.model_source || 'coze',
              model_price_per_1k_tokens: tool.model_config.model_price_per_1k_tokens || 0,
              is_free: tool.model_config.is_free !== false,
              is_active: tool.model_config.is_active !== false,
            });
            setLoading(false);
            return;
          }
        }
        
        // 如果没有配置，使用默认配置
        setConfig({
          tool_id: toolSlug,
          tool_name: getToolName(toolSlug),
          tool_type: toolSlug,
          default_model: 'ep-20250312145957-p8xpp',
          model_source: 'coze',
          model_price_per_1k_tokens: 0,
          is_free: true,
          is_active: true,
        });
        setLoading(false);
      } catch (err) {
        console.error('获取模型配置失败:', err);
        setError('网络错误');
        setLoading(false);
      }
    };

    fetchConfig();
  }, [toolSlug]);

  return { config, loading, error };
}

/**
 * 获取工具名称
 */
function getToolName(toolSlug: string): string {
  const names: Record<string, string> = {
    'xhs-generator': '小红书爆款生成器',
    'resume': '简历优化器',
    'novel-polish': '小说创作',
    'ai-photo': 'AI写真生成器',
    'product-poster': '商品海报生成器',
    'cover-generator': '封面生成器',
    'product-photo': '商品图精修',
    'background-removal': 'AI智能抠图',
    'photo-editor': '照片美化',
    'layout-design': '图文排版',
  };
  return names[toolSlug] || toolSlug;
}

/**
 * 获取默认模型ID
 */
export function getDefaultModel(toolSlug: string): string {
  const DEFAULT_MODELS: Record<string, string> = {
    'novel-polish': 'ep-20250312145957-p8xpp',
    'novel-script': 'ep-20250312145957-p8xpp',
    'novel-split-panel': 'ep-20250312145957-p8xpp',
    'novel-generate-image': 'coze-image',
    'product-compliance': 'ep-20250312145957-p8xpp',
    'product-enhance': 'coze-image',
    'background-removal': 'coze-image',
    'portrait-enhance': 'coze-image',
    'layout-design': 'coze-image',
    'xhs-generator': 'ep-20250312145957-p8xpp',
    'resume': 'ep-20250312145957-p8xpp',
    // 别名
    'novel': 'ep-20250312145957-p8xpp',
    'script': 'ep-20250312145957-p8xpp',
    'polish': 'ep-20250312145957-p8xpp',
  };
  
  return DEFAULT_MODELS[toolSlug] || 'ep-20250312145957-p8xpp';
}

/**
 * 模型列表（用于前端展示和选择）
 */
export const MODEL_OPTIONS = {
  coze: [
    { id: 'ep-20250312145957-p8xpp', name: 'Doubao-Pro (扣子)', price: 0, isFree: true },
    { id: 'ep-20250410165509-dtk4n', name: 'Doubao-Seed (扣子)', price: 0, isFree: true },
  ],
  '4sapi': [
    { id: 'gpt-4o', name: 'GPT-4o', price: 0.0025, isFree: false },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', price: 0.00015, isFree: false },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', price: 0.01, isFree: false },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', price: 0.003, isFree: false },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', price: 0.015, isFree: false },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', price: 0.00125, isFree: false },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', price: 0.000075, isFree: false },
  ],
};

/**
 * 根据模型ID获取模型信息
 */
export function getModelInfo(modelId: string) {
  // 检查扣子模型
  const cozeModel = MODEL_OPTIONS.coze.find(m => m.id === modelId);
  if (cozeModel) return cozeModel;
  
  // 检查4sAPI模型
  const sApiModel = MODEL_OPTIONS['4sapi'].find(m => m.id === modelId);
  if (sApiModel) return sApiModel;
  
  // 默认返回扣子模型
  return MODEL_OPTIONS.coze[0];
}

/**
 * 计算费用
 */
export function calculateCost(inputTokens: number, outputTokens: number, modelId: string): number {
  const model = getModelInfo(modelId);
  if (model.isFree) return 0;
  
  // 假设输入和输出 token 价格相同
  const totalTokens = inputTokens + outputTokens;
  return (totalTokens / 1000) * model.price;
}
