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
PRODUCT DOMINANCE (MANDATORY)
==============================

THE PRODUCT MUST BE THE UNDISPUTED VISUAL CENTER OF EVERY IMAGE.

* Product must occupy AT LEAST 60% of the frame
* Product must be the LARGEST and most prominent element
* Product must be in sharp focus — background can be soft but product is always crystal clear
* All other elements exist ONLY to support the product — NEVER compete with it
* If in doubt, make the product BIGGER

========================
SCENE RATIONALITY (MANDATORY)
==============================

EVERY ELEMENT IN THE SCENE MUST BE LOGICALLY RELATED TO THE PRODUCT.

* The product must be used/displayed in a context that makes REAL-WORLD SENSE
* Props and surroundings must be items that ACTUALLY appear with this product in real life
* FORBIDDEN: placing the product with unrelated objects just to fill space
* FORBIDDEN: surreal or dreamlike juxtapositions
* FORBIDDEN: mixing product categories (e.g. water bottle next to laptop, shoes on a dining table, food next to electronics)
* FORBIDDEN: random floating objects, levitating items, or gravity-defying arrangements
* Every object in the frame must have a REASON to be there

CATEGORY-SPECIFIC SCENE RULES:
* Kitchen items → ONLY kitchen counter, cooking scene, dining table with food
* Electronics → ONLY desk, shelf, hands using device, charging station
* Shoes → ONLY feet, floor, sidewalk, gym floor, shoe rack
* Clothing → ONLY model wearing it, wardrobe, hanger, folding surface
* Beauty → ONLY vanity, bathroom, makeup application, skin close-up
* Food/Drink → ONLY table, kitchen, café, picnic setting

========================
ANTI-DEFORMATION (MANDATORY)
==============================

THE PRODUCT MUST LOOK PHYSICALLY CORRECT AND NATURAL.

* Correct proportions — no stretching, squishing, or warping
* Symmetrical parts must be symmetrical (handles, buttons, openings)
* Product shape must be consistent with real-world geometry
* No extra or missing parts (no 6 fingers, no 3 wheels on a 4-wheel cart)
* Text/labels on product must follow product surface curvature naturally
* Reflections and shadows must be physically plausible
* No duplicated or ghosted elements
* No melting, blending, or merging of distinct objects

========================
ANTI-CLUTTER (MANDATORY)
==============================

KEEP THE FRAME CLEAN AND FOCUSED.

* Maximum 3-5 supporting elements besides the product
* Background must be simple — solid color, gradient, or soft bokeh
* No busy patterns competing with the product
* No unnecessary decorative elements (confetti, sparkles, random shapes)
* Negative space is GOOD — let the product breathe

========================
IMPORTANT
=========

Each image must answer:

👉 Why should the user buy this product?

NO text, NO watermark, NO logo, NO badges, NO floating text overlay

IF THE IMAGE DOES NOT LOOK LIKE A REAL PRODUCT PHOTOGRAPH, REGENERATE IT.`;

// ---- Per-slot Prompt generators (system prompt prepended automatically) ----
export const PROMPTS: Record<ImageSlot, (productName?: string, benefits?: string, category?: ProductCategory) => string> = {

  // 1) COVER IMAGE — 吸引点击的高品质主图
  cover: (productName, _benefits, _category) => {
    return `${SYSTEM_PROMPT}

IMAGE TYPE: COVER IMAGE (for attracting clicks)
- strong visual impact — the first thing users see
- PRODUCT occupies 70%+ of the frame, centered and dominant
- background clean but stylish (gradient, soft texture, or subtle geometric) — NEVER competing with product
- premium studio lighting with highlights on product surface
- looks like Taobao high-end main image
- must make users want to click and learn more${productName ? `\n- Product: ${productName}` : ''}

COMPOSITION RULES:
- Product is the SOLE hero — nothing else draws attention
- If using props, they must be tiny and related (e.g. water droplets for a bottle, cushion for shoes)
- Clean gradient or solid background preferred — no busy scenes
- Product must look physically perfect — no deformation, no missing parts, no extra elements

CRITICAL: This image must make users STOP scrolling and CLICK.
The product must look so good that users instinctively want to buy it.`;
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
- PRODUCT MUST occupy 60%+ of the frame even in close-up shots

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

SCENE RATIONALITY:
- The action shown must be REALISTIC and physically possible
- Any props used must be logically related to the feature (e.g. water for waterproof, steam for insulated)
- NO random decorative elements that don't support the selling point
- Product must not appear deformed or distorted during action

CRITICAL: This image must VISUALLY PROVE why the product is worth buying.
Do NOT just show the product sitting there — SHOW IT IN ACTION.
But the action MUST look like a real photograph, not AI fantasy.`;
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
- PRODUCT and its parts must occupy 70%+ of the frame

