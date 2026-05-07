/**
 * 模型选择器 - 统一处理不同模型的图片生成
 * 
 * 核心原则：从数据库读取模型配置，按 providerSlug 分发到不同的生成方式
 * - providerSlug 含 "coze" → 走扣子 SDK（仅文生图，不支持参考图片）
 * - 其他 → 走 OpenAI 兼容 API（4sapi 等），api_url/api_key 从 model_providers 表读取
 * 
 * 禁止硬编码 API Key、API URL、模型名
 */

import { ImageGenerationClient, ImageGenerationResponseHelper, ImageGenerationRequest, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { LLMClient } from 'coze-coding-dev-sdk';
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

    // 文生图通用函数
    const textToImage = async (): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> => {
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
      console.log(`[ModelSelector] 图生图模式，模型: ${model}，使用 /images/edits 端点`);

      // 处理图片来源：URL → 下载 → Buffer；base64 → 直接解码
      let imageBuffer: Buffer;
      let mimeType = 'image/png';

      if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        // URL 图片：先下载再转 Buffer
        console.log('[ModelSelector] 检测到URL图片，先下载:', imageInput.substring(0, 80));
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
          // 保留原始 MIME 类型（gpt-image-2 对 PNG 支持更好）
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
        mimeType = 'image/png'; // 默认 PNG，gpt-image-2 对 PNG 兼容性更好
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
        
        // 图生图失败时，检查是否可以降级到文生图
        // 只有在参考图片下载失败等非关键场景才降级
        // 对于商品图生成场景，降级到文生图会导致严重失真，不应该静默降级
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

// 创建扣子图片生成客户端
function createCozeClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
}

// 创建扣子 LLM 客户端（用于视觉分析）
function createCozeLLMClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new LLMClient(config, customHeaders);
}

/**
 * 视觉 LLM 分析参考图片 — 提取商品的详细视觉描述
 * 
 * 当 Coze SDK 不支持图生图时，用视觉模型分析参考图片，
 * 将商品的形状、颜色、材质等视觉信息提取出来，
 * 写入文生图的 prompt 中，从而弥补"看不到原图"的缺陷。
 * 
 * 内置缓存：同一张图片（基于内容hash）只分析一次，避免重复调用。
 */

// 视觉分析结果缓存（进程级，避免同一请求内重复分析）
const visionCache = new Map<string, { description: string; timestamp: number }>();
const VISION_CACHE_TTL = 5 * 60 * 1000; // 5分钟过期

// 简单的字符串hash，用于缓存key
function simpleHash(str: string): string {
  let hash = 0;
  const sample = str.length > 200 ? str.substring(0, 100) + str.substring(str.length - 100) : str;
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

async function analyzeImageWithVision(
  imageUrl: string,
  customHeaders: Record<string, string> = {}
): Promise<string> {
  try {
    // 检查缓存
    const cacheKey = simpleHash(imageUrl);
    const cached = visionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < VISION_CACHE_TTL) {
      console.log('[ModelSelector] 视觉分析命中缓存，跳过重复分析');
      return cached.description;
    }
    
    const client = createCozeLLMClient(customHeaders);
    
    // 构建 vision 消息：图片 + 分析指令
    const imageContent = imageUrl.startsWith('data:') 
      ? imageUrl 
      : imageUrl;

    const messages = [
      {
        role: 'system' as const,
        content: '你是一个专业的商品视觉分析师。你的任务是根据商品图片，生成一段精确的视觉描述，用于指导AI图片生成模型还原该商品。描述必须聚焦于商品本身的视觉属性，不要描述背景或环境。',
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'image_url' as const,
            image_url: { url: imageContent },
          },
          {
            type: 'text' as const,
            text: `请仔细观察这张商品图片，然后用英文生成一段精确的视觉描述（100-150词），必须包含以下要素：

1. **Product Type & Shape**: 商品类型和整体外形（圆柱体、扁平矩形、锥形等）
2. **Exact Colors**: 精确颜色描述（主色、辅色、渐变、光泽度）
3. **Material & Texture**: 材质和表面质感（金属光泽、磨砂、透明、哑光、丝绒等）
4. **Key Details**: 关键视觉细节（Logo位置、图案、文字、装饰元素）
5. **Proportions**: 比例关系（高宽比、各部件大小关系）
6. **Distinctive Features**: 区别于同类产品的独特视觉特征

格式要求：直接输出描述段落，不要加标题或编号，以 "The product is a..." 开头。这段描述将被嵌入AI图片生成的prompt中，所以必须精确到能唯一识别这个商品。`,
          },
        ],
      },
    ];

    const response = await client.invoke(messages as any, {
      model: 'doubao-seed-1-6-vision',
      temperature: 0.3, // 低温度保证描述准确性
    });

    if (response && response.content) {
      const description = response.content.trim();
      console.log('[ModelSelector] 视觉分析成功，描述长度:', description.length);
      
      // 写入缓存
      visionCache.set(cacheKey, { description, timestamp: Date.now() });
      
      // 清理过期缓存（简单策略：超过100条时清理）
      if (visionCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of visionCache) {
          if (now - value.timestamp > VISION_CACHE_TTL) {
            visionCache.delete(key);
          }
        }
      }
      
      return description;
    }

    console.warn('[ModelSelector] 视觉分析返回为空');
    return '';
  } catch (error) {
    console.error('[ModelSelector] 视觉分析失败:', error);
    return '';
  }
}

