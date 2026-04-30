import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// ============ Prompt 体系：3 张图用途明确且明显不同 ============

type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

// ---- Base quality (apply to all images) ----
const BASE_QUALITY = `ultra realistic, commercial photography, high detail, sharp focus,
soft controlled lighting, realistic shadows, natural color,
clean composition, product-centered`;

// ---- Global rules ----
const GLOBAL_RULES = `Keep the product exactly the same (no change in shape, color, structure)
No text, No watermark, No logo, No distortion, No blur, No low quality`;

// ---- Scene logic for lifestyle image ----
const CATEGORY_SCENE: Record<ProductCategory, string> = {
  shoes: 'being worn on feet, walking or sitting naturally',
  clothing: 'being worn by a model, fashion lookbook style, clean background',
  electronics: 'worn on head or being used (headphones), or on a modern clean desk',
  beauty: 'being used or placed on vanity, soft elegant lighting',
  food: 'being served or eaten, natural light, appetizing presentation',
  general: 'in a clean modern setting, warm natural lighting',
};

const PROMPTS = {
  // 1) E-commerce main image
  mainImage: (_productName?: string, _benefits?: string, _category?: ProductCategory) => {
    return `Enhance this product image into high-quality e-commerce visuals.

Base quality (apply to all images):
${BASE_QUALITY}

Rules:
${GLOBAL_RULES}

Generate 1 DISTINCT image:

1) E-commerce main image:
pure white background, centered composition,
soft shadow, minimal clean style, studio lighting

Requirements:
- Standard e-commerce main image (Taobao/JD style)
- Extremely clean
- NO environment
- NO props`;
  },

  // 2) Marketing image (strong visual / click attraction)
  benefitImage: (_productName?: string, _benefits?: string, _category?: ProductCategory) => {
    return `Enhance this product image into high-quality e-commerce visuals.

Base quality (apply to all images):
${BASE_QUALITY}

Rules:
${GLOBAL_RULES}

Generate 1 DISTINCT image:

2) Marketing image (strong visual / click attraction):
close-up detail, dramatic lighting, strong contrast lighting,
dark or gradient background, spotlight effect,
premium glossy texture, high-end commercial advertising style,
floating or isolated product, subtle reflection surface

Rules:
- NOT a real-life scene
- NO table
- NO environment objects
- Focus on product + lighting + texture
- Must look like an advertisement poster`;
  },

  // 3) Lifestyle image (conversion / real usage)
  sceneImage: (_productName?: string, _benefits?: string, category?: ProductCategory) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `Enhance this product image into high-quality e-commerce visuals.

Base quality (apply to all images):
${BASE_QUALITY}

Rules:
${GLOBAL_RULES}

Generate 1 DISTINCT image:

3) Lifestyle image (conversion / real usage):
realistic lifestyle scene, product being actively used,
${sceneDesc}

Rules:
- MUST show real usage
- MUST feel natural and realistic
- NO static product display
- NO incorrect scenes
- no unrelated objects
- no messy background
- no random environment
- no incorrect usage context`;
  },
};

// ============ 品类识别 ============

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  shoes: ['鞋', '运动鞋', '休闲鞋', '板鞋', '靴子', '高跟鞋', '拖鞋', '凉鞋', '皮鞋', '帆布鞋', '跑鞋', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'slippers'],
  clothing: ['衣', '裤', '裙', '外套', '帽子', '包', 'T恤', '衬衫', '卫衣', '夹克', '大衣', '毛衣', '牛仔裤', '短裙', '连衣裙', '背包', '手提包', '围巾', '手套', 'coat', 'jacket', 'shirt', 'dress', 'hat', 'bag', 'pants'],
  electronics: ['耳机', '手机', '键盘', '鼠标', '相机', '音箱', '充电器', '平板', '显示器', '路由器', '手表', '智能', '数码', '蓝牙', 'earphone', 'headphone', 'keyboard', 'mouse', 'camera', 'speaker', 'phone'],
  beauty: ['香水', '口红', '面霜', '护肤', '精华', '粉底', '眉笔', '眼影', '乳液', '防晒', '卸妆', '美妆', '化妆', '洁面', '唇膏', 'perfume', 'lipstick', 'cream', 'skincare', 'makeup', 'serum'],
  food: ['饮料', '零食', '咖啡', '茶', '保健', '牛奶', '果汁', '饼干', '巧克力', '啤酒', '红酒', '方便面', '坚果', '果干', 'drink', 'snack', 'coffee', 'tea', 'food', 'beverage'],
  general: [],
};

function detectCategory(productName: string): ProductCategory {
  const name = (productName || '').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) return category as ProductCategory;
    }
  }
  return 'general';
}

// ============ 工具标识 ============

const TOOL_SLUG = 'product-generator';

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

    // 1. 识别商品品类
    const category = detectCategory(productName || '');

    // 2. 提取参考图片（用于图生图）
    const imageInput = image;

    // 3. 并行生成三张图片（带品类感知的 Prompt），走统一模型调度
    const results: {
      mainImage?: string;
      benefitImage?: string;
      sceneImage?: string;
      errors: string[];
    } = { errors: [] };

    const [mainResult, benefitResult, sceneResult] = await Promise.allSettled([
      generateWithModel(
        PROMPTS.mainImage(productName, productBenefit, category),
        undefined, // model 由数据库配置决定
        '2K',
        {}, // customHeaders
        TOOL_SLUG,
        imageInput
      ),
      generateWithModel(
        PROMPTS.benefitImage(productName, productBenefit, category),
        undefined,
        '2K',
        {},
        TOOL_SLUG,
        imageInput
      ),
      generateWithModel(
        PROMPTS.sceneImage(productName, productBenefit, category),
        undefined,
        '2K',
        {},
        TOOL_SLUG,
        imageInput
      ),
    ]);

    if (mainResult.status === 'fulfilled' && mainResult.value.success && mainResult.value.imageUrls?.[0]) {
      results.mainImage = mainResult.value.imageUrls[0];
    } else {
      const errMsg = mainResult.status === 'rejected'
        ? mainResult.reason?.message || '未知错误'
        : mainResult.value.error || '返回为空';
      results.errors.push(`主图生成失败: ${errMsg}`);
    }

    if (benefitResult.status === 'fulfilled' && benefitResult.value.success && benefitResult.value.imageUrls?.[0]) {
      results.benefitImage = benefitResult.value.imageUrls[0];
    } else {
      const errMsg = benefitResult.status === 'rejected'
        ? benefitResult.reason?.message || '未知错误'
        : benefitResult.value.error || '返回为空';
      results.errors.push(`高级感主图生成失败: ${errMsg}`);
    }

    if (sceneResult.status === 'fulfilled' && sceneResult.value.success && sceneResult.value.imageUrls?.[0]) {
      results.sceneImage = sceneResult.value.imageUrls[0];
    } else {
      const errMsg = sceneResult.status === 'rejected'
        ? sceneResult.reason?.message || '未知错误'
        : sceneResult.value.error || '返回为空';
      results.errors.push(`场景图生成失败: ${errMsg}`);
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
