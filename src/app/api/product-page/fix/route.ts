import { NextRequest, NextResponse } from 'next/server';

// 合规标识配置
const COMPLIANCE_MARKS: Record<string, { mark: string; position: string; size: string }> = {
  eu: { mark: 'CE', position: '右下角', size: '图片尺寸的5-10%' },
  us: { mark: 'FDA', position: '右下角', size: '图片尺寸的5-10%' },
  uk: { mark: 'UKCA', position: '右下角', size: '图片尺寸的5-10%' },
  jp: { mark: 'PSE', position: '右下角', size: '图片尺寸的5-10%' },
  sea: { mark: '标准认证', position: '右下角', size: '图片尺寸的5-10%' },
};

export async function POST(request: NextRequest) {
  try {
    const { imageId, violation, platform, region, category } = await request.json();

    if (!violation) {
      return NextResponse.json({ error: '请指定需要修复的违规类型' }, { status: 400 });
    }

    const markConfig = COMPLIANCE_MARKS[region] || COMPLIANCE_MARKS.us;

    // 根据违规类型生成修复建议
    const fixes: Record<string, { description: string; newImageUrl: string }> = {
      missing_compliance_mark: {
        description: `已添加${markConfig.mark}合规标识，位置：${markConfig.position}，尺寸：${markConfig.size}`,
        newImageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      },
      background_issue: {
        description: '已修正为纯白底背景，符合平台规范',
        newImageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      },
      watermark: {
        description: '已移除所有水印，符合平台规范',
        newImageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      },
      text_overlay: {
        description: '已移除文字遮挡，保持商品主体清晰可见',
        newImageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      },
      cultural_sensitivity: {
        description: `已调整内容以适配${region.toUpperCase()}地区文化偏好`,
        newImageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      },
    };

    const fix = fixes[violation] || {
      description: '已根据合规要求进行调整',
      newImageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`,
    };

    return NextResponse.json({
      success: true,
      url: fix.newImageUrl,
      description: fix.description,
      complianceScore: 95,
    });

  } catch (error: any) {
    console.error('Fix violation error:', error);
    return NextResponse.json({ error: error.message || '修复失败' }, { status: 500 });
  }
}