/**
 * 统一的图片生成函数
 * 
 * 核心逻辑：如果传了 toolId，从数据库获取模型配置（providerSlug + apiUrl + apiKey），
 * 根据 providerSlug 决定走扣子 SDK 还是 OpenAI 兼容 API。
 * 
 * 重要提示：Coze SDK 不支持图生图（参考图片会被忽略），需要图生图的工具必须配置 4sapi 提供商
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
          // Coze SDK 走文生图（不支持图生图）
          // 关键改进：如果调用方传了参考图片，先用视觉LLM分析图片提取视觉描述，
          // 再将描述融入prompt，弥补"看不到原图"的缺陷
          let enhancedPrompt = prompt;
          
          if (image) {
            const imageInput = Array.isArray(image) ? image[0] : image;
            if (imageInput) {
              console.log(`[ModelSelector] Coze不支持图生图，启动视觉LLM预分析参考图片...`);
              const visualDescription = await analyzeImageWithVision(imageInput, customHeaders);
              
              if (visualDescription) {
                // 将视觉描述注入prompt开头，强化商品保真
                enhancedPrompt = `[PRODUCT VISUAL REFERENCE - MUST FOLLOW EXACTLY]: ${visualDescription}\n\n${prompt}`;
                console.log('[ModelSelector] 已将视觉描述融入prompt，商品保真度将大幅提升');
              } else {
                console.warn('[ModelSelector] 视觉分析返回为空，使用原始prompt（可能影响商品保真度）');
              }
            }
          }
          
          const client = createCozeClient(customHeaders);
          const requestParams: ImageGenerationRequest = {
            prompt: enhancedPrompt,
            size,
            watermark: false,
          };
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
    // Coze 模型不支持图生图，如果有参考图片，先用视觉LLM分析
    let enhancedPrompt = prompt;
    
    if (image) {
      const imageInput = Array.isArray(image) ? image[0] : image;
      if (imageInput) {
        console.log('[ModelSelector] Coze fallback: 启动视觉LLM预分析参考图片...');
        const visualDescription = await analyzeImageWithVision(imageInput);
        
        if (visualDescription) {
          enhancedPrompt = `[PRODUCT VISUAL REFERENCE - MUST FOLLOW EXACTLY]: ${visualDescription}\n\n${prompt}`;
          console.log('[ModelSelector] 已将视觉描述融入prompt');
        }
      }
    }
    
    const client = createCozeClient(customHeaders);
    const requestParams: ImageGenerationRequest = {
      prompt: enhancedPrompt,
      size,
      watermark: false,
    };
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
    { id: 'gpt-image-2', name: 'GPT Image 2', provider: '4sapi', price: 0.01, description: '$0.01/张，支持图生图，商品保真度高', supportsImageEdit: true },
    { id: 'coze-image', name: '扣子图片生成', provider: 'coze', price: 0, description: '免费，豆包SeeDream模型（视觉LLM增强保真度）', supportsImageEdit: false },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: '4sapi', price: 0.04, description: '$0.04/张，OpenAI模型（仅文生图）', supportsImageEdit: false },
    { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', provider: '4sapi', price: 0.005, description: '$0.005/张，开源模型', supportsImageEdit: false },
  ];
}
