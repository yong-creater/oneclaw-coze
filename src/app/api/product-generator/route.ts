import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, ImageGenerationResponseHelper, ImageGenerationRequest, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// ============ 商品类别识别与场景 Prompt 体系 ============

type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

// 关键词 → 品类映射
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  shoes: ['鞋', '运动鞋', '休闲鞋', '板鞋', '靴子', '高跟鞋', '拖鞋', '凉鞋', '皮鞋', '帆布鞋', '跑鞋', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'slippers'],
  clothing: ['衣', '裤', '裙', '外套', '帽子', '包', 'T恤', '衬衫', '卫衣', '夹克', '大衣', '毛衣', '牛仔裤', '短裙', '连衣裙', '背包', '手提包', '围巾', '手套', 'coat', 'jacket', 'shirt', 'dress', 'hat', 'bag', 'pants'],
  electronics: ['耳机', '手机', '键盘', '鼠标', '相机', '音箱', '充电器', '平板', '显示器', '路由器', '手表', '智能', '数码', '蓝牙', 'earphone', 'headphone', 'keyboard', 'mouse', 'camera', 'speaker', 'phone'],
  beauty: ['香水', '口红', '面霜', '护肤', '精华', '粉底', '眉笔', '眼影', '乳液', '防晒', '卸妆', '美妆', '化妆', '洁面', '唇膏', 'perfume', 'lipstick', 'cream', 'skincare', 'makeup', 'serum'],
  food: ['饮料', '零食', '咖啡', '茶', '保健', '牛奶', '果汁', '饼干', '巧克力', '啤酒', '红酒', '方便面', '坚果', '果干', 'drink', 'snack', 'coffee', 'tea', 'food', 'beverage'],
  general: [],
};

// 根据商品名称识别品类
function detectCategory(productName: string): ProductCategory {
  const name = (productName || '').toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) {
        return category as ProductCategory;
      }
    }
  }

  return 'general';
}

// 通用负面 Prompt（所有图片都用）
const COMMON_NEGATIVE = 'no text, no watermark, no logo, no blur, no distortion, no unrelated objects';

// 通用保持商品不变
const KEEP_PRODUCT_UNCHANGED = 'Keep the product exactly the same (do not change shape, color, or structure)';

// ============ 按品类生成 Prompt ============

const PROMPTS = {
  mainImage: (productName?: string, _benefits?: string, _category?: ProductCategory) => {
    const product = productName || 'product';
    return `Professional studio product photography of the same ${product}, centered composition, pure white background, soft studio lighting, realistic shadow underneath, ultra realistic, commercial e-commerce product image, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`;
  },

  benefitImage: (productName?: string, _benefits?: string, _category?: ProductCategory) => {
    const product = productName || 'product';
    return `Premium product photo of the same ${product}, light gray or beige gradient background, clean composition, soft cinematic lighting, realistic shadow, high-end commercial photography, apple style aesthetic, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`;
  },

  sceneImage: (productName?: string, _benefits?: string, category?: ProductCategory) => {
    const product = productName || 'product';
    const cat = category || 'general';

    // 根据品类选择场景
    const scenePrompts: Record<ProductCategory, string> = {
      shoes: `Lifestyle fashion photography of the same ${product} being worn on feet, casual jeans outfit, clean street or minimal indoor floor, natural lighting, realistic shadow, fashion e-commerce style, high-end commercial photography, ${KEEP_PRODUCT_UNCHANGED}, no laptop, no computer desk, no coffee cup, no unrelated objects, ${COMMON_NEGATIVE}`,

      clothing: `Lifestyle fashion photography of the same ${product} being worn by a model, clean background, fashion lookbook style, natural lighting, realistic shadow, high-end commercial fashion photography, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`,

      electronics: `Lifestyle product photography of the same ${product} on a modern clean desk setup, laptop nearby, coffee cup, soft warm lighting, clean workspace, shallow depth of field, commercial product photography, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`,

      beauty: `Luxury beauty product photography of the same ${product} on a vanity table, soft elegant lighting, clean luxury background, skincare or perfume product photography style, subtle reflections, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`,

      food: `Clean food product photography of the same ${product} on a kitchen table or breakfast scene, natural light, fresh ingredients nearby, clean food photography style, appetizing presentation, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`,

      general: `Lifestyle product photography of the same ${product} in a clean modern setting, warm natural lighting, realistic shadow, commercial advertising photography, high-end brand feeling, ${KEEP_PRODUCT_UNCHANGED}, ${COMMON_NEGATIVE}`,
    };

    return scenePrompts[cat];
  },
};

// ============ 模型配置与调度 ============

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

  const request: ImageGenerationRequest = {
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

    // 2. 识别商品品类
    const category = detectCategory(productName || '');
    console.log(`[Product Generator] 商品: ${productName}, 品类: ${category}, 模型: ${config.providerSlug} / ${config.modelName}`);

    // 3. 并行生成三张图片（带品类感知的 Prompt）
    const results: {
      mainImage?: string;
      benefitImage?: string;
      sceneImage?: string;
      errors: string[];
    } = { errors: [] };

    const [mainResult, benefitResult, sceneResult] = await Promise.allSettled([
      generateImage(PROMPTS.mainImage(productName, productBenefit, category), imageBase64, config),
      generateImage(PROMPTS.benefitImage(productName, productBenefit, category), imageBase64, config),
      generateImage(PROMPTS.sceneImage(productName, productBenefit, category), imageBase64, config),
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
      images: results,
      category, // 返回识别的品类，方便前端调试
    });

  } catch (error) {
    console.error('[Product Generator API Error]:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
