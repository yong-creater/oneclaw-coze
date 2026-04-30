import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// ============ Prompt 体系：3 张电商商品图 ============

type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

// 图片类型定义（顺序即展示顺序）
export type ImageSlot = 'main' | 'scene' | 'selling';

export const IMAGE_SLOTS: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'main', label: '主图', order: 1 },
  { slot: 'scene', label: '场景图', order: 2 },
  { slot: 'selling', label: '卖点图', order: 3 },
];

// ============ 统一系统 Prompt ============

const SYSTEM_PROMPT = `You are a professional e-commerce product photographer and visual designer.
You generate HIGH-CONVERSION product images for platforms like Taobao, Tmall, Xiaohongshu (Little Red Book).

INPUT:
- Product image(s) provided by user
- Product name and selling points

GOAL:
Generate 3 images that make customers want to BUY. Every image must look like real product photography, NOT a design template.

========================
【CORE RULES — ABSOLUTE】
========================

1. PRODUCT FIDELITY: Keep product structure 100% accurate.
   - Same shape, same color, same material, same proportions as reference.
   - NEVER deform, redesign, or alter the product.

2. NO UNREALISTIC ELEMENTS:
   - No floating objects. No deformation. No impossible physics.
   - No exploded views. No disassembled parts. No internal structure.

3. NO TEMPLATE/DESIGN LAYOUT:
   - This is NOT a design task. Do NOT create layout grids, text boxes, badge overlays, or infographic-style compositions.
   - Every image must look like a REAL PHOTOGRAPH taken by a professional product photographer.
   - FORBIDDEN: pure white background with floating text, template-style arrangement, multiple text labels stacked.

========================
【STYLE: E-COMMERCE PHOTOGRAPHY】
========================

- Realistic photography — the #1 rule. If it doesn't look real, it fails.
- Soft directional lighting that reveals product texture and material quality.
- Shallow depth of field: product razor-sharp, background naturally blurred.
- High contrast between product and background — product must POP.
- Color grading: warm, inviting, premium feel. Similar to top-selling Taobao stores.

========================
【SCENE LOGIC — MUST BE REAL】
========================

Choose the most natural real-life usage scenario based on product category:
- Household products → real home environment (kitchen counter, living room shelf)
- Personal items → desk setup / daily carry / hand-held
- Portable items → outdoor / on-the-go / hand-held in natural setting

Scenes must:
- Show ACTUAL USAGE BEHAVIOR (hands touching, product being used, not just placed)
- Have natural context objects (coffee cup near a thermos, yoga mat near sportswear)
- Look like a real photo someone took in their home/office/outdoor
- NEVER look like a studio backdrop or artificial setup

========================
【MULTI-IMAGE REFERENCE RULES】
========================

When multiple reference images are provided:

1. THE FIRST IMAGE IS THE PRIMARY REFERENCE.
   - It defines the product's EXACT appearance: shape, color, material, finish, proportions.
   - Treat the first image as the "ground truth".

2. OTHER IMAGES ARE SUPPLEMENTARY ONLY.
   - Use only for structure and detail understanding.
   - If a supplementary image contradicts the first image, ALWAYS follow the first image.

3. CONSISTENCY IS MANDATORY.
   - ALL generated images must look like the SAME product from the SAME photoshoot.
   - Same shape, same color, same material, same proportions across all 3 images.

4. FORBIDDEN:
   - Mixing visual features from different reference images
   - Style conflicts between generated images
   - Collage-style generation

========================
【CRITICAL OUTPUT RULES】
========================

NO text, NO watermark, NO logo, NO badges, NO floating text overlay, NO graphic design elements.
IF THE IMAGE DOES NOT LOOK LIKE A REAL PRODUCT PHOTOGRAPH, REGENERATE IT.
IF THE IMAGE LOOKS LIKE A DESIGN TEMPLATE OR INFOGRAPHIC, REGENERATE IT.`;

// ---- Scene logic (used by scene & selling images) ----
const CATEGORY_SCENE: Record<ProductCategory, string> = {
  shoes: 'feet wearing the shoes, walking on street or sitting casually, shoes clearly visible',
  clothing: 'model wearing the item, fashion lookbook style, natural pose in real setting',
  electronics: 'device being used by hands — wearing headphones, typing on keyboard, holding phone',
  beauty: 'hands applying the product, vanity table scene, mirror reflection optional',
  food: 'product being served, poured, or consumed — steam rising, spoon scooping, hand holding',
  general: 'hands naturally holding or using the product in a real environment',
};

