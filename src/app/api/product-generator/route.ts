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

// ---- Base quality (apply to all images) ----
const BASE_QUALITY = `ultra realistic, commercial photography, high detail, sharp focus,
soft controlled lighting, realistic shadows, natural color,
clean composition, product-centered, premium quality`;

// ---- Strict product preservation ----
const PRODUCT_PRESERVATION = `CRITICAL: Preserve the exact product structure from the original image.

- Do NOT redesign, modify, or reinterpret the product
- Do NOT change shape, size, proportions, or components
- All parts (e.g. plug, cap, body, details) must remain exactly the same
- The product must look identical to the original input image

For functional products:
- Maintain correct real-world usage structure
- Do NOT generate incorrect connections (e.g. wrong plug/socket alignment)
- Do NOT invent new parts or change product design`;

// ---- Scene logic ----
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

  // 1) 主图（吸引点击）—— 最强视觉冲击
  cover: (productName, benefits, _category) => {
    return `Create a stunning e-commerce main image that drives clicks and conversions.

Base quality (apply to all images):
${BASE_QUALITY}

STRICT product preservation (CRITICAL):
${PRODUCT_PRESERVATION}

${benefs(benefits)}

Generate 1 DISTINCT image:

MAIN IMAGE (click-driving, attention-grabbing):
- Dramatic studio lighting with rim light accent
- Pure white or subtle gradient background
- Product centered, slightly larger than life
- Soft shadow anchoring the product
- Premium, aspirational feeling
- Make the viewer WANT to click

Style: Top-selling Taobao/Tmall main image
CRITICAL: NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;

  },

  // 2) 卖点图（核心卖点/情感冲击）
  selling: (_productName, benefits, _category) => {
    return `Create a premium selling-point image with strong emotional impact.

Base quality:
${BASE_QUALITY}

STRICT product preservation:
${PRODUCT_PRESERVATION}

${benefs(benefits)}

Generate 1 DISTINCT image:

SELLING POINT IMAGE (emotional / core benefit):
- Close-up product shot, premium advertising style
- Cinematic lighting, strong contrast but soft highlights
- Dark or gradient background for drama
- Visual selling cues: soft glow, subtle light diffusion around product
- Suggest product function visually
- Create emotional appeal: comfort, safety, premium, effectiveness
- Must look like a high-end advertisement poster
- Show product texture, material, and build quality

STRICT:
- No fake reflections, no mirror-like unrealistic surfaces
- No overexaggerated effects
- NO text, NO watermark, NO logo`;

  },

  // 3) 场景图 1（真实使用场景）
  scene1: (_productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `Create a realistic lifestyle scene image showing the product in use.

Base quality:
${BASE_QUALITY}

STRICT product preservation:
${PRODUCT_PRESERVATION}

Generate 1 DISTINCT image:

LIFESTYLE SCENE IMAGE 1 (real usage / conversion):
- Realistic real-life scene, product being used correctly
- Natural environment, believable lighting
- ${sceneDesc}
- Warm light, cozy atmosphere
- Comfort, safety, relaxation feeling
- Real-life usability

STRICT:
- Correct physical placement, no floating unless physically valid
- No incorrect usage
- No unrelated objects, no messy composition
- NO text, NO watermark, NO logo`;

  },

  // 4) 场景图 2（另一种使用场景/氛围）
  scene2: (_productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE_2[cat];
    return `Create a second lifestyle scene with a different mood and setting.

Base quality:
${BASE_QUALITY}

STRICT product preservation:
${PRODUCT_PRESERVATION}

Generate 1 DISTINCT image:

LIFESTYLE SCENE IMAGE 2 (alternative setting / mood):
- Different scene from the first lifestyle image
- ${sceneDesc}
- Different time of day or lighting mood (e.g. golden hour, evening, morning)
- Natural and believable
- Emotional context: enjoyment, satisfaction, daily routine

STRICT:
- Must be visually distinct from Scene 1
- Correct physical placement
- No incorrect usage
- NO text, NO watermark, NO logo`;

  },
};

function benefs(benefits?: string): string {
  if (!benefits) return '';
  return `Product selling points to emphasize: ${benefits}`;
}

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
