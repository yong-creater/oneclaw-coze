import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, ImageGenerationResponseHelper, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 三种电商图生成 Prompt
const PROMPTS = {
  mainImage: (productName?: string, benefits?: string) => {
    const product = productName || 'product';
    const benefitPart = benefits ? `, highlighting: ${benefits}` : '';
    return `Enhance this ${product} image into a professional e-commerce product photo with clean white background. Requirements: Keep the product exactly the same (do not change shape, color, or structure). Improve lighting, sharpness, and texture. Make it look like high-end commercial photography. Pure white background, centered composition, soft diffused lighting, realistic shadow underneath${benefitPart}. Style: ultra realistic, commercial photography, studio lighting, soft diffused light, realistic shadow, ultra high detail, sharp focus, 8k. Avoid: text, watermark, logo, blur, distortion.`;
  },
  benefitImage: (productName?: string, benefits?: string) => {
    const product = productName || 'product';
    const benefitPart = benefits ? `, showcasing: ${benefits}` : '';
    return `Enhance this ${product} image into a premium product photo with minimal luxury background. Requirements: Keep the product exactly the same (do not change shape, color, or structure). Soft beige or light gray gradient background, cinematic soft lighting, subtle shadow, elegant composition, apple style aesthetic${benefitPart}. Style: ultra realistic, commercial photography, studio lighting, soft diffused light, realistic shadow, ultra high detail, sharp focus, 8k. Avoid: text, watermark, logo, blur, distortion.`;
  },
  sceneImage: (productName?: string, benefits?: string) => {
    const product = productName || 'product';
    return `Enhance this ${product} image by placing it in a realistic lifestyle scene. Requirements: Keep the product exactly the same (do not change shape, color, or structure). Modern desk setup, warm natural lighting, laptop nearby, coffee cup, cozy lifestyle scene, shallow depth of field, cinematic composition, soft shadows, commercial advertising photography, high-end brand feeling. Style: ultra realistic, commercial photography, studio lighting, soft diffused light, realistic shadow, ultra high detail, sharp focus, 8k. Avoid: text, watermark, logo, blur, distortion.`;
  },
};

// 获取工具的模型配置（从数据库读取）
async function getToolModelConfig(): Promise<{
  apiUrl: string;
  apiKey: string;
  modelName: string;
  providerSlug: string;
} | null> {
  try {
    const supabase = getSupabaseClient();

    const { data: toolData } = await supabase
      .from('utility_tools')
      .select('id, tool_id, name, model_provider_id, model_name')
      .eq('slug', 'product-generator')
      .single();

    if (!toolData || !toolData.model_provider_id) {
      console.warn('[Product Generator] 工具未配置模型提供商');
      return null;
    }

    const { data: providerData } = await supabase
      .from('model_providers')
      .select('id, name, slug, api_url, api_key')
      .eq('id', toolData.model_provider_id)
      .single();

    if (!providerData) {
      console.warn('[Product Generator] 未找到模型提供商');
      return null;
    }

    return {
      apiUrl: providerData.api_url,
      apiKey: providerData.api_key,
      modelName: toolData.model_name || 'gpt-image-2',
      providerSlug: providerData.slug,
    };
  } catch (err) {
    console.error('[Product Generator] 获取模型配置失败:', err);
    return null;
  }
}

// 创建扣子图片生成客户端
function createCozeClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
}

// 通过扣子API生成图片（图生图）
async function generateWithCoze(
  prompt: string,
  imageBase64: string,
  modelName?: string
): Promise<string[]> {
  const client = createCozeClient();

  const request: Record<string, any> = {
    prompt,
    size: '2K',
    image: `data:image/jpeg;base64,${imageBase64}`,
  };

  if (modelName) {
    request.model = modelName;
  }

  const result = await client.generate(request);
  const helper = new ImageGenerationResponseHelper(result);

  if (helper.success && helper.imageUrls.length > 0) {
    return helper.imageUrls;
  }

  throw new Error(helper.errorMessages[0] || '扣子图片生成失败');
}

