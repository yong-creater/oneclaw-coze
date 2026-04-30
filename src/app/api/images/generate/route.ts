import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, image, size, style, model, tool_id } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: '请提供提示词' }, { status: 400 });
    }

    // 使用统一模型调度：如果传了 tool_id，从数据库读取配置
    const result = await generateWithModel(
      prompt,
      model || 'coze-image',    // fallback 模型名
      size || '2K',              // 图片尺寸
      {},                        // customHeaders
      tool_id,                   // toolId，走数据库配置
      image                      // 参考图片
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
    console.error('[图片生成] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
