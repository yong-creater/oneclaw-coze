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

// ============ 统一系统 Prompt ============

const SYSTEM_PROMPT = `You are generating images for an e-commerce product detail page.

This is NOT normal image generation.
This is for SELLING products.

Each image must clearly show product value and selling points.

========================
CORE RULES
==========

1. Every image has ONE clear purpose
2. Must visually express selling point
3. Must be realistic and usable for e-commerce
4. No random lifestyle images

========================
IMAGE TYPES
===========

Generate images for:

* Cover (high-end main image)
* Selling point (visual feature highlight)
* Feature breakdown (structure)
* Scene (real usage)
* Comparison (advantage)
* Specs (parameters)

========================
STYLE
=====

* Chinese e-commerce style (Taobao / Xiaohongshu)
* premium commercial photography
* clean, sharp, high contrast
* strong lighting
* product-focused

========================
REALISM
=======

* correct proportions
* no deformation
* no floating objects
* physically correct scenes

========================
IMPORTANT
=========

Each image must answer:

👉 Why should the user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay`;

// ---- Per-slot Prompt generators (system prompt prepended automatically) ----
export const PROMPTS: Record<ImageSlot, (productName?: string, benefits?: string, category?: ProductCategory) => string> = {

  // 1) COVER IMAGE — 吸引点击的高品质主图
  cover: (productName, _benefits, _category) => {
    return `${SYSTEM_PROMPT}

IMAGE TYPE: COVER IMAGE (for attracting clicks)
- strong visual impact — the first thing users see
- product centered, large and prominent
- background clean but stylish (gradient, soft texture, or subtle geometric)
- premium studio lighting with highlights on product surface
- looks like Taobao high-end main image
- must make users want to click and learn more${productName ? `\n- Product: ${productName}` : ''}

CRITICAL: This image must make users STOP scrolling and CLICK.`;
  },

  // 2) SELLING POINT IMAGE (CRITICAL) — 一张图只表达一个卖点，必须用画面表现
  selling: (productName, benefits, _category) => {
    return `${SYSTEM_PROMPT}

IMAGE TYPE: SELLING POINT IMAGE (MOST CRITICAL)
This is the single most important image for conversion.

RULES:
- ONE image = ONE selling point only
- Must SHOW the feature through ACTION, not describe it
- Use dramatic lighting to highlight the feature
- Close-up or macro angle to emphasize detail
- Must feel like a premium advertisement

HOW TO SHOW FEATURES VISUALLY:
- Leak-proof → product tilted/turned upside down, NO liquid spilling
- Pop lid → capture the moment lid opens, motion implied
- Straw → product with straw, someone actively drinking
- Insulated → steam rising but exterior cool to touch
- Foldable → product shown mid-fold or partially folded
- Waterproof → product submerged or under water flow
- Soft → hand pressing into surface showing indentation${benefits ? `\n- Key feature to highlight: ${benefits}` : ''}${productName ? `\n- Product: ${productName}` : ''}

STYLE:
- Strong lighting contrast (dramatic side light or spotlight)
- Dark or gradient background to make product pop
- Advertising poster feel — powerful and premium

CRITICAL: This image must VISUALLY PROVE why the product is worth buying.
Do NOT just show the product sitting there — SHOW IT IN ACTION.`;
  },

  // 3) FEATURE BREAKDOWN IMAGE — 展示产品结构，让用户看懂内部
  feature: (productName, _benefits, _category) => {
    return `${SYSTEM_PROMPT}

IMAGE TYPE: FEATURE BREAKDOWN IMAGE
Show users what's INSIDE and HOW IT WORKS.

RULES:
- Show product structure clearly
- Use exploded view, transparent/cutaway, or layer-by-layer breakdown
- Each component must be visible and distinguishable
- Use subtle lines or visual separation between parts
- Let users understand the internal structure and quality

APPROACHES (pick the best for this product):
- Exploded view: parts floating apart with gaps
- Transparent/cutaway: see through outer shell to inner parts
- Layer peel: showing layers from outside to inside
- Disassembly: product opened up revealing internals${productName ? `\n- Product: ${productName}` : ''}

CRITICAL: Users must SEE the quality inside, not just the outside.`;
  },

  // 4) USAGE SCENE IMAGE — 真实使用环境，禁止不合理搭配
  scene: (productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `${SYSTEM_PROMPT}

IMAGE TYPE: USAGE SCENE IMAGE
Show the product in REAL LIFE — where and how people actually use it.

RULES:
- Must show REAL usage environment — not a studio set
- Must be BELIEVABLE — product must belong in this scene naturally
- FORBIDDEN: random object placement (e.g. water bottle next to laptop, shoes on a dining table)
- Scene must match the product type logically
- ${sceneDesc}
- Warm natural lighting (not studio flash)
- People interacting with product is preferred

SCENE RULES BY CONTEXT:
- Kitchen items → clean kitchen counter, cooking scene
- Office items → organized desk, working hands
- Sports items → gym, running path, outdoor trail
- Beauty items → vanity table, bathroom, getting-ready scene
- Food/drinks → table setting, outdoor picnic, café${productName ? `\n- Product: ${productName}` : ''}

CRITICAL: Users must be able to IMAGINE THEMSELVES using this product.`;
  },

  // 5) COMPARISON IMAGE — 对比普通产品，强调优势
  comparison: (productName, benefits, _category) => {
    return `${SYSTEM_PROMPT}

IMAGE TYPE: COMPARISON IMAGE
Show why THIS product is BETTER than alternatives.

RULES:
- Split composition: THIS product on one side vs ordinary product on other side
- Clearly show the advantage through VISUAL PROOF
- The contrast must be immediately obvious at a glance

VISUAL COMPARISON EXAMPLES:
- Leak-proof: THIS product upside down (dry) vs ordinary product leaking
- Insulated: THIS product keeping drink hot vs ordinary product cold
- Durable: THIS product intact vs ordinary product dented/broken
- Soft: hand sinking into THIS product vs hand on rigid ordinary product
- Strong: THIS product holding weight vs ordinary product bending${benefits ? `\n- Advantage to highlight: ${benefits}` : ''}${productName ? `\n- Product: ${productName}` : ''}

COMPOSITION:
- Left-right or top-bottom split
- THIS product side: premium, clean, well-lit
- Other side: visibly inferior, dull lighting
- Clear visual difference — no ambiguity about which is better

CRITICAL: Users must SEE the difference and think "I want THIS one."`;
  },

  // 6) PARAMETER IMAGE — 展示容量/尺寸/材质，简洁专业
  parameter: (productName, _benefits, _category) => {
    return `${SYSTEM_PROMPT}

IMAGE TYPE: PARAMETER IMAGE
Show the SPECIFICATIONS — size, capacity, material, color options.

RULES:
- Product shown with clean dimension indicators or measurement lines
- Show capacity visually (e.g. water level inside, scale marking)
- Show material texture close-up
- Show color options if applicable
- Clean, organized layout — not cluttered

APPROACHES:
- Product with subtle dimension lines and arrows
- Product with visible interior showing capacity
- Material swatch or texture detail alongside product
- Multiple color variants arranged neatly${productName ? `\n- Product: ${productName}` : ''}

CRITICAL: Users must feel the product is well-designed and precisely made.`;
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
