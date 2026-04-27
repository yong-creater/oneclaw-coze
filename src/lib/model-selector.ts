/**
 * 模型选择器 - 统一处理不同模型的图片生成
 */

import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取工具的模型配置
export async function getToolModelConfig(toolId: string): Promise<{providerId: number; modelName: string; provider: string} | null> {
  try {
    const client = getSupabaseClient();
    
    // 支持 id 或 slug 查询
    const query = client
      .from('utility_tools')
      .select('id, slug, model_provider_id, model_name, model_config')
      .eq(isNaN(Number(toolId)) ? 'slug' : 'id', toolId);
    
    const { data: tool, error } = await query.single();
    
    if (error || !tool) {
      console.error('查询工具失败:', error);
      return null;
    }
    
    // 如果有 provider_id 和 model_name，使用新配置方式
    if (tool.model_provider_id && tool.model_name) {
      // 获取 provider 信息
      const { data: provider } = await client
        .from('model_providers')
        .select('slug')
        .eq('id', tool.model_provider_id)
        .single();
      
      return {
        providerId: tool.model_provider_id,
        modelName: tool.model_name,
        provider: provider?.slug || 'unknown',
      };
    }
    
    // 兼容旧的 model_config 方式
    if (tool.model_config) {
      return {
        providerId: tool.model_config.provider_id || 1,
        modelName: tool.model_config.default_model || 'coze-image',
        provider: tool.model_config.model_source || 'coze',
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取工具模型配置失败:', error);
    return null;
  }
}

// 图片生成模型映射
const IMAGE_MODELS = {
  // 扣子内置模型
  'coze-image': { provider: 'coze', model: 'coze-image' },
  // 4sapi 图片生成模型
  'gpt-image2': { provider: '4sapi', model: 'gpt-image-2' },
  'dall-e-3': { provider: '4sapi', model: 'dall-e-3' },
  'stable-diffusion-3': { provider: '4sapi', model: 'stable-diffusion-3' },
} as const;

type ImageModel = keyof typeof IMAGE_MODELS;

// 通过4sapi生成图片
async function generateWith4SAPI(
  prompt: string,
  model: string,
  size: string,
  image?: string | string[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  try {
    // 检查4sAPI是否启用（ENABLE_4SAPI=true才启用）
    if (process.env.ENABLE_4SAPI !== 'true') {
      return { success: false, error: '4sapi功能未启用，请设置 ENABLE_4SAPI=true' };
    }
    
    // 4sAPI密钥 - 支持多种环境变量名称
    const apiKey = process.env.FOURS_API_KEY 
      || process.env.OPENAI_API_KEY 
      || process.env.API4S_KEY;
    
    const apiUrl = process.env.API4S_URL || 'https://api.4sapi.cn/v1';
    
    if (!apiKey || apiKey === 'your-api-key-here') {
      return { success: false, error: '4sapi API密钥未配置' };
    }

    const requestBody: any = {
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
      console.error('4sapi图片生成失败:', response.status, errorText);
      return { success: false, error: `API错误: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return {
        success: true,
        imageUrls: data.data.map((item: any) => item.url),
      };
    }

    return { success: false, error: '未返回图片数据' };
  } catch (error: any) {
    console.error('4sapi调用失败:', error);
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
 * @param prompt 提示词
 * @param model 模型名称（如 'coze-image', 'gpt-image2'）
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
      const modelInfo = await getToolModelConfig(toolId);
      if (modelInfo) {
        model = modelInfo.modelName || model;
        console.log(`工具 ${toolId} 使用模型:`, model);
      }
    } catch (error) {
      console.error('获取工具模型配置失败，使用默认模型:', error);
    }
  }

  const modelKey = model as ImageModel;
  const modelConfig = IMAGE_MODELS[modelKey] || IMAGE_MODELS['coze-image'];

  console.log('使用模型:', { model, modelConfig });

  if (modelConfig.provider === '4sapi') {
    // 使用4sapi生成
    return await generateWith4SAPI(prompt, modelConfig.model, size, image);
  } else {
    // 使用扣子SDK
    const client = createCozeClient(customHeaders);
    
    const requestParams: any = {
      prompt,
      size,
      watermark: false,
    };

    // 如果有参考图片
    if (image) {
      requestParams.image = Array.isArray(image) ? image : [image];
    }

    const response = await client.generate(requestParams);
    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls && helper.imageUrls.length > 0) {
      return { success: true, imageUrls: helper.imageUrls };
    }

    return {
      success: false,
      error: helper.errorMessages?.join(', ') || '生成失败'
    };
  }
}

/**
 * 获取可用的图片生成模型列表
 */
export function getAvailableImageModels() {
  return [
    { id: 'coze-image', name: '扣子图片生成', provider: 'coze', price: 0, description: '免费，豆包SeeDream模型' },
    { id: 'gpt-image2', name: 'GPT Image 2', provider: '4sapi', price: 0.01, description: '$0.01/张，支持图生图' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: '4sapi', price: 0.04, description: '$0.04/张，OpenAI模型' },
    { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', provider: '4sapi', price: 0.005, description: '$0.005/张，开源模型' },
  ];
}
