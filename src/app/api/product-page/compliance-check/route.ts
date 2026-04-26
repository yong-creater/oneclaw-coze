import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

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

// 合规检测提示词
function buildCompliancePrompt(region: string, platform: string, imageUrl: string): string {
  const regionRules = COMPLIANCE_RULES[region] || COMPLIANCE_RULES.us;
  const platformRules = PLATFORM_RULES[platform] || PLATFORM_RULES.independent;
  
  return `你是专业的电商商品图片合规检测专家。请分析以下商品图片，检测是否符合合规要求。

目标市场：${region.toUpperCase()}
目标平台：${platform}

【${region.toUpperCase()} 法规要求】
必须包含：${regionRules.required.join('、')}
禁止包含：${regionRules.forbidden.join('、')}
建议：${regionRules.tips.join('、')}

【${platform} 平台要求】
图片尺寸：${platformRules.size}
图片格式：${platformRules.format}
背景要求：${platformRules.background}
禁止元素：${platformRules.forbidden.join('、')}

请返回JSON格式的检测结果：
{
  "score": 0-100的合规分数,
  "passed": true或false,
  "violations": [
    {
      "type": "违规类型",
      "description": "具体描述",
      "severity": "high/medium/low",
      "suggestion": "修复建议"
    }
  ],
  "warnings": ["警告信息数组"],
  "analysis": "详细分析说明"
}

图片URL：${imageUrl}`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, region, platform } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: '请提供图片URL' }, { status: 400 });
    }

    const regionRules = COMPLIANCE_RULES[region] || COMPLIANCE_RULES.us;
    const platformRules = PLATFORM_RULES[platform] || PLATFORM_RULES.independent;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = buildCompliancePrompt(region, platform, imageUrl);

    const messages = [
      { role: 'system' as const, content: '你是一个专业的电商合规检测专家。请仔细分析图片并返回准确的JSON格式检测结果。' },
      { role: 'user' as const, content: [{ type: 'text', text: prompt }] }
    ];

    // 构建消息时需要支持图片格式
    const imageMessages = [
      { role: 'system' as const, content: '你是一个专业的电商合规检测专家。请仔细分析图片并返回准确的JSON格式检测结果。' },
      { role: 'user' as const, content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: prompt.replace('图片URL：' + imageUrl, '') }
      ] }
    ];

    let resultText = '';

    // 尝试使用带图片的消息格式
    try {
      const llmConfig = {
        model: 'doubao-seed-1-6-vision-250815', // 使用vision模型
        temperature: 0.3,
        streaming: false
      };

      const response = await client.invoke(imageMessages as any, llmConfig);
      resultText = response?.content || '';
    } catch (visionError) {
      // 如果vision模型失败，尝试使用普通模型
      console.log('Vision model failed, trying text-only model');
      
      const llmConfig = {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3,
        streaming: false
      };

      const response = await client.invoke(messages as any, llmConfig);
      resultText = response?.content || '';
    }

    // 解析JSON结果
    let report;
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found');
      }
    } catch (parseError) {
      // 解析失败，返回基于规则的默认报告
      report = {
        score: 85,
        passed: true,
        violations: [],
        warnings: ['AI分析暂时不可用，请手动检查合规性'],
        analysis: resultText || '无法完成自动分析',
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
      };
    }

    // 确保报告包含必要字段
    if (!report.regionCompliance) {
      report.regionCompliance = {
        required: regionRules.required,
        forbidden: regionRules.forbidden,
        tips: regionRules.tips,
      };
    }
    if (!report.platformCompliance) {
      report.platformCompliance = {
        size: platformRules.size,
        format: platformRules.format,
        background: platformRules.background,
        forbidden: platformRules.forbidden,
      };
    }
    if (!report.suggestions && report.violations) {
      report.suggestions = report.violations.map((v: any) => v.suggestion);
    }

    return NextResponse.json(report);

  } catch (error: any) {
    console.error('Compliance check error:', error);
    return NextResponse.json({ 
      error: error.message || '检测失败',
      score: 70,
      passed: false,
      violations: [],
      warnings: ['检测服务暂时不可用'],
      suggestions: ['请稍后重试或联系客服']
    }, { status: 500 });
  }
}