// 通过4sapi /images/generations 端点（JSON + image字段图生图）
async function generateWith4sApi(
  prompt: string,
  imageBase64: string,
  apiUrl: string,
  apiKey: string,
  modelName: string
): Promise<string[]> {
  const requestBody: Record<string, any> = {
    model: modelName,
    prompt,
    n: 1,
    size: '1024x1024',
    image: `data:image/jpeg;base64,${imageBase64}`,
  };

  const response = await fetch(`${apiUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`4sapi请求失败 (${response.status}): ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const urls: string[] = [];
  if (data.data && Array.isArray(data.data)) {
    for (const item of data.data) {
      if (item.url) {
        urls.push(item.url);
      } else if (item.b64_json) {
        urls.push(`data:image/png;base64,${item.b64_json}`);
      }
    }
  }
  return urls;
}

// 统一生成函数：根据 providerSlug 分发到不同的生成方式
async function generateImage(
  prompt: string,
  imageBase64: string,
  config: {
    apiUrl: string;
    apiKey: string;
    modelName: string;
    providerSlug: string;
  }
): Promise<string[]> {
  const isCoze = config.providerSlug.includes('coze');

  if (isCoze) {
    return generateWithCoze(prompt, imageBase64, config.modelName);
  } else {
    return generateWith4sApi(prompt, imageBase64, config.apiUrl, config.apiKey, config.modelName);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 从数据库读取模型配置
    const config = await getToolModelConfig();

    if (!config) {
      return NextResponse.json(
        { error: '模型未配置，请在后台精选工具管理中选择模型' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, productName, productBenefit } = body;

    if (!image) {
      return NextResponse.json(
        { error: '请上传商品图片' },
        { status: 400 }
      );
    }

    // 提取 base64 数据（去掉 data:image/xxx;base64, 前缀）
    let imageBase64 = image;
    if (image.startsWith('data:')) {
      imageBase64 = image.split(',')[1] || image;
    }

    console.log(`[Product Generator] 使用模型: ${config.providerSlug} / ${config.modelName}`);

    // 2. 并行生成三张图片
    const results: {
      mainImage?: string;
      benefitImage?: string;
      sceneImage?: string;
      errors: string[];
    } = { errors: [] };

    const [mainResult, benefitResult, sceneResult] = await Promise.allSettled([
      generateImage(PROMPTS.mainImage(productName, productBenefit), imageBase64, config),
      generateImage(PROMPTS.benefitImage(productName, productBenefit), imageBase64, config),
      generateImage(PROMPTS.sceneImage(productName, productBenefit), imageBase64, config),
    ]);

    if (mainResult.status === 'fulfilled' && mainResult.value[0]) {
      results.mainImage = mainResult.value[0];
    } else {
      results.errors.push(`主图生成失败: ${mainResult.status === 'rejected' ? mainResult.reason?.message || '未知错误' : '返回为空'}`);
    }

    if (benefitResult.status === 'fulfilled' && benefitResult.value[0]) {
      results.benefitImage = benefitResult.value[0];
    } else {
      results.errors.push(`高级感主图生成失败: ${benefitResult.status === 'rejected' ? benefitResult.reason?.message || '未知错误' : '返回为空'}`);
    }

    if (sceneResult.status === 'fulfilled' && sceneResult.value[0]) {
      results.sceneImage = sceneResult.value[0];
    } else {
      results.errors.push(`场景图生成失败: ${sceneResult.status === 'rejected' ? sceneResult.reason?.message || '未知错误' : '返回为空'}`);
    }

    // 检查是否至少生成了一张图片
    if (!results.mainImage && !results.benefitImage && !results.sceneImage) {
      return NextResponse.json(
        { error: '图片生成失败，请重新尝试', details: results.errors },
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
