import { useState, useEffect } from 'react';

interface ToolModelConfig {
  tool_id: string;
  tool_name: string;
  tool_type: string;
  default_model: string;
  model_source: string;
  is_free: boolean;
  config_params?: any;
}

/**
 * 获取工具的模型配置
 * @param toolId 工具ID
 * @returns 模型配置和加载状态
 */
export function useToolModelConfig(toolId: string) {
  const [config, setConfig] = useState<ToolModelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toolId) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/tool-models?tool_id=${toolId}`);
        const data = await res.json();
        
        if (data.success && data.config) {
          setConfig(data.config);
        } else {
          setError(data.error || '获取配置失败');
        }
      } catch (err) {
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [toolId]);

  return { config, loading, error };
}

/**
 * 获取默认模型ID
 */
export function getDefaultModel(toolId: string): string {
  const DEFAULT_MODELS: Record<string, string> = {
    'novel-polish': 'doubao-seed-1-8-251228',
    'novel-script': 'doubao-seed-1-8-251228',
    'novel-split-panel': 'doubao-seed-1-8-251228',
    'novel-generate-image': 'coze-image',
    'product-compliance': 'doubao-seed-1-6-vision-250815',
    'product-enhance': 'coze-image',
    'background-removal': 'coze-image',
    'portrait-enhance': 'coze-image',
    'layout-design': 'coze-image',
    'xhs-generator': 'doubao-seed-1-8-251228',
    'resume': 'doubao-seed-1-8-251228',
    // 别名
    'novel': 'doubao-seed-1-8-251228',
    'script': 'doubao-seed-1-8-251228',
    'polish': 'doubao-seed-1-8-251228',
  };
  
  return DEFAULT_MODELS[toolId] || 'doubao-seed-1-8-251228';
}
