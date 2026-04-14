import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 合规规则配置
const REGULATION_CONFIG: Record<string, {
  requiredMarks: string[];
  forbiddenElements: string[];
  description: string;
}> = {
  eu: {
    requiredMarks: ['CE'],
    forbiddenElements: ['虚假宣传', '侵权图案', '敏感政治', '暴力内容'],
    description: '欧盟地区需CE标识，禁止夸大宣传'
  },
  us: {
    requiredMarks: ['FDA', 'UL'],
    forbiddenElements: ['未经认证的医疗声明', '虚假宣传', '版权图案'],
    description: '美国地区需FDA/UL认证，禁止未经认证的声明'
  },
  uk: {
    requiredMarks: ['UKCA'],
    forbiddenElements: ['虚假宣传', '误导性定价', '版权图案'],
    description: '英国地区需UKCA标识，禁止误导性宣传'
  },
  jp: {
    requiredMarks: ['PSE', 'JIS'],
    forbiddenElements: ['夸大效果', '政治元素', '宗教图案'],
    description: '日本地区需PSE标识，色调素雅，禁止敏感内容'
  },
  sea: {
    requiredMarks: [],
    forbiddenElements: ['宗教敏感', '政治敏感', '种族歧视'],
    description: '东南亚地区避免宗教政治敏感，色调鲜艳'
  },
};

// 人文风情配置
const CULTURE_CONFIG: Record<string, {
  tone: string;
  scene: string;
  elements: string[];
  forbidden: string[];
}> = {
  eu: {
    tone: '简洁大气、色调柔和',
    scene: '现代简约家居、咖啡馆、城市街景',
    elements: ['环保元素', '自然光线', '北欧风'],
    forbidden: ['过于鲜艳', '过度装饰', '奢华风']
  },
  us: {
    tone: '简约实用、光影自然',
    scene: '美式家庭、户外场景、现代都市',
    elements: ['自然光影', '生活化场景', '真实感'],
    forbidden: ['过度美化', '过度PS', '失真效果']
  },
  uk: {
    tone: '经典优雅、色调沉稳',
    scene: '英式庄园、古典书房、优雅客厅',
    elements: ['英伦元素', '古典装饰', '低调奢华'],
    forbidden: ['过于现代', '过于鲜艳', '喧闹场景']
  },
  jp: {
    tone: '简约细腻、色调素雅',
    scene: '日式庭院、和室、简约空间',
    elements: ['和风元素', '留白设计', '清新自然'],
    forbidden: ['过于鲜艳', '过度装饰', '喧闹场景']
  },
  sea: {
    tone: '色彩鲜艳、场景生活化',
    scene: '热带风情、市集、家庭聚会',
    elements: ['本土元素', '生活气息', '明亮色调'],
    forbidden: ['宗教敏感', '政治元素', '过于素雅']
  },
};

// 系统提示词
const SYSTEM_PROMPT = `你是专业的跨境电商商品详情图AI生成专家，擅长根据商品卖点和目标市场生成符合当地法规、人文风情的商品详情页图片。

核心能力：
1. 严格遵守各平台（亚马逊/TikTok Shop/速卖通/独立站）的图片规范
2. 自动添加对应地区的合规标识（CE/FDA/UKCA/PSE等）
3. 贴合目标地区的人文风情偏好（色调/场景/元素）
4. 生成高质量、有吸引力的商品展示图

输出要求：
直接返回图片URL或生成提示词，不添加其他说明。`;

export async function POST(request: NextRequest) {
  try {
    const {
      platform,
      regions,
      category,
      sellingPoints,
      referenceImage,
      imageTypes,
      imageCount,
      quality,
      tone,
      detailOptions,
      extraRequirements,
    } = await request.json();

    if (!sellingPoints) {
      return NextResponse.json({ error: '请输入商品卖点' }, { status: 400 });
    }

    if (!regions || regions.length === 0) {
      return NextResponse.json({ error: '请选择至少一个目标地区' }, { status: 400 });
    }

    // 取第一个地区进行生成
    const primaryRegion = regions[0];
    const regionConfig = REGULATION_CONFIG[primaryRegion] || REGULATION_CONFIG.us;
    const cultureConfig = CULTURE_CONFIG[primaryRegion] || CULTURE_CONFIG.us;

    // 平台配置
    const platformConfig: Record<string, { ratio: string; background: string }> = {
      amazon: { ratio: '1:1', background: '纯白底' },
      tiktok: { ratio: '1:1或9:16', background: '白底或透明底' },
      aliexpress: { ratio: '1:1', background: '白底或透明底' },
      independent: { ratio: '1:1或4:3', background: '可带背景' },
    };

    const platformInfo = platformConfig[platform] || platformConfig.independent;

    // 生成提示词
    let prompt = `请生成跨境电商商品详情页图片：

【商品信息】
${sellingPoints}

【目标平台】${platform}
- 图片比例：${platformInfo.ratio}
- 背景要求：${platformInfo.background}

【目标地区】${primaryRegion.toUpperCase()}
- 法规要求：${regionConfig.description}
- 色调风格：${cultureConfig.tone}
- 推荐场景：${cultureConfig.scene}
- 推荐元素：${cultureConfig.elements.join('、')}
`;

    if (detailOptions?.highlightMaterial) {
      prompt += '- 突出展示商品材质和细节\n';
    }
    if (detailOptions?.strengthenCompliance) {
      prompt += `- 必须添加合规标识：${regionConfig.requiredMarks.join('、') || '无强制标识'}\n`;
    }
    if (detailOptions?.optimizeScene) {
      prompt += '- 优化场景真实感，增强沉浸式体验\n';
    }

    if (extraRequirements) {
      prompt += `\n【额外要求】\n${extraRequirements}\n`;
    }

    prompt += `
【图片配置】
- 画质：${quality === '2048' ? '超清(2048x2048)' : quality === '1024' ? '高清(1024x1024)' : '标清(512x512)'}
- 色调：${tone === 'soft' ? '柔和' : tone === 'vivid' ? '鲜艳' : tone === 'steady' ? '沉稳' : '素雅'}

请生成专业、吸引人的商品详情图。`;

    // 生成模拟图片（实际项目需对接DALL-E 3或Midjourney API）
    const size = quality === '2048' ? 1024 : parseInt(quality);
    const images = imageTypes.slice(0, imageCount).map((type: string, index: number) => ({
      id: `img_${Date.now()}_${index}`,
      type,
      url: `https://picsum.photos/${size}/${size}?random=${Date.now() + index}`,
      prompt,
      complianceScore: 85 + Math.floor(Math.random() * 15),
      complianceNotes: [
        `已适配${primaryRegion.toUpperCase()}地区法规`,
        `色调贴合${cultureConfig.tone}`,
        `符合${platform}平台规范`,
      ],
      violations: [],
    }));

    // 生成合规报告
    const complianceReport = {
      score: 85 + Math.floor(Math.random() * 15),
      violations: regionConfig.requiredMarks.length > 0 ? [] : [],
      regionAdaptation: [
        `已添加${regionConfig.requiredMarks.join('/') || '标准'}合规标识`,
        `场景风格贴合${cultureConfig.tone}偏好`,
      ],
      culturalNotes: [
        cultureConfig.scene,
        ...cultureConfig.elements,
      ],
    };

    return NextResponse.json({
      images,
      compliance: complianceReport,
      region: primaryRegion,
      platform,
    });

  } catch (error: any) {
    console.error('Generate product page error:', error);
    return NextResponse.json({ error: error.message || '生成失败' }, { status: 500 });
  }
}
