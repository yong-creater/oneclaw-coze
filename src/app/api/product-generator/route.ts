import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// ============ Prompt 体系：6 张商品详情页素材 ============

type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

// 图片类型定义（顺序即展示顺序）
export type ImageSlot = 'cover' | 'selling' | 'feature' | 'scene' | 'comparison' | 'parameter';

export const IMAGE_SLOTS: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'cover', label: '封面图', order: 1 },
  { slot: 'selling', label: '卖点图', order: 2 },
  { slot: 'feature', label: '功能拆解图', order: 3 },
  { slot: 'scene', label: '使用场景图', order: 4 },
  { slot: 'comparison', label: '对比图', order: 5 },
  { slot: 'parameter', label: '参数图', order: 6 },
];

// ---- Scene logic (used by lifestyle images) ----
const CATEGORY_SCENE: Record<ProductCategory, string> = {
  shoes: 'being worn on feet, walking or sitting naturally',
  clothing: 'being worn by a model, fashion lookbook style',
  electronics: 'correctly installed or used (e.g. headphones worn, device on desk)',
  beauty: 'being applied or used, vanity scene',
  food: 'being served or eaten',
  general: 'in a clean modern setting, naturally used',
};

// ---- Per-slot Prompt generators ----
export const PROMPTS: Record<ImageSlot, (productName?: string, benefits?: string, category?: ProductCategory) => string> = {

  // 1) COVER IMAGE
  cover: (_productName, _benefits, _category) => {
    return `You are generating images for an e-commerce product detail page.
This is NOT normal image generation. This is for SELLING products.

IMAGE TYPE: COVER IMAGE
- strong visual impact
- premium lighting
- product centered
- background clean but stylish
- looks like Taobao high-end main image

STYLE:
- Chinese e-commerce (Taobao / Xiaohongshu style)
- premium commercial photography
- strong selling intention
- not generic lifestyle photos

REALISM:
- correct proportions
- no distortion
- no floating
- physically correct usage

IMPORTANT: Do NOT generate random nice images.
This image must clearly answer: Why should user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 2) SELLING POINT IMAGE (CRITICAL)
  selling: (_productName, benefits, _category) => {
    return `You are generating images for an e-commerce product detail page.
This is NOT normal image generation. This is for SELLING products.

IMAGE TYPE: SELLING POINT IMAGE (CRITICAL)
- focus on ONE key feature
- use dramatic lighting
- close-up or macro angle
- must visually show the feature (e.g. open lid, leak-proof, straw)
- must feel like advertisement${benefits ? `\n- Key feature to highlight: ${benefits}` : ''}

STYLE:
- Chinese e-commerce (Taobao / Xiaohongshu style)
- premium commercial photography
- strong selling intention
- not generic lifestyle photos

REALISM:
- correct proportions
- no distortion
- no floating
- physically correct usage

IMPORTANT: Do NOT generate random nice images.
This image must clearly answer: Why should user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 3) FEATURE BREAKDOWN IMAGE
  feature: (_productName, _benefits, _category) => {
    return `You are generating images for an e-commerce product detail page.
This is NOT normal image generation. This is for SELLING products.

IMAGE TYPE: FEATURE BREAKDOWN IMAGE
- show product structure
- exploded view or transparent parts
- clearly show how it works
- technical illustration style
- each part visible and distinguishable

STYLE:
- Chinese e-commerce (Taobao / Xiaohongshu style)
- premium commercial photography
- strong selling intention
- not generic lifestyle photos

REALISM:
- correct proportions
- no distortion
- no floating
- physically correct usage

IMPORTANT: Do NOT generate random nice images.
This image must clearly answer: Why should user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 4) USAGE SCENE IMAGE
  scene: (_productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `You are generating images for an e-commerce product detail page.
This is NOT normal image generation. This is for SELLING products.

IMAGE TYPE: USAGE SCENE IMAGE
- real life usage
- natural context
- believable scenario (desk, gym, outdoor)
- ${sceneDesc}
- warm natural lighting

STYLE:
- Chinese e-commerce (Taobao / Xiaohongshu style)
- premium commercial photography
- strong selling intention
- not generic lifestyle photos

REALISM:
- correct proportions
- no distortion
- no floating
- physically correct usage

IMPORTANT: Do NOT generate random nice images.
This image must clearly answer: Why should user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 5) COMPARISON IMAGE
  comparison: (_productName, _benefits, _category) => {
    return `You are generating images for an e-commerce product detail page.
This is NOT normal image generation. This is for SELLING products.

IMAGE TYPE: COMPARISON IMAGE
- compare with normal product
- highlight advantage (e.g. leak-proof vs leaking, thin vs thick, before vs after)
- split composition showing the difference
- the product must appear superior and more desirable

STYLE:
- Chinese e-commerce (Taobao / Xiaohongshu style)
- premium commercial photography
- strong selling intention
- not generic lifestyle photos

REALISM:
- correct proportions
- no distortion
- no floating
- physically correct usage

IMPORTANT: Do NOT generate random nice images.
This image must clearly answer: Why should user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 6) PARAMETER IMAGE
  parameter: (_productName, _benefits, _category) => {
    return `You are generating images for an e-commerce product detail page.
This is NOT normal image generation. This is for SELLING products.

IMAGE TYPE: PARAMETER IMAGE
- clean layout
- show size, capacity, material
- minimalistic style
- product with measurement indicators or dimension lines
- professional and technical appearance

STYLE:
- Chinese e-commerce (Taobao / Xiaohongshu style)
- premium commercial photography
- strong selling intention
- not generic lifestyle photos

REALISM:
- correct proportions
- no distortion
- no floating
- physically correct usage

IMPORTANT: Do NOT generate random nice images.
This image must clearly answer: Why should user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
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

// ============ 主接口：生成整套详情图 ============

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

    const category = detectCategory(productName || '');
    const imageInput = image;

    // 并行生成 6 张图片
    const results: Partial<Record<ImageSlot, string>> = {};
    const errors: string[] = [];

    const generationTasks = IMAGE_SLOTS.map(async ({ slot }) => {
      try {
        const prompt = PROMPTS[slot](productName, productBenefit, category);
        const result = await generateWithModel(
          prompt,
          undefined, // model 由数据库配置决定
          '2K',
          {},
          TOOL_SLUG,
          imageInput
        );

        if (result.success && result.imageUrls?.[0]) {
          results[slot] = result.imageUrls[0];
        } else {
          errors.push(`${IMAGE_SLOTS.find(s => s.slot === slot)?.label || slot}生成失败: ${result.error || '返回为空'}`);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : '未知错误';
        errors.push(`${IMAGE_SLOTS.find(s => s.slot === slot)?.label || slot}生成异常: ${errMsg}`);
      }
    });

    await Promise.all(generationTasks);

    // 检查是否至少生成了一张图片
    const successCount = Object.keys(results).length;
    if (successCount === 0) {
      return NextResponse.json(
        { error: '图片生成失败，请重新尝试', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: results,
      category,
      totalGenerated: successCount,
      totalSlots: IMAGE_SLOTS.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('[Product Detail Generator API Error]:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
