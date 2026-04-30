import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// ============ Prompt 体系：4 张商品视觉素材 ============

type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

// 图片类型定义（顺序即展示顺序）
export type ImageSlot = 'cover' | 'selling' | 'scene1' | 'scene2';

export const IMAGE_SLOTS: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'cover', label: '主图', order: 1 },
  { slot: 'selling', label: '卖点图', order: 2 },
  { slot: 'scene1', label: '场景图 1', order: 3 },
  { slot: 'scene2', label: '场景图 2', order: 4 },
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

const CATEGORY_SCENE_2: Record<ProductCategory, string> = {
  shoes: 'running or active lifestyle, outdoor scene',
  clothing: 'casual outing, street photography style',
  electronics: 'home entertainment or work setup, cozy atmosphere',
  beauty: 'morning routine, bathroom vanity, natural light',
  food: 'shared meal, social gathering',
  general: 'lifestyle close-up, aesthetic flat lay',
};

// ---- Per-slot Prompt generators ----
export const PROMPTS: Record<ImageSlot, (productName?: string, benefits?: string, category?: ProductCategory) => string> = {

  // 1) MAIN PRODUCT IMAGE
  cover: (_productName, _benefits, _category) => {
    return `Create high-conversion e-commerce product images.

CORE GOAL: This image must be used for SELLING, not just looking good.
It must highlight a clear benefit, visually communicate value, and feel like a commercial advertisement.

IMAGE TYPE: MAIN PRODUCT IMAGE
- clean background
- centered product
- premium lighting
- sharp details

STYLE:
- Taobao premium product photography
- Chinese e-commerce advertising style
- strong studio lighting
- clean composition
- commercial quality

REALISM (IMPORTANT):
- correct proportions
- no distortion
- no floating objects
- physically realistic placement

CRITICAL RULE:
DO NOT generate generic photos.
This image must look like an advertisement and clearly show why user should buy.

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 2) SELLING POINT IMAGE (VERY IMPORTANT)
  selling: (_productName, benefits, _category) => {
    return `Create high-conversion e-commerce product images.

CORE GOAL: This image must be used for SELLING, not just looking good.
It must highlight a clear benefit, visually communicate value, and feel like a commercial advertisement.

IMAGE TYPE: SELLING POINT IMAGE (VERY IMPORTANT)
- strong lighting contrast
- close-up or dramatic angle
- highlight ONE key feature
- advertising style
- product should look powerful and premium${benefits ? `\n- Key feature to highlight: ${benefits}` : ''}

STYLE:
- Taobao premium product photography
- Chinese e-commerce advertising style
- strong lighting for selling image
- clean composition
- commercial quality

REALISM (IMPORTANT):
- correct proportions
- no distortion
- no floating objects
- physically realistic placement

CRITICAL RULE:
DO NOT generate generic photos.
This image must look like an advertisement and clearly show why user should buy.

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 3) LIFESTYLE IMAGE 1
  scene1: (_productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `Create high-conversion e-commerce product images.

CORE GOAL: This image must be used for SELLING, not just looking good.
It must highlight a clear benefit, visually communicate value, and feel like a commercial advertisement.

IMAGE TYPE: LIFESTYLE IMAGE 1
- real usage scene
- ${sceneDesc}
- natural environment
- believable context
- warm natural lighting

STYLE:
- Taobao premium product photography
- Chinese e-commerce advertising style
- warm natural lighting for lifestyle
- clean composition
- commercial quality

REALISM (IMPORTANT):
- correct proportions
- no distortion
- no floating objects
- physically realistic placement

CRITICAL RULE:
DO NOT generate generic photos.
This image must look like an advertisement and clearly show why user should buy.

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;
  },

  // 4) LIFESTYLE IMAGE 2
  scene2: (_productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE_2[cat];
    return `Create high-conversion e-commerce product images.

CORE GOAL: This image must be used for SELLING, not just looking good.
It must highlight a clear benefit, visually communicate value, and feel like a commercial advertisement.

IMAGE TYPE: LIFESTYLE IMAGE 2
- different real-life scenario from the first lifestyle image
- ${sceneDesc}
- emotional feeling
- different time of day or lighting mood

STYLE:
- Taobao premium product photography
- Chinese e-commerce advertising style
- warm natural lighting for lifestyle
- clean composition
- commercial quality

REALISM (IMPORTANT):
- correct proportions
- no distortion
- no floating objects
- physically realistic placement

CRITICAL RULE:
DO NOT generate generic photos.
This image must look like an advertisement and clearly show why user should buy.

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

    // 并行生成 4 张图片
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
