import { useState, useEffect } from 'react';

interface ToolModelConfig {
  tool_id: string;
  tool_name: string;
  tool_type: string;
  default_model: string;
  model_source: string;
  model_provider_id?: number;
  model_name?: string;
  model_price_per_1k_tokens: number;
  is_free: boolean;
  is_active: boolean;
  config_params?: any;
}

interface ModelInfo {
  id: string;
  name: string;
  type: string;
  price: number;
  isFree: boolean;
}

/**
 * 获取工具的模型配置（支持新旧两种配置方式）
 * @param toolSlug 工具slug (如 'xhs-generator', 'product-page')
 * @returns 模型配置和加载状态
 */
export function useToolModelConfig(toolSlug: string) {
  const [config, setConfig] = useState<ToolModelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true); // 是否已配置模型

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
        
        // API返回的是 data.tool（单个对象）
        const tool = data.tool;
        
        if (tool) {
          // 优先使用新的 provider + model_name 方式
          if (tool.model_provider_id && tool.model_name) {
            setConfig({
              tool_id: tool.slug,
              tool_name: tool.name,
              tool_type: tool.slug,
              default_model: tool.model_name,  // 使用数据库中的模型名
              model_source: tool.model_provider_id === 1 || tool.model_provider_id === 2 ? 'coze' : '4sapi',
              model_provider_id: tool.model_provider_id,
              model_name: tool.model_name,
              model_price_per_1k_tokens: tool.model_config?.model_price_per_1k_tokens || 0,
              is_free: tool.model_config?.is_free !== false,
              is_active: true,
              config_params: tool.model_config?.config_params,
            });
            setIsConfigured(true);
          }
          // 兼容旧的 model_config 方式
          else if (tool.model_config && tool.model_config.default_model) {
            setConfig({
              tool_id: tool.slug,
              tool_name: tool.name,
              tool_type: tool.slug,
              default_model: tool.model_config.default_model || 'coze-image',
              model_source: tool.model_config.model_source || 'coze',
              model_price_per_1k_tokens: tool.model_config.model_price_per_1k_tokens || 0,
              is_free: tool.model_config.is_free !== false,
              is_active: tool.model_config.is_active !== false,
              config_params: tool.model_config.config_params,
            });
            setIsConfigured(true);
          }
          // 如果没有配置，设置错误状态
          else {
            setConfig(null);
            setIsConfigured(false);
            setError('该工具尚未配置AI模型，请联系管理员');
          }
          setLoading(false);
          return;
        }
        
        // 工具不存在，设置错误状态
        setConfig(null);
        setIsConfigured(false);
        setError('该工具不存在');
        setLoading(false);
      } catch (err) {
        console.error('获取模型配置失败:', err);
        setError('网络错误，请刷新重试');
        setConfig(null);
        setIsConfigured(false);
        setLoading(false);
      }
    };

    fetchConfig();
  }, [toolSlug]);

  return { config, loading, error, isConfigured };
}

/**
 * 获取工具名称
 */
export function getToolName(toolSlug: string): string {
  const names: Record<string, string> = {
    'xhs-generator': '小红书爆款生成器',
    'ai-photo': 'AI写真生成器',
    'product-poster': '商品海报生成器',
    'background-removal': 'AI智能抠图',
    'product-page-generator': '商品主图生成器',
  };
  return names[toolSlug] || toolSlug;
}