APPROACHES (pick the best for this product):
- Exploded view: parts floating apart with gaps — but MUST maintain correct spatial relationship
- Transparent/cutaway: see through outer shell to inner parts
- Layer peel: showing layers from outside to inside
- Disassembly: product opened up revealing internals${productName ? `\n- Product: ${productName}` : ''}

ANTI-DEFORMATION RULES:
- Each part must have correct proportions relative to each other
- No duplicate or ghosted parts
- Exploded parts must align logically — they must fit back together in reality
- No extra parts that don't exist in the real product
- No melting or blending between separate components

SCENE RATIONALITY:
- Background must be clean (solid or gradient) — no environment clutter
- Only the product and its components are in frame
- No unrelated objects, no decorative elements

CRITICAL: Users must SEE the quality inside, not just the outside.
Every part must look like it belongs to THIS product specifically.`;
  },

  // 4) USAGE SCENE IMAGE — 真实使用环境，禁止不合理搭配
  scene: (productName, _benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `${SYSTEM_PROMPT}

IMAGE TYPE: USAGE SCENE IMAGE
Show the product in REAL LIFE — where and how people actually use it.

THIS IS THE MOST DEMANDING IMAGE FOR REALISM.
It must look like a REAL PHOTOGRAPH taken in someone's actual home/office/outdoor setting.

========================
PRODUCT DOMINANCE RULES (CRITICAL)
========================

- Product MUST be the largest element in the scene, occupying 60%+ of the frame
- Product must be in sharp focus — the eye is drawn to it FIRST
- Background and environment provide CONTEXT but do NOT compete for attention
- Use shallow depth of field: product sharp, background softly blurred
- If a person is in the scene, the product must be AT LEAST as prominent as the person

========================
SCENE RATIONALITY RULES (CRITICAL)
========================

- Must show REAL usage environment — not a studio set, not a fantasy scene
- Must be BELIEVABLE — product must belong in this scene naturally
- EVERY object in the scene must be logically related to the product
- FORBIDDEN: random object placement (e.g. water bottle next to laptop, shoes on a dining table, food next to electronics)
- FORBIDDEN: mixing incompatible categories in one scene
- FORBIDDEN: surreal juxtapositions, dreamlike settings, impossible physics
- FORBIDDEN: overly decorated or styled scenes that look artificial
- ${sceneDesc}

STRICT SCENE RULES BY PRODUCT TYPE:
- Kitchen items → ONLY kitchen counter, stove, dining table with relevant food
- Office/electronics → ONLY organized desk, hands using device, charging area
- Shoes → ONLY feet on floor/sidewalk/gym, shoe rack, entryway
- Clothing → ONLY model wearing it, fitting room, wardrobe, clothesline
- Beauty → ONLY vanity table, bathroom mirror, makeup application
- Food/drinks → ONLY table setting, kitchen, café, picnic

ENVIRONMENT RULES:
- Warm natural lighting (window light preferred, not studio flash)
- Real-life setting (lived-in but tidy, not a showroom)
- People interacting with product is preferred but NOT required
- If showing hands/body: correct anatomy, no extra fingers, natural posture
- No impossible arrangements (e.g. product floating, defying gravity)${productName ? `\n- Product: ${productName}` : ''}

CRITICAL: Users must be able to IMAGINE THEMSELVES using this product.
The scene must feel REAL, not staged. Like a photo from a lifestyle blog, not a commercial set.`;
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
- Both products must look PHYSICALLY CORRECT — no deformation on either side

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

SCENE RATIONALITY:
- The comparison must be FAIR and REALISTIC — both products shown in the same context
- The "inferior" product must still look like a real product — just worse quality
- No exaggeration that breaks physical plausibility
- Both products must have correct proportions and no deformation
- The scene setting must be the same for both sides

ANTI-DEFORMATION:
- Both products must have identical base shape (only quality/condition differs)
- No extra or missing parts on either product
- Hands/body parts if shown: correct anatomy

CRITICAL: Users must SEE the difference and think "I want THIS one."
The comparison must feel HONEST, not exaggerated to the point of being unbelievable.`;
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
- PRODUCT and its specs must occupy 70%+ of the frame

APPROACHES:
- Product with subtle dimension lines and arrows — lines must be clean and precise
- Product with visible interior showing capacity — must be physically accurate
- Material swatch or texture detail alongside product — must match the actual product material
- Multiple color variants arranged neatly — each variant must be identical except color${productName ? `\n- Product: ${productName}` : ''}

ANTI-DEFORMATION RULES:
- Product shape must be perfect — no warping even with dimension lines overlaid
- Dimension lines must follow correct geometry (horizontal for width, vertical for height)
- Color variants must have identical shape and proportions
- Capacity visualization must be physically accurate (water level at correct position)
- No duplicate or ghosted elements

SCENE RATIONALITY:
- Clean, minimal background (solid color or soft gradient)
- Only product and its specification indicators in frame
- No unrelated decorative elements
- Professional catalog/spec-sheet feel

CRITICAL: Users must feel the product is well-designed and precisely made.
This image should look like it came from a professional product catalog.`;
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
