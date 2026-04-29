import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 电商级商品图生成 Prompt（商业摄影标准）
// 所有Prompt必须包含：ultra realistic, commercial photography, studio lighting 等关键质量词
const PROMPT_TEMPLATES = {
  // 1️⃣ 主图（白底电商）- 商业摄影棚纯白背景
  mainImage: (productName?: string, benefits?: string) => {
    const base = 'professional studio product photography of wireless headphones, centered composition, pure white background, soft diffused lighting, realistic shadow underneath, ultra realistic, commercial e-commerce style, ultra high detail, sharp focus, 8k, no text, no watermark, no logo, no blur, no distortion';
    const namePart = productName ? `, featuring ${productName}` : '';
    const benefitPart = benefits ? `, ${benefits}` : '';
    return `${base}${namePart}${benefitPart}`;
  },

  // 2️⃣ 卖点图（高级感）- 简约奢华背景，高级商业摄影
  benefitImage: (benefits?: string) => {
    const base = 'premium wireless headphones product shot, minimal luxury background, soft beige or light gray gradient background, cinematic soft lighting, subtle shadow, elegant composition, apple style aesthetic, high-end commercial photography, ultra realistic, ultra high detail, sharp focus, 8k, no text, no watermark, no logo, no blur, no distortion';
    const benefitPart = benefits ? `, showcasing: ${benefits}` : '';
    return `${base}${benefitPart}`;
  },

  // 3️⃣ 场景图（生活氛围）- 现代办公桌场景，商业广告风格
  sceneImage: (productName?: string) => {
    const base = 'wireless headphones placed on modern desk setup, warm natural lighting, laptop, coffee cup, cozy lifestyle scene, shallow depth of field, cinematic composition, soft shadows, commercial advertising photography, high-end brand feeling, ultra realistic, ultra high detail, sharp focus, 8k, no text, no watermark, no logo, no blur, no distortion';
    const namePart = productName ? `, featuring ${productName}` : '';
    return `${base}${namePart}`;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, productName, productBenefit } = body;

    if (!image) {
      return NextResponse.json(
        { error: '请上传商品图片' },
        { status: 400 }
      );
    }

    // 提取 forward headers
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化客户端
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    // 串行生成三张图片，确保每个请求独立处理
    const results: {
      mainImage?: string;
      benefitImage?: string;
      sceneImage?: string;
      errors: string[];
    } = { errors: [] };

    // 1. 生成电商主图
    try {
      const mainResponse = await client.generate({
        prompt: PROMPT_TEMPLATES.mainImage(productName, productBenefit),
        image: image,
        size: '2K',
        watermark: false
      });
      const mainHelper = client.getResponseHelper(mainResponse);
      if (mainHelper.success && mainHelper.imageUrls[0]) {
        results.mainImage = mainHelper.imageUrls[0];
      } else {
        results.errors.push(...mainHelper.errorMessages);
      }
    } catch (err) {
      results.errors.push(`主图生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }

    // 2. 生成卖点图
    try {
      const benefitResponse = await client.generate({
        prompt: PROMPT_TEMPLATES.benefitImage(productBenefit),
        image: image,
        size: '2K',
        watermark: false
      });
      const benefitHelper = client.getResponseHelper(benefitResponse);
      if (benefitHelper.success && benefitHelper.imageUrls[0]) {
        results.benefitImage = benefitHelper.imageUrls[0];
      } else {
        results.errors.push(...benefitHelper.errorMessages);
      }
    } catch (err) {
      results.errors.push(`卖点图生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }

    // 3. 生成场景图
    try {
      const sceneResponse = await client.generate({
        prompt: PROMPT_TEMPLATES.sceneImage(productName),
        image: image,
        size: '2K',
        watermark: false
      });
      const sceneHelper = client.getResponseHelper(sceneResponse);
      if (sceneHelper.success && sceneHelper.imageUrls[0]) {
        results.sceneImage = sceneHelper.imageUrls[0];
      } else {
        results.errors.push(...sceneHelper.errorMessages);
      }
    } catch (err) {
      results.errors.push(`场景图生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }

    // 检查是否至少生成了一张图片
    if (!results.mainImage && !results.benefitImage && !results.sceneImage) {
      return NextResponse.json(
        { error: '图片生成失败', details: results.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: results
    });

  } catch (error) {
    console.error('[Product Generator API Error]:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
