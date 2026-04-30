import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';

// ============ Prompt 体系：3 张电商商品图 ============

type ProductCategory = 'shoes' | 'clothing' | 'electronics' | 'beauty' | 'food' | 'general';

// 图片类型定义（顺序即展示顺序）
export type ImageSlot = 'main' | 'scene' | 'lifestyle';

export const IMAGE_SLOTS: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'main', label: '主图', order: 1 },
  { slot: 'scene', label: '使用场景图', order: 2 },
  { slot: 'lifestyle', label: '生活场景图', order: 3 },
];

// ============ 统一系统 Prompt ============

const SYSTEM_PROMPT = `You are generating high-quality e-commerce product images.

INPUT:
- Product image provided by user
- Product selling points

GOAL:
Generate realistic, commercially usable product images.

========================
【CORE RULES】
========================

1. Keep product structure 100% accurate
   - Do not change shape
   - Do not distort
   - Do not redesign

2. No unrealistic generation
   - No floating objects
   - No deformation
   - No incorrect parts

3. NO exploded view
   - Do not disassemble
   - Do not show internal structure

========================
【SCENE LOGIC】
========================

Choose the most natural real-life usage scenario:
- Household products → home environment
- Personal items → desk / daily use
- Portable items → outdoor / hand-held

Scenes must:
- Match real usage
- Look natural
- Be believable

========================
【STYLE】
========================

- Realistic photography
- Soft natural lighting
- Depth of field
- Clean composition
- Commercial photography quality

========================
【OUTPUT REQUIREMENTS】
========================

- High resolution
- Clean background
- Focus on product
- Looks like real product photography

========================
【MULTI-IMAGE REFERENCE RULES】
========================

When multiple reference images are provided:

1. THE FIRST IMAGE IS THE PRIMARY REFERENCE.
   - Use the first image as the main reference for product appearance.
   - It defines the product's EXACT appearance: shape, color, material, finish, proportions.
   - Treat the first image as the "ground truth" for what the product looks like.

2. OTHER IMAGES ARE SUPPLEMENTARY REFERENCES ONLY.
   - Use other images only for structure and detail understanding.
   - They provide INFORMATION, not appearance — do NOT mix styles or features from different images.
   - If a supplementary image contradicts the first image, ALWAYS follow the first image.

3. CONSISTENCY IS MANDATORY.
   - ALL generated images must look like the SAME product from the SAME photoshoot.
   - Same shape, same color, same material, same proportions across all 3 images.

4. FORBIDDEN:
   - Mixing visual features from different reference images
   - Style conflicts between generated images
   - Collage-style generation that combines elements from different images
   - Generating images where the product looks like a DIFFERENT product

========================
IMPORTANT
========================

NO text, NO watermark, NO logo, NO badges, NO floating text overlay

IF THE IMAGE DOES NOT LOOK LIKE A REAL PRODUCT PHOTOGRAPH, REGENERATE IT.`;

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

  // 1) MAIN PRODUCT SHOT — 干净的主图
  main: (productName, benefits, _category) => {
    return `${SYSTEM_PROMPT}

Generate Image 1 of 3: MAIN PRODUCT SHOT (clean)

This is the primary product image — the first thing customers see.

REQUIREMENTS:
- Product is the SOLE focus — centered and dominant, occupying 70%+ of the frame
- Clean background (solid white, light gradient, or soft neutral)
- Premium studio lighting with highlights on product surface
- Product must look physically perfect — no deformation, no missing parts
- Commercial photography quality — looks like a real product catalog photo${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

CRITICAL: This image must make users STOP scrolling and CLICK.
The product must look so good that users instinctively want to buy it.`;
  },

  // 2) USAGE SCENE — 真实使用场景
  scene: (productName, benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `${SYSTEM_PROMPT}

Generate Image 2 of 3: USAGE SCENE

Show the product in a REAL USAGE environment — where and how people actually use it.

REQUIREMENTS:
- Product must be the LARGEST element, occupying 60%+ of the frame
- Scene must match real-life usage for this product type
- Shallow depth of field: product sharp, background softly blurred
- Warm natural lighting (window light preferred)
- Must look like a REAL PHOTOGRAPH, not a studio set or AI fantasy

SCENE SELECTION:
- ${sceneDesc}
- Every object in the scene must be logically related to the product
- FORBIDDEN: random unrelated objects, floating items, impossible physics${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

CRITICAL: Users must be able to IMAGINE THEMSELVES using this product.
The scene must feel REAL, like a photo from a lifestyle blog.`;
  },

  // 3) LIFESTYLE SCENE — 生活场景
  lifestyle: (productName, benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `${SYSTEM_PROMPT}

Generate Image 3 of 3: LIFESTYLE SCENE

Show the product in an aspirational lifestyle context — how it fits into a beautiful life.

REQUIREMENTS:
- Product must be clearly visible and prominent, occupying 50%+ of the frame
- Aspirational but believable environment (modern home, stylish office, outdoor cafe, etc.)
- The scene tells a STORY about the product enhancing everyday life
- Soft, warm, inviting lighting — morning sunlight or golden hour feel
- People interacting with the product naturally (preferred but not required)
- If showing hands/body: correct anatomy, natural posture

SCENE SELECTION:
- ${sceneDesc}
- Lifestyle setting should feel aspirational yet achievable
- FORBIDDEN: overly staged or artificial-looking scenes${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

CRITICAL: This image must make users WANT this lifestyle.
It should feel like flipping through a premium magazine.`;
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
