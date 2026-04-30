import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 三种电商图生成 Prompt
const PROMPTS = {
  // 1️⃣ 主图（白底电商）
  mainImage: (productName?: string, benefits?: string) => {
    const product = productName || 'product';
    const benefitPart = benefits ? `, highlighting: ${benefits}` : '';
    return `Enhance this ${product} image into a professional e-commerce product photo with clean white background. Requirements: Keep the product exactly the same (do not change shape, color, or structure). Improve lighting, sharpness, and texture. Make it look like high-end commercial photography. Pure white background, centered composition, soft diffused lighting, realistic shadow underneath${benefitPart}. Style: ultra realistic, commercial photography, studio lighting, soft diffused light, realistic shadow, ultra high detail, sharp focus, 8k. Avoid: text, watermark, logo, blur, distortion.`;
  },

  // 2️⃣ 高级感主图（Apple风格）
  benefitImage: (productName?: string, benefits?: string) => {
    const product = productName || 'product';
    const benefitPart = benefits ? `, showcasing: ${benefits}` : '';
    return `Enhance this ${product} image into a premium product photo with minimal luxury background. Requirements: Keep the product exactly the same (do not change shape, color, or structure). Soft beige or light gray gradient background, cinematic soft lighting, subtle shadow, elegant composition, apple style aesthetic${benefitPart}. Style: ultra realistic, commercial photography, studio lighting, soft diffused light, realistic shadow, ultra high detail, sharp focus, 8k. Avoid: text, watermark, logo, blur, distortion.`;
  },

  // 3️⃣ 场景图（生活氛围）
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

    // 查询 AI商品图生成器 的模型配置
    const { data: toolData } = await supabase
      .from('utility_tools')
      .select('id, tool_id, name, model_provider_id, model_name')
      .eq('slug', 'product-generator')
      .single();

    if (!toolData || !toolData.model_provider_id) {
      console.warn('[Product Generator] 工具未配置模型提供商');
      return null;
    }

    // 查询提供商数据
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

// Base64 转 Buffer
function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

// 通过 /images/edits 端点（multipart/form-data）图生图
async function generateWithEdits(
  prompt: string,
  imageBase64: string,
  apiUrl: string,
  apiKey: string,
  modelName: string
): Promise<string[]> {
  const imageBuffer = base64ToBuffer(imageBase64);

  const formData = new FormData();
  formData.append('model', modelName);
  formData.append('prompt', prompt);
  formData.append('n', '1');
  formData.append('size', '1024x1024');

  // 将 base64 图片作为文件上传
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
  formData.append('image', imageBlob, 'image.png');

  const response = await fetch(`${apiUrl}/images/edits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`edits 请求失败 (${response.status}): ${errorText}`);
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

// 通过 /images/generations 端点（JSON）文生图（兜底方案）
async function generateWithGenerations(
  prompt: string,
  apiUrl: string,
  apiKey: string,
  modelName: string
): Promise<string[]> {
  const response = await fetch(`${apiUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`generations 请求失败 (${response.status}): ${errorText}`);
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

// 统一生成函数：优先用 edits（图生图），失败则回退到 generations（文生图）
async function generateImage(
  prompt: string,
  imageBase64: string,
  apiUrl: string,
  apiKey: string,
  modelName: string
): Promise<string[]> {
  try {
    const result = await generateWithEdits(prompt, imageBase64, apiUrl, apiKey, modelName);
    if (result.length > 0) return result;
  } catch (err) {
    console.warn('[Product Generator] edits 端点失败，回退到 generations:', err instanceof Error ? err.message : err);
  }

  // 回退：文生图
  return generateWithGenerations(prompt, apiUrl, apiKey, modelName);
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

    // 2. 并行生成三张图片（大幅缩短等待时间）
    const results: {
      mainImage?: string;
      benefitImage?: string;
      sceneImage?: string;
      errors: string[];
    } = { errors: [] };

    const [mainResult, benefitResult, sceneResult] = await Promise.allSettled([
      generateImage(PROMPTS.mainImage(productName, productBenefit), imageBase64, config.apiUrl, config.apiKey, config.modelName),
      generateImage(PROMPTS.benefitImage(productName, productBenefit), imageBase64, config.apiUrl, config.apiKey, config.modelName),
      generateImage(PROMPTS.sceneImage(productName, productBenefit), imageBase64, config.apiUrl, config.apiKey, config.modelName),
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
