import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// ============ Prompt 体系：3 张图用途明确且明显不同 ============

// 基础质量要求（所有图片共用）
const BASE_QUALITY = [
  'ultra realistic', 'commercial photography', 'high detail', 'sharp focus',
  'soft controlled lighting', 'realistic shadows', 'natural color',
  'clean composition', 'product-centered',
].join(', ');

// 通用保持商品不变
const KEEP_PRODUCT = 'Keep the product exactly the same (no change in shape, color, structure)';

// 通用禁止项
const FORBIDDEN = 'No text, No watermark, No logo, No distortion';

// 按品类选择场景描述（仅场景图使用）
type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

const CATEGORY_SCENE: Record<ProductCategory, string> = {
  shoes: 'the same product being worn on feet with casual outfit, clean street or minimal indoor floor, no laptop, no computer desk, no coffee cup',
  clothing: 'the same product being worn by a model, fashion lookbook style, clean background',
  electronics: 'the same product on a modern clean desk, soft warm lighting, shallow depth of field',
  beauty: 'the same product on a vanity table, soft elegant lighting, clean luxury background, subtle reflections',
  food: 'the same product on a kitchen table, natural light, fresh ingredients nearby, appetizing presentation',
  general: 'the same product in a clean modern setting, warm natural lighting, commercial advertising photography',
};

const PROMPTS = {
  // 1) 主图：纯白底 + 居中 + 工作室打光
  mainImage: (_productName?: string, _benefits?: string, _category?: ProductCategory) => {
    return [
      'Enhance this product image into high-quality e-commerce visual.',
      '',
      `Base quality: ${BASE_QUALITY}`,
      '',
      `Rules: ${KEEP_PRODUCT}, ${FORBIDDEN}`,
      '',
      'Image type: E-commerce main image',
      'pure white background, centered composition,',
      'soft shadow, minimal clean style, studio lighting',
    ].join('\n');
  },

  // 2) 卖点图：近景特写 + 戏剧光效 + 非白底
  benefitImage: (_productName?: string, _benefits?: string, _category?: ProductCategory) => {
    return [
      'Enhance this product image into high-quality e-commerce visual.',
      '',
      `Base quality: ${BASE_QUALITY}`,
      '',
      `Rules: ${KEEP_PRODUCT}, ${FORBIDDEN}`,
      '',
      'Image type: Marketing image',
      'close-up detail, dramatic lighting, contrast lighting,',
      'premium look, high-end advertising style,',
      'NOT white background',
    ].join('\n');
  },

  // 3) 场景图：真实使用场景 + 品类感知
  sceneImage: (_productName?: string, _benefits?: string, category?: ProductCategory) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return [
      'Enhance this product image into high-quality e-commerce visual.',
      '',
      `Base quality: ${BASE_QUALITY}`,
      '',
      `Rules: ${KEEP_PRODUCT}, ${FORBIDDEN}, no unrelated objects, no messy background`,
      '',
      'Image type: Lifestyle image',
      'realistic usage scene, product being used naturally,',
      `scene must match product type: ${sceneDesc}`,
    ].join('\n');
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
