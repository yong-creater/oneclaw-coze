import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';
import { HeaderUtils } from 'coze-coding-dev-sdk';

// ===== 工具类型 → Prompt 前缀映射 =====
// 每种工具根据其特色构建专属提示词，确保生成效果符合工具定位

const PRODUCT_FIDELITY_PREFIX = `CRITICAL: You MUST preserve the EXACT product from the reference image. The product's shape, color, material, proportions, and ALL visual details must remain IDENTICAL. ONLY change the background, lighting, and scene environment. NEVER deform, distort, or reimagine the product.

RULES:
1. Product MUST look EXACTLY like the reference image — same shape, color, material, proportions.
2. NEVER deform, distort, reshape, or stylize the product.
3. ONLY create the background, lighting, scene, and environment.
4. NO text, NO watermark, NO logo, NO badges, NO graphic overlays.

`;

const TOOL_PROMPT_BUILDERS: Record<string, (params: {
  prompt: string;
  subtype?: string;
  style?: string;
  hasImage: boolean;
}) => string> = {
  // AI商品图
  'product-generator': ({ prompt, subtype, style, hasImage }) => {
    const fidelityPrefix = hasImage ? PRODUCT_FIDELITY_PREFIX : '';
    const subtypeMap: Record<string, string> = {
      'white-bg': 'clean white background product photo, centered, studio lighting, e-commerce main image',
      'lifestyle': 'lifestyle scene photo, product in real environment, natural lighting, warm atmosphere',
      'detail': 'close-up detail shot, showing product material and texture, macro photography, shallow depth of field',
      'group': 'product group/combo shot, multiple items arranged aesthetically, flat lay or styled composition',
    };
    const styleMap: Record<string, string> = {
      'premium': 'premium luxury feel, high-end studio quality',
      'minimal': 'minimalist clean aesthetic, simple and elegant',
      'lifestyle': 'lifestyle casual feel, warm and inviting',
    };
    const subtypeDesc = subtypeMap[subtype || 'white-bg'] || subtypeMap['white-bg'];
    const styleDesc = styleMap[style || 'premium'] || '';
    return `${fidelityPrefix}Create a professional e-commerce product photo.
${subtypeDesc}
${styleDesc}
${prompt ? `Product description: ${prompt}` : ''}
High quality, professional photography, 4K resolution.`;
  },

  // 小红书封面
  'xiaohongshu-generator': ({ prompt, subtype, style, hasImage }) => {
    const fidelityPrefix = hasImage ? PRODUCT_FIDELITY_PREFIX : '';
    const subtypeMap: Record<string, string> = {
      'beauty': 'beauty/cosmetics cover, makeup product showcase, soft pink tones',
      'fashion': 'fashion outfit cover, OOTD style, trendy and chic',
      'lifestyle': 'lifestyle recommendation cover, cozy and aesthetic, daily essentials',
      'food': 'food/restaurant cover, appetizing food photography, warm tones',
    };
    const styleMap: Record<string, string> = {
      'fresh': 'fresh and natural style, soft lighting, pastel tones',
      'premium': 'premium and refined style, luxurious feel, rich colors',
      'ins': 'Instagram aesthetic, clean and trendy, minimalist chic',
      'viral': 'Xiaohongshu viral style, eye-catching, bold composition',
    };
    const subtypeDesc = subtypeMap[subtype || 'beauty'] || '';
    const styleDesc = styleMap[style || 'fresh'] || '';
    return `${fidelityPrefix}Create a Xiaohongshu (Little Red Book) cover image.
${subtypeDesc}
${styleDesc}
${prompt ? `Content: ${prompt}` : ''}
Vertical 3:4 ratio, eye-catching thumbnail, social media aesthetic.`;
  },

  // AI写真
  'ai-photo': ({ prompt, subtype, style }) => {
    const subtypeMap: Record<string, string> = {
      'korean': 'Korean style portrait, soft natural lighting, clean and fresh, minimal makeup',
      'retro': 'retro/vintage portrait, warm film tones, nostalgic atmosphere, classic styling',
      'cyberpunk': 'cyberpunk portrait, neon lights, futuristic vibes, edgy and bold',
      'japanese': 'Japanese style portrait, soft pastel tones, natural and serene, wabi-sabi aesthetic',
    };
    const styleMap: Record<string, string> = {
      'natural': 'natural and fresh, soft diffused lighting, candid feel',
      'cinematic': 'cinematic film look, dramatic lighting, movie poster quality',
      'artistic': 'artistic and creative, unique composition, gallery quality',
      'magazine': 'high fashion magazine cover, editorial quality, professional retouching',
    };
    const subtypeDesc = subtypeMap[subtype || 'korean'] || '';
    const styleDesc = styleMap[style || 'natural'] || '';
    return `Create a professional AI portrait photo.
${subtypeDesc}
${styleDesc}
${prompt ? `Style notes: ${prompt}` : ''}
Professional photography, high resolution, stunning portrait quality.`;
  },

  // 海报设计
  'poster-design': ({ prompt, subtype, style, hasImage }) => {
    const fidelityPrefix = hasImage ? PRODUCT_FIDELITY_PREFIX : '';
    const subtypeMap: Record<string, string> = {
      'minimal-brand': 'minimalist brand poster, clean layout, elegant typography, lots of white space',
      'event-promo': 'event promotion poster, bold headline, vibrant colors, call-to-action',
      'social-media': 'social media post design, trendy layout, eye-catching visuals, share-worthy',
      'product-promo': 'product promotion poster, product-focused, benefit highlights, professional layout',
    };
    const styleMap: Record<string, string> = {
      'minimal': 'minimalist and sophisticated, clean lines, premium feel',
      'creative': 'creative and playful, bold colors, dynamic composition',
      'professional': 'professional and corporate, structured layout, trustworthy',
      'lifestyle': 'lifestyle and warm, inviting atmosphere, human connection',
    };
    const subtypeDesc = subtypeMap[subtype || 'minimal-brand'] || '';
    const styleDesc = styleMap[style || 'minimal'] || '';
    return `${fidelityPrefix}Create a professional design poster.
${subtypeDesc}
${styleDesc}
${prompt ? `Poster content/purpose: ${prompt}` : ''}
High quality graphic design, print-ready resolution.`;
  },

  // 商品详情页 (fallback, also uses product image style)
  'product-page': ({ prompt, subtype, style, hasImage }) => {
    const fidelityPrefix = hasImage ? PRODUCT_FIDELITY_PREFIX : '';
    const subtypeMap: Record<string, string> = {
      'full': 'complete product detail page, hero image + features + specifications layout',
      'highlight': 'selling point highlight page, key benefits with visual icons',
      'compare': 'comparison display page, before/after or feature comparison layout',
    };
    const styleMap: Record<string, string> = {
      'premium': 'premium luxury e-commerce detail page, high-end feel',
      'tech': 'tech product detail page, clean and modern, data-driven',
      'cute': 'cute and sweet style, pastel colors, friendly layout',
    };
    const subtypeDesc = subtypeMap[subtype || 'full'] || '';
    const styleDesc = styleMap[style || 'premium'] || '';
    return `${fidelityPrefix}Create an e-commerce product detail page image.
${subtypeDesc}
${styleDesc}
${prompt ? `Product info: ${prompt}` : ''}
Professional e-commerce quality, high resolution.`;
  },
};

