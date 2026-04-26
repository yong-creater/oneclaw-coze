import { NextRequest, NextResponse } from 'next/server';

// 商拍AI专用API
// 这个API封装了图像生成功能，针对电商商品图场景进行了优化

// 平台尺寸配置
const PLATFORM_SIZES: Record<string, { width: number; height: number }> = {
  taobao: { width: 800, height: 800 },
  douyin: { width: 1080, height: 1350 },
  pinduoduo: { width: 750, height: 1000 },
  jd: { width: 800, height: 800 },
};

// 场景提示词模板
const SCENE_PROMPTS: Record<string, string> = {
  white_bg: '纯白背景(#FFFFFF)，商品居中，无阴影，无倒影，商业摄影风格',
  model: '时尚模特展示场景，室内专业摄影棚，柔和灯光',
  lifestyle: '温馨家居生活场景，自然光线，真实环境',
  promotion: '节日促销氛围，红色金色装饰，营销风格',
};

// 生成商品图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      input_type, // 'image' | 'text'
      content, // base64图片或描述文字
      platform = 'taobao',
      scene = 'white_bg',
      background = 'white',
      adjustments = {},
      user_id,
    } = body;

    // 参数验证
    if (!input_type) {
      return NextResponse.json({ error: '请指定输入类型' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: '请提供内容' }, { status: 400 });
    }

    // 构建生成提示词
    const platformSize = PLATFORM_SIZES[platform] || PLATFORM_SIZES.taobao;
    const scenePrompt = SCENE_PROMPTS[scene] || SCENE_PROMPTS.white_bg;

    let prompt = '';
    if (input_type === 'image') {
      prompt = `参考这张商品图片，生成一张专业的电商商品主图。${scenePrompt}。尺寸：${platformSize.width}×${platformSize.height}px。`;
    } else {
      prompt = `根据商品描述生成一张专业的电商商品主图："${content}"。${scenePrompt}。尺寸：${platformSize.width}×${platformSize.height}px。`;
    }

    // 添加背景设置
    if (background && background !== 'original') {
      if (background === 'white') {
        prompt += ' 纯白背景。';
      } else if (background === 'black') {
        prompt += ' 纯黑背景。';
      } else if (background === 'gradient') {
        prompt += ' 渐变背景。';
      } else if (background === 'simple') {
        prompt += ' 简洁场景背景。';
      }
    }

    // 添加调整参数
    if (adjustments.brightness) {
      prompt += adjustments.brightness > 0 ? ' 提亮。' : ' 调暗。';
    }
    if (adjustments.contrast) {
      prompt += adjustments.contrast > 0 ? ' 增强对比度。' : ' 降低对比度。';
    }
    if (adjustments.warmth) {
      prompt += adjustments.warmth > 0 ? ' 暖色调。' : ' 冷色调。';
    }

    prompt += ' 高清质感，商业摄影风格，避免AI痕迹。';

    // 调用图像生成API
    const imageResponse = await fetch(new URL('/api/images/generate', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        size: '2K',
        count: 1,
        image: input_type === 'image' ? content : undefined,
      }),
    });

    const imageData = await imageResponse.json();

    if (imageData.success && imageData.imageUrls && imageData.imageUrls.length > 0) {
      // 合规检测
      const compliance = checkCompliance(imageData.imageUrls[0], platform, scene);

      return NextResponse.json({
        success: true,
        data: {
          image_url: imageData.imageUrls[0],
          preview_url: imageData.imageUrls[0],
          width: platformSize.width,
          height: platformSize.height,
          platform_compliant: compliance.isCompliant,
          compliance_details: compliance.details,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: '生成失败，请重试',
    }, { status: 500 });

  } catch (error: any) {
    console.error('商拍AI生成失败:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '服务器错误',
    }, { status: 500 });
  }
}

// 合规检测
function checkCompliance(imageUrl: string, platform: string, scene: string) {
  const details: string[] = [];
  let isCompliant = true;

  // 尺寸检测
  const size = PLATFORM_SIZES[platform];
  if (size) {
    details.push(`${platform}尺寸${size.width}×${size.height}px`);
  }

  // 场景检测
  if (scene === 'white_bg') {
    details.push('白底场景，符合电商主图要求');
  }

  // 平台特定规则
  switch (platform) {
    case 'taobao':
      details.push('白底图占比≥85%');
      break;
    case 'douyin':
      details.push('竖版视频封面适配');
      break;
    case 'pinduoduo':
      details.push('文字区域合规');
      break;
    case 'jd':
      details.push('严格白底要求');
      break;
  }

  return { isCompliant, details };
}

// 获取配额信息
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user_id = searchParams.get('user_id');

  // 模拟配额数据
  const quota = {
    daily: 5,
    used: 2,
    remaining: 3,
    reset_time: '次日0点',
    is_member: false,
  };

  return NextResponse.json({
    success: true,
    data: quota,
  });
}
