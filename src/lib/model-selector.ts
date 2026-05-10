/**
 * 模型选择器 - 统一处理不同模型的图片生成
 * 
 * 核心原则：从数据库读取模型配置，按 providerSlug 分发到不同的生成方式
 * - providerSlug 含 "coze" → 走扣子 SDK（ImageGenerationClient，支持文生图+图生图）
 * - 其他 → 走 OpenAI 兼容 API（4sapi 等），api_url/api_key 从 model_providers 表读取
 * 
 * Coze SDK 图生图：通过 image 参数传入参考图片 URL，模型原生支持保持商品形态
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
 * 解析 API 错误响应，返回用户友好的错误信息
 */
function parseApiError(responseStatus: number, errorText: string, model: string): string {
  let userMsg = `API错误(${responseStatus})`;
  try {
    const errJson = JSON.parse(errorText);
    const apiMsg = errJson?.error?.message || errJson?.message || '';
    if (apiMsg.includes('Model disabled') || apiMsg.includes('disabled')) {
      userMsg = `模型 ${model} 在服务端已禁用，请切换其他模型或联系服务商`;
    } else if (apiMsg.includes('No available channel') || apiMsg.includes('无可用渠道')) {
      userMsg = `模型 ${model} 当前无可用渠道，请切换其他模型`;
    } else if (apiMsg.includes('负载已饱和')) {
      userMsg = `模型 ${model} 当前负载饱和，请稍后重试或切换其他模型`;
    } else if (apiMsg.includes('Invalid') || apiMsg.includes('invalid')) {
      userMsg = `模型 ${model} 验证失败，请检查API Key是否有效`;
    } else if (apiMsg) {
      userMsg = `${model} 生成失败: ${apiMsg.substring(0, 80)}`;
    }
  } catch {}
  return userMsg;
}

/**
 * 解析图片 URL 列表
 */
function parseImageUrls(data: any): string[] | null {
  if (data?.data && data.data.length > 0) {
    return data.data
      .map((item: any) => item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null))
      .filter(Boolean);
  }
  return null;
}

/**
 * 通过 OpenAI 兼容 API 生成图片（4sapi 等）
 * api_url 和 api_key 从数据库 model_providers 表读取
 *
 * 文生图：POST /images/generations (JSON)
 * 图生图：POST /images/edits (multipart/form-data)
 * 
 * 关键改进：当提供了参考图片时，优先走图生图，失败时不再静默降级到文生图
 * （静默降级会导致商品失真，因为文生图完全丢失了参考图片信息）
 */
