import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';
import { HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 图片处理 API - 抠图/换背景
 * 
 * 支持 CreateWorkbench 传入的格式：
 * - images: string[] (图片URL数组)
 * - operation: string (操作类型)
 * - subtype: string (子类型)
 * 
 * 也兼容旧格式：
 * - imageUrl: string (单张图片URL)
 * - processType: string (处理类型)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      images,          // 图片URL数组（CreateWorkbench）
      imageUrl,        // 单张图片URL（兼容旧调用）
      operation,       // 操作类型（CreateWorkbench）
      processType,     // 处理类型（兼容旧调用）
      subtype,         // 子类型（transparent/solid/custom）
      backgroundColor, // 自定义背景颜色
    } = body;
    
    // 统一参数
    const effectiveProcessType = operation || processType || 'background-removal';
    const imageList = images && Array.isArray(images) && images.length > 0
      ? images
      : imageUrl
        ? [imageUrl]
        : [];

    if (imageList.length === 0) {
      return NextResponse.json({ error: '请提供需要处理的图片' }, { status: 400 });
    }

    // 处理第一张图片（后续可扩展为批量处理）
    const sourceImage = imageList[0];
    
    // 根据子类型构建不同的提示词
    let prompt = '';
    switch (effectiveProcessType) {
      case 'background-removal':
      case 'remove-background':
        if (subtype === 'transparent') {
          prompt = 'Remove the background from this image completely. Make the background fully transparent. Keep only the main subject/object with clean edges. High quality cutout.';
        } else if (subtype === 'solid') {
          prompt = 'Remove the background from this image and replace it with a clean solid white background. Keep the main subject/object perfectly intact with clean edges. Professional product photography look.';
        } else if (subtype === 'custom' && backgroundColor) {
          prompt = `Remove the background from this image and replace it with a solid ${backgroundColor} color background. Keep the main subject/object perfectly intact with clean edges.`;
        } else {
          prompt = 'Remove the background from this image completely. Make the background fully transparent. Keep only the main subject/object with clean edges. High quality cutout.';
        }
        break;
      default:
        prompt = 'Process this image: remove the background and make it transparent. Keep the main subject intact.';
    }

    console.log(`[ImagesProcess] type=${effectiveProcessType}, subtype=${subtype}, hasImage=true`);

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const result = await generateWithModel(
      prompt,
      'coze-image',
      '2K',
      customHeaders,
      'background-removal',  // 使用 background-removal 工具的数据库配置
      sourceImage
    );
    
    if (result.success && result.imageUrls && result.imageUrls.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrls: result.imageUrls,
      });
    }
    
    return NextResponse.json({ 
      success: false,
      error: result.error || '图片处理失败',
    }, { status: 500 });
  } catch (error: any) {
    console.error('[图片处理] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
