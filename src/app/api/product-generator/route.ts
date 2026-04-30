import { NextRequest, NextResponse } from 'next/server';

// 4sapi GPT Image 配置
const API4S_KEY = process.env.API4S_KEY || '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com/v1';

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

// Base64 转 Buffer
function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

// 通过 /images/edits 端点（multipart/form-data）调用 4sapi 图生图
async function generateWith4sApiEdit(prompt: string, imageBase64: string): Promise<string[]> {
  const imageBuffer = base64ToBuffer(imageBase64);

  const formData = new FormData();
  formData.append('model', 'gpt-image-2');
  formData.append('prompt', prompt);
  formData.append('n', '1');
  formData.append('size', '1024x1024');

  // 将 base64 图片作为文件上传
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
  formData.append('image', imageBlob, 'image.png');

  const response = await fetch(`${API4S_URL}/images/edits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API4S_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`4sapi edits 请求失败 (${response.status}): ${errorText}`);
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

// 通过 /images/generations 端点（JSON）调用 4sapi 文生图（兜底方案）
async function generateWith4sApiGen(prompt: string): Promise<string[]> {
  const response = await fetch(`${API4S_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API4S_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`4sapi generations 请求失败 (${response.status}): ${errorText}`);
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
async function generateImage(prompt: string, imageBase64: string): Promise<string[]> {
  try {
    const result = await generateWith4sApiEdit(prompt, imageBase64);
    if (result.length > 0) return result;
  } catch (err) {
    console.warn('[Product Generator] edits 端点失败，回退到 generations:', err instanceof Error ? err.message : err);
  }

  // 回退：文生图
  return generateWith4sApiGen(prompt);
}

export async function POST(request: NextRequest) {
  try {
    // 检查 API Key
    if (!API4S_KEY) {
      return NextResponse.json(
        { error: 'API Key 未配置，请联系管理员' },
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

    // 串行生成三张图片
    const results: {
      mainImage?: string;
      benefitImage?: string;
      sceneImage?: string;
      errors: string[];
    } = { errors: [] };

    // 1. 生成白底主图
    try {
      const mainUrls = await generateImage(
        PROMPTS.mainImage(productName, productBenefit),
        imageBase64
      );
      if (mainUrls[0]) {
        results.mainImage = mainUrls[0];
      } else {
        results.errors.push('主图生成返回为空');
      }
    } catch (err) {
      results.errors.push(`主图生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }

    // 2. 生成高级感主图
    try {
      const benefitUrls = await generateImage(
        PROMPTS.benefitImage(productName, productBenefit),
        imageBase64
      );
      if (benefitUrls[0]) {
        results.benefitImage = benefitUrls[0];
      } else {
        results.errors.push('高级感主图生成返回为空');
      }
    } catch (err) {
      results.errors.push(`高级感主图生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }

    // 3. 生成场景图
    try {
      const sceneUrls = await generateImage(
        PROMPTS.sceneImage(productName, productBenefit),
        imageBase64
      );
      if (sceneUrls[0]) {
        results.sceneImage = sceneUrls[0];
      } else {
        results.errors.push('场景图生成返回为空');
      }
    } catch (err) {
      results.errors.push(`场景图生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
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
