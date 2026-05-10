import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';
import { HeaderUtils } from 'coze-coding-dev-sdk';

// ===== 工具类型 → Prompt 前缀映射 =====
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
};

// ===== 比例 → SDK size 参数映射 =====
const RATIO_TO_SIZE: Record<string, string> = {
  '1:1':  '2560x2560',
  '3:4':  '2560x3414',
  '4:3':  '3414x2560',
  '4:5':  '2560x3200',
  '5:4':  '3200x2560',
  '2:3':  '2560x3840',
  '3:2':  '3840x2560',
  '16:9': '2560x1440',
  '9:16': '1440x2560',
};

function ratioToSize(ratio: string | undefined, fallback: string = '2K'): string {
  if (!ratio) return fallback;
  return RATIO_TO_SIZE[ratio] || fallback;
}

// ===== 生成类型中文标签 =====
export const SUBTYPE_LABELS: Record<string, Record<string, string>> = {
  'product-generator': {
    'white-bg': '白底主图',
    'lifestyle': '场景图',
    'detail': '细节展示',
    'group': '组合搭配',
  },
  'xiaohongshu-generator': {
    'beauty': '美妆种草',
    'fashion': '穿搭分享',
    'lifestyle': '生活好物',
    'food': '美食探店',
  },
  'ai-photo': {
    'korean': '韩系写真',
    'retro': '复古写真',
    'cyberpunk': '赛博朋克',
    'japanese': '日系写真',
  },
};

// ===== 风格中文标签 =====
export const STYLE_LABELS: Record<string, Record<string, string>> = {
  'product-generator': {
    'premium': '高级质感',
    'minimal': '极简风格',
    'lifestyle': '生活场景',
  },
  'xiaohongshu-generator': {
    'fresh': '清新自然',
    'premium': '精致高级',
    'ins': 'INS 风格',
    'viral': '爆款风格',
  },
  'ai-photo': {
    'natural': '自然清新',
    'cinematic': '电影感',
    'artistic': '艺术创意',
    'magazine': '杂志封面',
  },
};

/**
 * 通用图片生成 API
 * 支持多张并行生成（count 参数）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      image,
      images,
      size, 
      ratio,
      style, 
      subtype,
      model, 
      tool_id,
      type,
      count = 1,
    } = body;
    
    const finalSize = ratioToSize(ratio, size || '2K');
    const effectiveToolId = tool_id || type || 'product-generator';
    
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

    const effectiveCount = Math.max(1, Math.min(count || 1, 6));
    console.log(`[ImagesGenerate] tool=${effectiveToolId}, count=${effectiveCount}, hasImage=${hasImage}, ratio=${ratio || 'default'}`);

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 并行生成多张图片
    const promises = Array.from({ length: effectiveCount }, () =>
      generateWithModel(
        finalPrompt,
        model || 'coze-image',
        finalSize,
        customHeaders,
        effectiveToolId,
        referenceImage
      )
    );

    const results = await Promise.allSettled(promises);

    // 收集所有成功生成的图片 URL
    const allImageUrls: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.imageUrls) {
        allImageUrls.push(...result.value.imageUrls);
      } else {
        const errorMsg = result.status === 'fulfilled'
          ? (result.value.error || `第 ${index + 1} 张生成失败`)
          : `第 ${index + 1} 张生成异常`;
        errors.push(errorMsg);
      }
    });

    if (allImageUrls.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrls: allImageUrls,
        requestedCount: effectiveCount,
        successCount: allImageUrls.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errors.join('; ') || '图片生成失败',
    }, { status: 500 });
  } catch (error: any) {
    console.error('[图片生成] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
