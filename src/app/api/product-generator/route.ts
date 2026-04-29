import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// Prompt 模板
const PROMPT_TEMPLATES = {
  // 电商主图：干净背景、高级光影、商品突出
  mainImage: (productName?: string, benefits?: string) => {
    const base = 'Professional e-commerce product photography, clean white background, studio lighting, high-end commercial visual, product stands out prominently, sharp focus, 4K quality';
    const namePart = productName ? `, featuring ${productName}` : '';
    const benefitPart = benefits ? `, ${benefits}` : '';
    return `${base}${namePart}${benefitPart}`;
  },

  // 卖点图：突出优势、商业视觉
  benefitImage: (benefits?: string) => {
    const base = 'Premium product shot with benefit highlights, clean composition, commercial photography style, elegant lighting, professional e-commerce visual';
    const benefitPart = benefits ? `, showcasing: ${benefits}` : '';
    return `${base}${benefitPart}`;
  },

  // 场景图：真实使用场景、自然光、生活化
  sceneImage: (productName?: string) => {
    const base = 'Realistic lifestyle scene, natural lighting, professional photography, high-end visual, relatable daily use scenario, warm atmosphere';
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
