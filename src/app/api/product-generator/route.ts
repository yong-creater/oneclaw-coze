import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

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