async function generateWithOpenAICompatible(
  prompt: string,
  model: string,
  size: string,
  apiUrl: string,
  apiKey: string,
  image?: string | string[],
  negativePrompt?: string
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

    // 文生图通用函数
    const textToImage = async (): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> => {
      const requestBody: Record<string, any> = {
        model: model,
        prompt: prompt,
        n: 1,
        response_format: 'url',
        size: imageSize,
        ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
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
        return { success: false, error: parseApiError(response.status, errorText, model) };
      }

      const data = await response.json();
      const urls = parseImageUrls(data);
      if (urls) {
        return { success: true, imageUrls: urls };
      }

      return { success: false, error: '未返回图片数据' };
    };

    // 判断是否有参考图片
    const hasImage = image && (Array.isArray(image) ? image.length > 0 && image[0] : image);
    const imageInput = hasImage
      ? (Array.isArray(image!) ? image![0] : image!)
      : null;

    if (imageInput) {
      // ===== 图生图：使用 /images/edits + multipart/form-data =====

      // 处理图片来源：URL → 下载 → Buffer；base64 → 直接解码
      let imageBuffer: Buffer;
      let mimeType = 'image/png';

      if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        // URL 图片：先下载再转 Buffer
        const imgResp = await fetch(imageInput, { redirect: 'follow' });
        if (!imgResp.ok) {
          console.error('[ModelSelector] 参考图片下载失败，状态:', imgResp.status);
          return { success: false, error: '参考图片下载失败，请检查图片链接是否有效' };
        }
        const contentType = imgResp.headers.get('content-type') || 'image/jpeg';
        if (contentType.includes('png')) mimeType = 'image/png';
        else if (contentType.includes('webp')) mimeType = 'image/webp';
        else mimeType = 'image/jpeg';
        const arrayBuf = await imgResp.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      } else if (imageInput.startsWith('data:')) {
        // base64 data URL
        const base64Match = imageInput.match(/^data:(?:image\/(\w+))?;base64,(.+)$/);
        if (base64Match) {
          imageBuffer = Buffer.from(base64Match[2], 'base64');
          const detectedType = base64Match[1];
          if (detectedType === 'png') mimeType = 'image/png';
          else if (detectedType === 'webp') mimeType = 'image/webp';
          else mimeType = 'image/jpeg';
        } else {
          imageBuffer = Buffer.from(imageInput.split(',')[1] || imageInput, 'base64');
          mimeType = 'image/jpeg';
        }
      } else {
        // 纯 base64 字符串（无 data: 前缀）
        imageBuffer = Buffer.from(imageInput, 'base64');
        mimeType = 'image/png';
      }

      const formData = new FormData();
      formData.append('model', model);
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('response_format', 'url');
      formData.append('size', imageSize);
      const imageBlob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
      formData.append('image', imageBlob, mimeType === 'image/png' ? 'image.png' : 'image.jpg');

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
        
        const errStr = errorText.toLowerCase();
        const isModelNotSupportEdit = errStr.includes('does not support') || errStr.includes('not supported') || errStr.includes('unsupported');
        
        if (isModelNotSupportEdit) {
          console.warn('[ModelSelector] 模型不支持图生图，降级为文生图（注意：可能导致商品失真）');
          return await textToImage();
        }
        
        return { success: false, error: parseApiError(response.status, errorText, model) };
      }

      const data = await response.json();
      const urls = parseImageUrls(data);
      if (urls) {
        return { success: true, imageUrls: urls };
      }

      return { success: false, error: '图生图未返回图片数据' };
    } else {
      // ===== 纯文生图 =====
      return await textToImage();
    }
  } catch (error: any) {
    console.error('[ModelSelector] API调用失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 将 base64 图片数据上传到对象存储，返回公开 URL
 * Coze SDK 的 image 参数需要公开可访问的 URL，不接受 base64
 */
async function uploadBase64ToStorage(base64Data: string, filename: string): Promise<string | null> {
  try {
    // 通过内部上传 API 上传到 Supabase Storage
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('type', 'temp');

    const uploadResp = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (uploadResp.ok) {
      const result = await uploadResp.json();
      if (result.success && result.data?.url) {
        return result.data.url;
      }
    }
    
    console.warn('[ModelSelector] 上传到存储失败，状态:', uploadResp.status);
    return null;
  } catch (error) {
    console.error('[ModelSelector] 上传base64到存储失败:', error);
    return null;
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
 * Coze SDK 图生图：通过 image 参数传入参考图片 URL，SeeDream 模型原生支持
 * - Doubao-Seedream-4.5: 支持文生图+图生图+多图融合+图片编辑，4K超高清
 * - Doubao-Seedream-5.0-lite: 支持文生图+图生图+联网检索，解析复杂视觉指令
 * 
 * @param prompt 提示词
 * @param model 模型名称（fallback，如果无 toolId 时使用）
 * @param size 图片尺寸
 * @param customHeaders 自定义请求头
 * @param toolId 可选的工具ID，用于获取模型配置
 * @param image 可选的参考图片（URL 或 base64）
 * @returns 图片URL数组或错误
 */
export async function generateWithModel(
  prompt: string,
  model: string = 'coze-image',
  size: string = '2K',
  customHeaders: Record<string, string> = {},
  toolId?: string,
  image?: string | string[],
  negativePrompt?: string
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  // 如果传入了 toolId，优先从工具配置获取模型
  if (toolId) {
    try {
      const config = await getToolModelConfig(toolId);
      if (config) {
        
        const isCoze = config.providerSlug.includes('coze');
        
        if (isCoze) {
          // ===== Coze SDK 路径（支持文生图+图生图）=====
          const client = createCozeClient(customHeaders);
          // Build effective prompt with negative terms appended
          let effectivePrompt = prompt;
          if (negativePrompt) {
            effectivePrompt = `${prompt}. Avoid: ${negativePrompt}`;
          }
          
          const requestParams: ImageGenerationRequest = {
            prompt: effectivePrompt,
            size,
            watermark: false,
          };
          
          // 设置模型（如果配置了具体模型名）
          if (config.modelName && config.modelName !== 'coze-image') {
            requestParams.model = config.modelName;
          }
          
          // 图生图：如果有参考图片，通过 image 参数传入
          if (image) {
            const imageInput = Array.isArray(image) ? image[0] : image;
            if (imageInput) {
              // Coze SDK 需要 URL 格式的图片，处理 base64 情况
              let imageUrl = imageInput;
              
              if (imageInput.startsWith('data:') || (!imageInput.startsWith('http://') && !imageInput.startsWith('https://'))) {
                // base64 图片需要先上传到存储获取 URL
                const base64Data = imageInput.startsWith('data:') 
                  ? imageInput.split(',')[1] || imageInput 
                  : imageInput;
                const uploadedUrl = await uploadBase64ToStorage(base64Data, `ref-${Date.now()}.png`);
                if (uploadedUrl) {
                  imageUrl = uploadedUrl;
                } else {
                  console.warn('[ModelSelector] base64上传失败，跳过图生图，使用纯文生图（可能影响保真度）');
                  imageUrl = '';
                }
              }
              
              if (imageUrl) {
                requestParams.image = imageUrl;
              }
            }
          }
          
          let response;
          try {
            response = await client.generate(requestParams);
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            if (errMsg.includes('403') || errMsg.includes('ErrSourceLimit') || errMsg.includes('Forbidden')) {
              return { success: false, error: '模型服务暂时不可用，请稍后重试' };
            }
            return { success: false, error: `图片生成失败: ${errMsg.substring(0, 100)}` };
          }
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
            image,
            negativePrompt
          );
        }
      }
    } catch (error) {
      console.error('[ModelSelector] 获取工具模型配置失败，使用默认模型:', error);
    }
  }

  // 无 toolId 时的 fallback 逻辑
  
  // 根据模型名推断 provider
  const isCozeModel = model.includes('coze') || model.includes('doubao') || model.includes('seedream');
  
  if (isCozeModel) {
    // Build effective prompt with negative terms appended
    let effectivePrompt = prompt;
    if (negativePrompt) {
      effectivePrompt = `${prompt}. Avoid: ${negativePrompt}`;
    }
    
    const client = createCozeClient(customHeaders);
    const requestParams: ImageGenerationRequest = {
      prompt: effectivePrompt,
      size,
      watermark: false,
    };
    if (model !== 'coze-image') {
      requestParams.model = model;
    }
    
    // 图生图：如果有参考图片
    if (image) {
      const imageInput = Array.isArray(image) ? image[0] : image;
      if (imageInput) {
        let imageUrl = imageInput;
        
        if (imageInput.startsWith('data:') || (!imageInput.startsWith('http://') && !imageInput.startsWith('https://'))) {
          const base64Data = imageInput.startsWith('data:') 
            ? imageInput.split(',')[1] || imageInput 
            : imageInput;
          const uploadedUrl = await uploadBase64ToStorage(base64Data, `ref-${Date.now()}.png`);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          } else {
            imageUrl = '';
          }
        }
        
        if (imageUrl) {
          requestParams.image = imageUrl;
        }
      }
    }
    
    let response;
    try {
      response = await client.generate(requestParams);
      console.error('[generateWithModel] SDK response:', JSON.stringify(response).substring(0, 500));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[generateWithModel] Coze SDK error:', errMsg.substring(0, 300));
      // 403 = Coze 资源配额耗尽
      if (errMsg.includes('403') || errMsg.includes('ErrSourceLimit') || errMsg.includes('Forbidden')) {
        return { success: false, error: '模型服务暂时不可用，请稍后重试' };
      }
      // 429 = 请求过于频繁
      if (errMsg.includes('429') || errMsg.includes('rate limit') || errMsg.includes('Too Many')) {
        return { success: false, error: '生成请求过于频繁，请稍后重试' };
      }
      return { success: false, error: `生成失败：${errMsg.substring(0, 100)}` };
    }
    const helper = new ImageGenerationResponseHelper(response);
    if (helper.success && helper.imageUrls && helper.imageUrls.length > 0) {
      return { success: true, imageUrls: helper.imageUrls };
    }
    return { success: false, error: helper.errorMessages?.join(', ') || '生成失败' };
  } else {
    // 非 coze 模型，尝试从环境变量读取 4sapi 配置
    const apiKey = process.env.API4S_KEY || '';
    const apiUrl = process.env.API4S_URL || 'https://4sapi.com';
    return await generateWithOpenAICompatible(prompt, model, size, apiUrl, apiKey, image, negativePrompt);
  }
}

/**
 * 获取可用的图片生成模型列表
 */
export function getAvailableImageModels() {
  return [
    { id: 'doubao-seedream-4-5-251128', name: 'Doubao SeeDream 4.5', provider: 'coze', price: 0, description: '免费，支持文生图+图生图+多图融合，4K超高清', supportsImageEdit: true },
    { id: 'doubao-seedream-5-0-260128', name: 'Doubao SeeDream 5.0 Lite', provider: 'coze', price: 0, description: '免费，支持文生图+图生图+联网检索，复杂视觉指令', supportsImageEdit: true },
    { id: 'gpt-image-2', name: 'GPT Image 2', provider: '4sapi', price: 0.01, description: '$0.01/张，支持图生图，商品保真度高', supportsImageEdit: true },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: '4sapi', price: 0.04, description: '$0.04/张，OpenAI模型（仅文生图）', supportsImageEdit: false },
  ];
}
