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

/**
 * 构建完整的 API Base URL
 * 数据库存储不含 /v1 的 base URL（如 https://4sapi.com），此函数自动补全 /v1
 * 如果 base 已包含 /v1 则不再重复添加
 */
export function buildApiBaseUrl(base: string): string {
  if (!base) return '';
  const trimmed = base.replace(/\/+$/, ''); // 去掉末尾斜杠
  if (trimmed.endsWith('/v1')) return trimmed;
  return `${trimmed}/v1`;
}

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
        apiUrl: isCoze ? '' : (process.env.API4S_URL || 'https://4sapi.com'),
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
 * 直接通过 provider slug 获取提供商配置（无需 utility_tools 记录）
 * 用于内部 API（如卖点分析、合规检测）不需要在精选工具列表中展示的场景
 */
export async function getProviderConfig(providerSlug: string): Promise<{ slug: string; api_url: string; api_key: string } | null> {
  try {
    const client = getSupabaseClient();
    const { data: provider, error } = await client
      .from('model_providers')
      .select('slug, api_url, api_key')
      .eq('slug', providerSlug)
      .single();
    
    if (error || !provider) {
      console.error('[ModelSelector] 查询提供商失败:', error);
      return null;
    }
    
    return provider;
  } catch (error) {
    console.error('[ModelSelector] 获取提供商配置失败:', error);
    return null;
  }
}

/**
 * 通过 OpenAI 兼容 API 生成图片（4sapi 等）
 * api_url 和 api_key 从数据库 model_providers 表读取
 *
 * 文生图：POST /images/generations (JSON)
 * 图生图：POST /images/edits (multipart/form-data)
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

    // 构建完整的 API base URL（自动补 /v1）
    const fullApiUrl = buildApiBaseUrl(apiUrl);

    // 解析尺寸
    let imageSize = '1024x1024';
    if (size === '2K') {
      imageSize = '1024x1024';
    } else if (size === '4K') {
      imageSize = '1792x1024';
    } else {
      imageSize = size || '1024x1024';
    }

    // 判断是否有参考图片
    const hasImage = image && (Array.isArray(image) ? image.length > 0 && image[0] : image);
    const imageInput = hasImage
      ? (Array.isArray(image!) ? image![0] : image!)
      : null;

    if (imageInput) {
      // ===== 图生图：使用 /images/edits + multipart/form-data =====
      console.log('[ModelSelector] 图生图模式，使用 /images/edits 端点');
      const formData = new FormData();
      formData.append('model', model);
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('response_format', 'url');
      formData.append('size', imageSize);

      // 处理 base64 图片 → Blob
      let base64Data = imageInput;
      let mimeType = 'image/jpeg';
      if (base64Data.startsWith('data:')) {
        const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageBlob = new Blob([imageBuffer], { type: mimeType });
      formData.append('image', imageBlob, 'image.png');

      const response = await fetch(`${fullApiUrl}/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ModelSelector] /images/edits 失败:', response.status, errorText?.substring(0, 200));
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
    } else {
      // ===== 文生图：使用 /images/generations + JSON =====
      console.log('[ModelSelector] 文生图模式，使用 /images/generations 端点');
      const requestBody: Record<string, any> = {
        model: model,
        prompt: prompt,
        n: 1,
        response_format: 'url',
        size: imageSize,
      };

      const response = await fetch(`${fullApiUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ModelSelector] /images/generations 失败:', response.status, errorText?.substring(0, 200));
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
    }
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
    const apiUrl = process.env.API4S_URL || 'https://4sapi.com';
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
