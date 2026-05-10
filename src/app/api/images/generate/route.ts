import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';
import { HeaderUtils } from 'coze-coding-dev-sdk';
import { buildPrompt, ratioToSize } from '@/lib/prompt-engine';

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

    // 构建工具专属增强提示词（含guardrail负面词）
    const promptResult = buildPrompt({
      prompt: prompt || '',
      toolType: effectiveToolId,
      style,
      subtype,
      ratio,
      hasImage,
      layoutMode: undefined,
    });

    const effectiveCount = Math.max(1, Math.min(count || 1, 6));
    console.log(`[ImagesGenerate] tool=${effectiveToolId}, count=${effectiveCount}, hasImage=${hasImage}, ratio=${ratio || 'default'}`);

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 并行生成多张图片（传入负面词增强质量控制）
    const promises = Array.from({ length: effectiveCount }, () =>
      generateWithModel(
        promptResult.fullPrompt,
        model || 'coze-image',
        finalSize,
        customHeaders,
        effectiveToolId,
        referenceImage,
        promptResult.negativePrompt
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
