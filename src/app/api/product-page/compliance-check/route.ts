import { NextRequest, NextResponse } from 'next/server';

// 合规规则
const COMPLIANCE_RULES: Record<string, {
  required: string[];
  forbidden: string[];
  tips: string[];
}> = {
  eu: {
    required: ['CE标识', '合规尺寸', '多语言说明'],
    forbidden: ['夸大宣传', '未经认证的声明', '侵权图案', '虚假价格'],
    tips: ['确保CE标识清晰可见', '文字需包含欧盟官方语言', '避免使用未授权的名人形象']
  },
  us: {
    required: ['FDA/UL认证标识', '英文描述', '合规尺寸'],
    forbidden: ['未经FDA认证的健康声明', '版权图案', '虚假宣传', '误导性定价'],
    tips: ['FDA认证产品需标注认证编号', '避免使用最高级词汇（best/bestest）', '确保尺寸单位为英寸']
  },
  uk: {
    required: ['UKCA标识', '英文描述', '退货政策'],
    forbidden: ['误导性宣传', '未经授权的标志', '虚假评价'],
    tips: ['UKCA标识需清晰可见', '价格需含税', '提供清晰的联系方式']
  },
  jp: {
    required: ['PSE标识', '日文描述', '合规尺寸'],
    forbidden: ['夸大功效', '政治元素', '宗教图案', '暴力内容'],
    tips: ['日文描述需准确', '避免使用中国元素可能引起误解', '色调偏素雅为佳']
  },
  sea: {
    required: ['当地语言标注', '价格含税标识'],
    forbidden: ['宗教敏感元素', '政治敏感', '种族歧视', '色情内容'],
    tips: ['根据各国要求使用当地语言', '避免使用宗教符号', '色彩鲜艳更受欢迎']
  },
};

// 平台规则
const PLATFORM_RULES: Record<string, {
  size: string;
  format: string;
  background: string;
  forbidden: string[];
}> = {
  amazon: {
    size: '1500x1500px (最小1000x1000)',
    format: 'JPEG/PNG/TIFF',
    background: '纯白底(RGB 255,255,255)',
    forbidden: ['水印', '文字', '边框', 'logo']
  },
  tiktok: {
    size: '1:1(1080x1080)或9:16(1080x1920)',
    format: 'PNG/JPG',
    background: '白底或透明底',
    forbidden: ['水印', '过度PS']
  },
  aliexpress: {
    size: '800x800px起',
    format: 'PNG/JPG',
    background: '白底或透明底',
    forbidden: ['文字遮挡商品', '水印']
  },
  independent: {
    size: '1200x1200px起',
    format: 'PNG(推荐)',
    background: '可带背景',
    forbidden: ['水印', '模糊图片']
  },
};

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, region, platform } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: '请提供图片URL' }, { status: 400 });
    }

    const regionRules = COMPLIANCE_RULES[region] || COMPLIANCE_RULES.us;
    const platformRules = PLATFORM_RULES[platform] || PLATFORM_RULES.independent;

    // 模拟合规检测（实际项目需对接图像识别API）
    const violations: { type: string; description: string; severity: string; suggestion: string }[] = [];
    const warnings: string[] = [];

    // 随机检测（模拟）
    if (regionRules.required.length > 0 && Math.random() > 0.7) {
      violations.push({
        type: 'missing_compliance_mark',
        description: `缺少${regionRules.required[0]}`,
        severity: 'high',
        suggestion: `请在图片${Math.random() > 0.5 ? '右下角' : '左下角'}添加${regionRules.required[0]}标识`
      });
    }

    if (platformRules.background === '纯白底(RGB 255,255,255)' && Math.random() > 0.8) {
      violations.push({
        type: 'background_issue',
        description: '背景可能不是纯白底',
        severity: 'medium',
        suggestion: '请确保背景为纯白色(RGB 255,255,255)'
      });
    }

    // 计算合规分数
    let score = 100;
    violations.forEach(v => {
      if (v.severity === 'high') score -= 25;
      else if (v.severity === 'medium') score -= 10;
      else score -= 5;
    });
    score = Math.max(0, score);

    const report = {
      score,
      violations,
      warnings,
      passed: violations.length === 0,
      regionCompliance: {
        required: regionRules.required,
        forbidden: regionRules.forbidden,
        tips: regionRules.tips,
      },
      platformCompliance: {
        size: platformRules.size,
        format: platformRules.format,
        background: platformRules.background,
        forbidden: platformRules.forbidden,
      },
      suggestions: violations.map(v => v.suggestion),
    };

    return NextResponse.json(report);

  } catch (error: any) {
    console.error('Compliance check error:', error);
    return NextResponse.json({ error: error.message || '检测失败' }, { status: 500 });
  }
}
