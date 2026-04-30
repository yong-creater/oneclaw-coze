/**
 * 模型选择器 - 统一处理不同模型的图片生成
 * 
 * 核心原则：从数据库读取模型配置，按 providerSlug 分发到不同的生成方式
 * - providerSlug 含 "coze" → 走扣子 SDK
 * - 其他 → 走 OpenAI 兼容 API（4sapi 等），api_url/api_key 从 model_providers 表读取
 * 
 * 禁止硬编码 API Key、API URL、模型名
 */

import { ImageGenerationClient, ImageGenerationResponseHelper, ImageGenerationRequest, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 完整的工具模型配置（从数据库获取）
export interface ToolModelConfig {
  providerId: number;
  modelName: string;
  providerSlug: string;
  apiUrl: string;
  apiKey: string;
}

/**
 * 获取工具的模型配置（从数据库读取）
 * 支持 id 或 slug 查询
 */
export async function getToolModelConfig(toolId: string): Promise<ToolModelConfig | null> {
  try {
    const client = getSupabaseClient();
    
    // 支持 id 或 slug 查询
    const query = client
      .from('utility_tools')
      .select('id, slug, model_provider_id, model_name, model_config')
      .eq(isNaN(Number(toolId)) ? 'slug' : 'id', toolId);
    
    const { data: tool, error } = await query.single();
    
    if (error || !tool) {
      console.error('[ModelSelector] 查询工具失败:', error);
      return null;
    }
    
    // 如果有 provider_id 和 model_name，使用新配置方式
    if (tool.model_provider_id && tool.model_name) {
      // 获取 provider 信息（包含 api_url 和 api_key）
      const { data: provider } = await client
        .from('model_providers')
        .select('slug, api_url, api_key')
        .eq('id', tool.model_provider_id)
        .single();
      
      if (!provider) {
        console.error('[ModelSelector] 未找到模型提供商:', tool.model_provider_id);
        return null;
      }
      
      return {
        providerId: tool.model_provider_id,
        modelName: tool.model_name,
        providerSlug: provider.slug,
        apiUrl: provider.api_url || '',
        apiKey: provider.api_key || '',
      };
    }
    
    // 兼容旧的 model_config 方式（如果没有 model_provider_id）
    if (tool.model_config) {
      const source = tool.model_config.model_source || 'coze';
      const isCoze = source.includes('coze');
      return {
        providerId: tool.model_config.provider_id || 1,
        modelName: tool.model_config.default_model || 'coze-image',
        providerSlug: source,
        apiUrl: isCoze ? '' : (process.env.API4S_URL || 'https://4sapi.com/v1'),
        apiKey: isCoze ? '' : (process.env.API4S_KEY || ''),
      };
    }
    
    return null;
  } catch (error) {
    console.error('[ModelSelector] 获取工具模型配置失败:', error);
    return null;
  }
}

/**
 * 通过 OpenAI 兼容 API 生成图片（4sapi 等）
 * api_url 和 api_key 从数据库 model_providers 表读取
 */
async function generateWithOpenAICompatible(
  prompt: string,
  model: string,
  size: string,
  apiUrl: string,
  apiKey: string,
  image?: string | string[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  try {
    if (!apiKey) {
      return { success: false, error: 'API密钥未配置，请在后台模型提供商中配置' };
    }

    if (!apiUrl) {
      return { success: false, error: 'API地址未配置，请在后台模型提供商中配置' };
    }

    const requestBody: Record<string, any> = {
      model: model,
      prompt: prompt,
      n: 1,
      response_format: 'url',
    };

    // 设置尺寸
    if (size === '2K') {
      requestBody.size = '1024x1024';
    } else if (size === '4K') {
      requestBody.size = '1792x1024';
    } else {
      requestBody.size = size || '1024x1024';
    }

    // 如果有参考图片（图生图）
    if (image) {
      const images = Array.isArray(image) ? image : [image];
      if (images.length > 0 && images[0]) {
        requestBody.image = images[0];
      }
    }

    const response = await fetch(`${apiUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ModelSelector] API图片生成失败:', response.status, errorText?.substring(0, 200));
      return { success: false, error: `API错误: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return {
        success: true,
        imageUrls: data.data.map((item: any) => item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null)).filter(Boolean),
      };
    }

    return { success: false, error: '未返回图片数据' };
  } catch (error: any) {
    console.error('[ModelSelector] API调用失败:', error);
    return { success: false, error: error.message };
  }
}

// 创建扣子图片生成客户端
function createCozeClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
}

