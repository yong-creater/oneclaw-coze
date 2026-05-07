import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';
import { IMAGE_SLOTS, PROMPTS, type ImageSlot } from '../route';

const TOOL_SLUG = 'product-generator';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  shoes: ['鞋', '运动鞋', '休闲鞋', '板鞋', '靴子', '高跟鞋', '拖鞋', '凉鞋', '皮鞋', '帆布鞋', '跑鞋', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'slippers'],
  clothing: ['衣', '裤', '裙', '外套', '帽子', '包', 'T恤', '衬衫', '卫衣', '夹克', '大衣', '毛衣', '牛仔裤', '短裙', '连衣裙', '背包', '手提包', '围巾', '手套', 'coat', 'jacket', 'shirt', 'dress', 'hat', 'bag', 'pants'],
  electronics: ['耳机', '手机', '键盘', '鼠标', '相机', '音箱', '充电器', '平板', '显示器', '路由器', '手表', '智能', '数码', '蓝牙', 'earphone', 'headphone', 'keyboard', 'mouse', 'camera', 'speaker', 'phone'],
  beauty: ['香水', '口红', '面霜', '护肤', '精华', '粉底', '眉笔', '眼影', '乳液', '防晒', '卸妆', '美妆', '化妆', '洁面', '唇膏', 'perfume', 'lipstick', 'cream', 'skincare', 'makeup', 'serum'],
  food: ['饮料', '零食', '咖啡', '茶', '保健', '牛奶', '果汁', '饼干', '巧克力', '啤酒', '红酒', '方便面', '坚果', '果干', 'drink', 'snack', 'coffee', 'tea', 'food', 'beverage'],
  general: [],
};

function detectCategory(productName: string): string {
  const name = (productName || '').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) return category;
    }
  }
  return 'general';
}

// 重新生成单张图片
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slot, images, image, productName, productBenefit } = body as {
      slot?: string;
      images?: string[];
      image?: string;
      productName?: string;
      productBenefit?: string;
    };

    if (!slot) {
      return NextResponse.json(
        { error: '缺少 slot 参数（图片类型）' },
        { status: 400 }
      );
    }

    const validSlots = IMAGE_SLOTS.map(s => s.slot);
    if (!validSlots.includes(slot as ImageSlot)) {
      return NextResponse.json(
        { error: `无效的 slot: ${slot}，可选值: ${validSlots.join(', ')}` },
        { status: 400 }
      );
    }

    // 兼容：images 数组或单张 image
    const imageList = images && images.length > 0
      ? images
      : image ? [image] : [];

    if (imageList.length === 0) {
      return NextResponse.json(
        { error: '请上传商品图片' },
        { status: 400 }
      );
    }

    const mainImage = imageList[0];

    const category = detectCategory(productName || '');
    const imageSlot = slot as ImageSlot;

    const prompt = PROMPTS[imageSlot](productName, productBenefit, category as any);
    const result = await generateWithModel(
      prompt,
      undefined,
      '2K',
      {},
      TOOL_SLUG,
      mainImage
    );

    if (result.success && result.imageUrls?.[0]) {
      return NextResponse.json({
        success: true,
        slot: imageSlot,
        url: result.imageUrls[0],
        label: IMAGE_SLOTS.find(s => s.slot === imageSlot)?.label,
      });
    }

    return NextResponse.json(
      { error: `重新生成 ${IMAGE_SLOTS.find(s => s.slot === imageSlot)?.label} 失败: ${result.error || '返回为空'}` },
      { status: 500 }
    );

  } catch (error) {
    console.error('[Product Regenerate API Error]:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