/**
 * 通用图片生成 API
 * 
 * 统一入口，所有图片类工具（商品图、小红书、AI写真、海报、详情页）都通过此接口生成
 * 通过 tool_id 从数据库读取模型配置，按 providerSlug 分发到不同的生成方式
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      image,      // 单张参考图（兼容旧调用）
      images,     // 多张参考图（CreateWorkbench 传入）
      size, 
      style, 
      subtype,    // 子类型（白底/场景/细节 等）
      model, 
      tool_id,    // 工具 slug，用于从数据库读取模型配置
      type,       // 兼容旧调用的 type 字段
      count,      // 生成数量
    } = body;
    
    // 确定 tool_id：优先使用 tool_id，其次根据 type 推断
    const effectiveToolId = tool_id || type || 'product-generator';
    
    // 确定参考图片：优先 images 数组，其次 image 单张
    const imageArray = images && Array.isArray(images) && images.length > 0
      ? images
      : image
        ? [image]
        : [];
    const hasImage = imageArray.length > 0;
    const referenceImage = hasImage ? imageArray[0] : undefined;

    // 构建工具专属提示词
    const promptBuilder = TOOL_PROMPT_BUILDERS[effectiveToolId];
    const finalPrompt = promptBuilder 
      ? promptBuilder({ 
          prompt: prompt || '', 
          subtype, 
          style, 
          hasImage 
        })
      : (prompt || 'Generate a high-quality image');

    console.log(`[ImagesGenerate] tool=${effectiveToolId}, hasImage=${hasImage}, promptLen=${finalPrompt.length}`);

    // 使用统一模型调度
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const result = await generateWithModel(
      finalPrompt,
      model || 'coze-image',   // fallback 模型名
      size || '2K',             // 图片尺寸
      customHeaders,            // 转发请求头
      effectiveToolId,          // toolId，走数据库配置
      referenceImage            // 参考图片
    );
    
    if (result.success && result.imageUrls && result.imageUrls.length > 0) {
      // 如果请求了多张，且只生成了1张，可以循环使用（前端展示用）
      const returnedUrls = result.imageUrls;
      
      return NextResponse.json({
        success: true,
        imageUrls: returnedUrls,
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: result.error || '图片生成失败',
    }, { status: 500 });
  } catch (error: any) {
    console.error('[图片生成] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
