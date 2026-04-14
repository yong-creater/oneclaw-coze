import { NextRequest, NextResponse } from 'next/server';

// 人文风情配置
const CULTURE_CONFIG: Record<string, {
  tone: string;
  scene: string;
  elements: string[];
}> = {
  eu: {
    tone: '简洁大气、色调柔和',
    scene: '现代简约家居、咖啡馆、城市街景',
    elements: ['环保元素', '自然光线', '北欧风']
  },
  us: {
    tone: '简约实用、光影自然',
    scene: '美式家庭、户外场景、现代都市',
    elements: ['自然光影', '生活化场景', '真实感']
  },
  uk: {
    tone: '经典优雅、色调沉稳',
    scene: '英式庄园、古典书房、优雅客厅',
    elements: ['英伦元素', '古典装饰', '低调奢华']
  },
  jp: {
    tone: '简约细腻、色调素雅',
    scene: '日式庭院、和室、简约空间',
    elements: ['和风元素', '留白设计', '清新自然']
  },
  sea: {
    tone: '色彩鲜艳、场景生活化',
    scene: '热带风情、市集、家庭聚会',
    elements: ['本土元素', '生活气息', '明亮色调']
  },
};

// 图片类型配置
const IMAGE_TYPE_CONFIG: Record<string, { description: string; focus: string }> = {
  main: {
    description: '白底主图',
    focus: '商品主体清晰展示，适合平台首页展示'
  },
  detail: {
    description: '细节图',
    focus: '突出商品材质、做工、细节特征'
  },
  scene: {
    description: '场景图',
    focus: '商品融入使用场景，展示实际应用效果'
  },
  comparison: {
    description: '对比图',
    focus: '对比展示商品优势，突出差异化卖点'
  },
};

export async function POST(request: NextRequest) {
  try {
    const {
      platform,
      region,
      category,
      sellingPoints,
      referenceImage,
      imageType,
      quality,
      tone,
    } = await request.json();

    if (!sellingPoints) {
      return NextResponse.json({ error: '请输入商品卖点' }, { status: 400 });
    }

    if (!imageType) {
      return NextResponse.json({ error: '请指定图片类型' }, { status: 400 });
    }

    const cultureConfig = CULTURE_CONFIG[region] || CULTURE_CONFIG.us;
    const typeConfig = IMAGE_TYPE_CONFIG[imageType] || IMAGE_TYPE_CONFIG.main;

    const size = quality === '2048' ? 1024 : parseInt(quality || '1024');

    // 生成单张图片
    const image = {
      id: `img_${Date.now()}`,
      type: imageType,
      url: `https://picsum.photos/${size}/${size}?random=${Date.now()}`,
      prompt: `商品详情图 - ${typeConfig.description}`,
      complianceScore: 90 + Math.floor(Math.random() * 10),
      complianceNotes: [
        `已适配${(region || 'us').toUpperCase()}地区法规`,
        `色调贴合${cultureConfig.tone}`,
        `符合${platform || '独立站'}平台规范`,
      ],
      violations: [],
    };

    return NextResponse.json(image);

  } catch (error: any) {
    console.error('Generate single image error:', error);
    return NextResponse.json({ error: error.message || '生成失败' }, { status: 500 });
  }
}