/**
 * 统一的图片生成函数
 * 
 * 核心逻辑：如果传了 toolId，从数据库获取模型配置（providerSlug + apiUrl + apiKey），
 * 根据 providerSlug 决定走扣子 SDK 还是 OpenAI 兼容 API。
 * 
 * @param prompt 提示词
 * @param model 模型名称（fallback，如果无 toolId 时使用）
 * @param size 图片尺寸
 * @param customHeaders 自定义请求头
 * @param toolId 可选的工具ID，用于获取模型配置
 * @param image 可选的参考图片（base64或URL）
 * @returns 图片URL数组或错误
 */
export async function generateWithModel(
  prompt: string,
  model: string = 'coze-image',
  size: string = '2K',
  customHeaders: Record<string, string> = {},
  toolId?: string,
  image?: string | string[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  // 如果传入了 toolId，优先从工具配置获取模型
  if (toolId) {
    try {
      const config = await getToolModelConfig(toolId);
      if (config) {
        console.log(`[ModelSelector] 工具 ${toolId} 使用模型: ${config.providerSlug} / ${config.modelName}`);
        
        const isCoze = config.providerSlug.includes('coze');
        
        if (isCoze) {
          // 走扣子 SDK
          const client = createCozeClient(customHeaders);
          const requestParams: ImageGenerationRequest = {
            prompt,
            size,
            watermark: false,
          };
          if (image) {
            requestParams.image = Array.isArray(image) ? image : [image];
          }
          if (config.modelName) {
            requestParams.model = config.modelName;
          }
          const response = await client.generate(requestParams);
          const helper = new ImageGenerationResponseHelper(response);
          if (helper.success && helper.imageUrls && helper.imageUrls.length > 0) {
            return { success: true, imageUrls: helper.imageUrls };
          }
          return { success: false, error: helper.errorMessages?.join(', ') || '扣子图片生成失败' };
        } else {
          // 走 OpenAI 兼容 API（4sapi 等），从数据库获取 apiUrl 和 apiKey
          return await generateWithOpenAICompatible(
            prompt,
            config.modelName,
            size,
            config.apiUrl,
            config.apiKey,
            image
          );
        }
      }
    } catch (error) {
      console.error('[ModelSelector] 获取工具模型配置失败，使用默认模型:', error);
    }
  }

  // 无 toolId 时的 fallback 逻辑
  console.log(`[ModelSelector] 无 toolId，使用默认模型: ${model}`);
  
  // 根据模型名推断 provider
  const isCozeModel = model.includes('coze') || model.includes('doubao') || model.includes('seedream');
  
  if (isCozeModel) {
    const client = createCozeClient(customHeaders);
    const requestParams: ImageGenerationRequest = {
      prompt,
      size,
      watermark: false,
    };
    if (image) {
      requestParams.image = Array.isArray(image) ? image : [image];
    }
    if (model !== 'coze-image') {
      requestParams.model = model;
    }
    const response = await client.generate(requestParams);
    const helper = new ImageGenerationResponseHelper(response);
    if (helper.success && helper.imageUrls && helper.imageUrls.length > 0) {
      return { success: true, imageUrls: helper.imageUrls };
    }
    return { success: false, error: helper.errorMessages?.join(', ') || '生成失败' };
  } else {
    // 非 coze 模型，尝试从环境变量读取 4sapi 配置
    const apiKey = process.env.API4S_KEY || '';
    const apiUrl = process.env.API4S_URL || 'https://4sapi.com/v1';
    return await generateWithOpenAICompatible(prompt, model, size, apiUrl, apiKey, image);
  }
}

/**
 * 获取可用的图片生成模型列表
 */
export function getAvailableImageModels() {
  return [
    { id: 'coze-image', name: '扣子图片生成', provider: 'coze', price: 0, description: '免费，豆包SeeDream模型' },
    { id: 'gpt-image-2', name: 'GPT Image 2', provider: '4sapi', price: 0.01, description: '$0.01/张，支持图生图' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: '4sapi', price: 0.04, description: '$0.04/张，OpenAI模型' },
    { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', provider: '4sapi', price: 0.005, description: '$0.005/张，开源模型' },
  ];
}
