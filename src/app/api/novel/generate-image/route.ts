import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// 配图风格对应的提示词前缀
const STYLE_PROMPTS: Record<string, string> = {
  anime: 'Anime style illustration',
  realistic: 'Realistic digital painting',
  watercolor: 'Watercolor painting style',
  ink: 'Chinese ink painting style',
  cyberpunk: 'Cyberpunk neon style',
  fantasy: 'Epic fantasy art style',
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, size } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '请提供提示词' }, { status: 400 });
    }

    const stylePrefix = STYLE_PROMPTS[style || 'anime'] || STYLE_PROMPTS.anime;
    const fullPrompt = `${stylePrefix}, ${prompt}`;

    // 使用统一模型调度：toolId='novel' 从数据库读取配置
    const result = await generateWithModel(
      fullPrompt,
      'coze-image',   // fallback 模型
      size || '2K',   // 图片尺寸
      {},             // customHeaders
      'novel',        // toolId
    );

    if (result.success && result.imageUrls && result.imageUrls.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrls: result.imageUrls,
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: result.error || '图片生成失败',
    }, { status: 500 });
  } catch (error: any) {
    console.error('[小说配图] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
