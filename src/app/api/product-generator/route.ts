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

// ============ 商品保真核心指令 ============
// 注意：model-selector 在 Coze 文生图模式下会自动注入视觉 LLM 分析的商品描述
// 这段前缀用于指导模型严格按视觉描述还原商品

const PRODUCT_FIDELITY_PREFIX = `CRITICAL PRODUCT FIDELITY: The product description above (in [PRODUCT VISUAL REFERENCE]) describes the EXACT product you must render. You MUST reproduce this product with pixel-perfect accuracy — identical shape, color, material, proportions, and all visual details. NEVER alter, deform, or reimagine the product. Only create the specified scene/background around this exact product.

ABSOLUTE RULES:
1. The product MUST look EXACTLY as described — same shape, same color, same material, same proportions.
2. NEVER deform, distort, reshape, or stylize the product.
3. ONLY create the background, lighting, scene, and environment.
4. NO text, NO watermark, NO logo, NO badges, NO graphic overlays on the image.

`;

// ---- Scene logic (used by scene & selling images) ----
const CATEGORY_SCENE: Record<ProductCategory, string> = {
  shoes: 'feet wearing the shoes on street or casual setting',
  clothing: 'model wearing the item, fashion lookbook style, natural pose',
  electronics: 'hands using the device — wearing headphones, typing keyboard, holding phone',
  beauty: 'hands applying the product, vanity table scene',
  food: 'product being served or held — steam rising, spoon scooping',
  general: 'hands naturally holding or using the product in a real environment',
};

// ---- Per-slot Prompt generators ----
export const PROMPTS: Record<ImageSlot, (productName?: string, benefits?: string, category?: ProductCategory) => string> = {

  // 1) MAIN PRODUCT SHOT — 电商主图
  main: (productName, benefits, _category) => {
    return `${PRODUCT_FIDELITY_PREFIX}Create a premium e-commerce main product photo (主图).

- Place the product against a clean, light neutral gradient background (soft warm beige or light gray, NOT pure white #FFFFFF)
- Product centered, occupying 75%+ of the frame
- Studio lighting: key light from upper-left, soft fill, subtle rim light for edge definition
- Show material texture accurately (metallic sheen, fabric weave, matte finish)
- High contrast between product and background — product must visually POP
- This must look like a top Taobao/Tmall seller's main product image${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

The goal: make users STOP scrolling and CLICK this thumbnail over 100 others.`;
  },

  // 2) USAGE SCENE — 使用场景图
  scene: (productName, benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    return `${PRODUCT_FIDELITY_PREFIX}Create a lifestyle usage scene photo (场景图).

- Show ${sceneDesc}
- Product must be the LARGEST element, occupying 60%+ of the frame
- NATURAL environment: real desk, kitchen, outdoor setting — NOT a studio backdrop
- Warm NATURAL lighting: window light, morning sunlight, or golden hour
- Shallow depth of field: product razor-sharp, background softly blurred
- Context objects must be LOGICALLY related (coffee near thermos, books near desk lamp)
- Must look like a CANDID LIFESTYLE PHOTO from Xiaohongshu — real, not staged${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- Selling points: ${benefits}` : ''}

The goal: users must be able to IMAGINE THEMSELVES using this product RIGHT NOW.`;
  },

  // 3) SELLING POINT — 卖点强化图
  selling: (productName, benefits, category) => {
    const cat = category || 'general';
    const sceneDesc = CATEGORY_SCENE[cat];
    const topBenefit = benefits ? benefits.split(/[,，、;；\n]/)[0].trim() : '';
    return `${PRODUCT_FIDELITY_PREFIX}Create an atmospheric selling point photo (卖点图).

- Product in an ENVIRONMENT with atmospheric lighting — NOT pure white background
- Environment REINFORCES the selling point through visual storytelling${topBenefit ? `\n- TOP SELLING POINT to visualize: "${topBenefit}"` : ''}
  (e.g., "24h insulation" → warm steam + cozy desk; "waterproof" → rain/splash; "portable" → outdoor hand-held)
- Product occupying 65%+ of frame, positioned off-center (rule of thirds)
- ATMOSPHERIC LIGHTING matching the selling point:
  * Insulation/warmth → warm golden light, steam wisps, cozy ambiance
  * Freshness/cooling → cool blue-white light, clean feel
  * Durability/outdoor → dramatic side lighting, textured surfaces
  * Beauty/skincare → soft diffused light, clean minimal surface
- Scene context: ${sceneDesc}
- Shallow depth of field with beautiful bokeh
- Must look like a HIGH-END Tmall flagship store product ad${productName ? `\n- Product: ${productName}` : ''}${benefits ? `\n- All selling points: ${benefits}` : ''}

The goal: make users BELIEVE the selling point without reading any text.`;
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

    // 并行生成 3 张图片
    // 注意：视觉LLM分析在 model-selector 层自动完成，对同一张参考图会分析一次
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