// ---- Per-slot Prompt generators ----
export const PROMPTS: Record<ImageSlot, (productName?: string, benefits?: string, category?: ProductCategory) => string> = {

  // 1) MAIN PRODUCT SHOT — 电商主图
  main: (productName, benefits, _category) => {
    return `${SYSTEM_PROMPT}

Generate Image 1 of 3: MAIN PRODUCT SHOT (电商主图)

This is the primary product image — the THUMBNAIL customers see first on Taobao/Tmall.

REQUIREMENTS:
- Product is the SOLE focus — centered and dominant, occupying 75%+ of the frame
- Background: CLEAN white (#FFFFFF) or very light neutral gradient
- HIGH CONTRAST between product and background — product must visually POP
- Studio lighting: key light from upper-left, soft fill light, subtle rim light for edge definition
- Product surface must show material texture (metallic sheen, fabric weave, matte finish — whatever is accurate)
- Slight reflection on surface is OK for premium feel
- Product must look physically perfect — no deformation, no missing parts
- This must look like a top Taobao seller's main image${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

CRITICAL: This image must make users STOP scrolling and CLICK.
Think: "Would I click this thumbnail over 100 others?"
The product must look so irresistible that users instinctively want to buy it.`;
  },

  // 2) USAGE SCENE — 使用场景图（必须有人/手/使用行为）
  scene: (productName, benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `${SYSTEM_PROMPT}

Generate Image 2 of 3: USAGE SCENE (使用场景图)

Show the product BEING USED in real life — with HUMAN INTERACTION.

REQUIREMENTS:
- MUST show USAGE BEHAVIOR: hand holding, person using, product in action
- Product must be the LARGEST element, occupying 60%+ of the frame
- NATURAL environment: real desk, real kitchen, real outdoor setting
- Warm NATURAL lighting: window light, morning sunlight, or golden hour
- Shallow depth of field: product razor-sharp, background softly blurred
- Context objects must be LOGICALLY related (coffee near thermos, books near desk lamp)
- Must look like a CANDID LIFESTYLE PHOTO — not a studio setup, not staged

HUMAN INTERACTION GUIDELINES:
- ${sceneDesc}
- If showing hands: natural grip, correct anatomy, relaxed posture
- If showing person: casual pose, real activity, not looking at camera
- FORBIDDEN: product just sitting on a table with no usage context${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

CRITICAL: Users must be able to IMAGINE THEMSELVES using this product RIGHT NOW.
Think: "Does this make me feel like I need this product in my life?"
The scene must feel REAL, like a photo from a Xiaohongshu post.`;
  },

  // 3) SELLING POINT — 卖点强化图（有环境+光影，非纯白）
  selling: (productName, benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    // Extract the top selling point for visual emphasis
    const topBenefit = benefits ? benefits.split(/[,，、;；\n]/)[0].trim() : '';
    return `${SYSTEM_PROMPT}

Generate Image 3 of 3: SELLING POINT IMAGE (卖点强化图)

A product image that VISUALLY DEMONSTRATES the #1 selling point through environment and atmosphere.

REQUIREMENTS:
- Product MUST be in an ENVIRONMENT — NOT a pure white/blank background
- Environment should REINFORCE the top selling point through visual storytelling
  (e.g., "24h insulation" → warm steam + cozy desk scene; "waterproof" → rain/splash scene; "portable" → outdoor hand-held scene)
- Product occupying 65%+ of the frame, positioned off-center (rule of thirds) for visual interest
- ATMOSPHERIC LIGHTING that supports the selling point:
  * Insulation/warmth → warm golden light, steam wisps, cozy ambiance
  * Freshness/cooling → cool blue-white light, ice crystals, clean feel
  * Durability/outdoor → dramatic side lighting, textured surfaces
  * Beauty/skincare → soft diffused light, clean minimal surface
- Shallow depth of field with beautiful bokeh
- Must look like a HIGH-END PRODUCT AD PHOTO — the kind you see in Tmall flagship stores${topBenefit ? `\n- PRIMARY SELLING POINT to visualize: "${topBenefit}"` : ''}${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- All selling points: ${benefits}` : ''}

CRITICAL VISUAL RULES:
❌ NO pure white/blank background — must have an environment
❌ NO text overlay, NO floating labels, NO badge, NO infographic
❌ NO multiple selling points crammed into one image
✅ ONE visual story that makes the top selling point FEEL real
✅ Environment + lighting + atmosphere = the selling point speaks for itself

Think: "Would this image make me believe the selling point without reading any text?"`;
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
    const { images, productName, productBenefit } = body as {
      images?: string[];
      image?: string; // 兼容旧的单图字段
      productName?: string;
      productBenefit?: string;
    };

    // 兼容处理：支持 images 数组或旧的 image 单图
    const imageList = images && images.length > 0
      ? images
      : (body as { image?: string }).image
        ? [(body as { image: string }).image]
        : [];

    if (imageList.length === 0) {
      return NextResponse.json(
        { error: '请上传商品图片' },
        { status: 400 }
      );
    }

    const category = detectCategory(productName || '');
    // 第一张作为主图（用于图生图参考）
    const mainImage = imageList[0];
    // 其他图作为补充参考信息
    const supplementaryCount = imageList.length - 1;
    if (supplementaryCount > 0) {
      console.log(`[ProductGenerator] 收到${imageList.length}张图片，第1张为主图，${supplementaryCount}张为补充`);
    }

    // 构建多图上下文提示（让模型理解多图关系）
    const multiImageContext = imageList.length > 1
      ? `\n\nIMPORTANT MULTI-IMAGE CONTEXT:\n- You have ${imageList.length} reference images for this product.\n- Use the first image as the main reference for product appearance.\n- Use other images only for structure and detail understanding.\n- ALL generated images MUST show the SAME product with IDENTICAL appearance across all 3 outputs.\n- Do NOT mix or merge visual features from different reference images.\n- Think of it as photographing ONE physical product — consistency is paramount.\n- If supplementary images show different details, prioritize the FIRST image for appearance.`
      : '';

    // 并行生成 3 张图片
    const results: Partial<Record<ImageSlot, string>> = {};
    const errors: string[] = [];

    const generationTasks = IMAGE_SLOTS.map(async ({ slot }) => {
      try {
        const prompt = PROMPTS[slot](productName, productBenefit, category) + multiImageContext;
        const result = await generateWithModel(
          prompt,
          undefined, // model 由数据库配置决定
          '2K',
          {},
          TOOL_SLUG,
          mainImage
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
