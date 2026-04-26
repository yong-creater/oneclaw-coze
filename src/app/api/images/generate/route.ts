import { NextRequest, NextResponse } from 'next/server';

// 图片生成接口 - 使用占位图片
export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '缺少prompt参数' }, { status: 400 });
    }

    // 尺寸映射
    const sizeMap: Record<string, string> = {
      '1024*1024': '1024x1024',
      '768*1344': '768x1344',
      '1344*768': '1344x768',
    };

    const imageSize = sizeMap[size || '1024*1024'] || '1024x1024';

    // 生成占位图片URL (后续可接入真实图片生成API)
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 50))}/${imageSize}`;

    return NextResponse.json({
      image_url: imageUrl,
      prompt: prompt,
      model: 'placeholder',
      success: true
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || '图片生成失败' },
      { status: 500 }
    );
  }
}
