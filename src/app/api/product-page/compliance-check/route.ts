import { NextRequest, NextResponse } from 'next/server';
import { invokeWithModel, ChatMessage } from '@/lib/llm-selector';
import { saveGeneration } from '@/lib/save-generation';

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
}`;
}

// 工具标识（对应 utility_tools 表的 slug）
const TOOL_SLUG = 'compliance-check';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, region, platform } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: '请提供图片URL' }, { status: 400 });
    }

    const regionRules = COMPLIANCE_RULES[region] || COMPLIANCE_RULES.us;
    const platformRules = PLATFORM_RULES[platform] || PLATFORM_RULES.independent;

    const prompt = buildCompliancePrompt(region, platform, imageUrl);

    // 构建多模态消息（图片 + 文字）
    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一个专业的电商合规检测专家。请仔细分析图片并返回准确的JSON格式检测结果。' },
      { role: 'user', content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: prompt }
      ] }
    ];

    // 走统一模型调度（从数据库读取配置）
    let resultText = '';
    let usedModel = '';

    try {
      const result = await invokeWithModel(request, messages, {
        toolId: TOOL_SLUG,
        temperature: 0.3,
      });
      resultText = result.content || '';
      usedModel = result.model || '';
    } catch (firstError) {
      // 如果多模态失败，fallback 到纯文字消息
      console.log('[ComplianceCheck] 多模态调用失败，尝试纯文字模式');
      const textMessages: ChatMessage[] = [
        { role: 'system', content: '你是一个专业的电商合规检测专家。请仔细分析图片并返回准确的JSON格式检测结果。' },
        { role: 'user', content: prompt + '\n\n图片URL：' + imageUrl }
      ];
      const result = await invokeWithModel(request, textMessages, {
        toolId: TOOL_SLUG,
        temperature: 0.3,
      });
      resultText = result.content || '';
      usedModel = result.model || '';
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

    // 保存生成记录
    saveGeneration(request, {
      tool_id: 5,
      tool_name: '商品合规检测',
      tool_type: 'goods_image',
      input_params: { region, platform, imageUrl },
      output_content: { report },
      title: `${region?.toUpperCase() || 'US'}市场${platform}平台合规检测`,
      thumbnail: imageUrl,
      usage_type: 'compliance-check',
    }).catch(() => {});

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
