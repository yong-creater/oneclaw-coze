import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 系统提示词 - 专业招聘导向简历优化
const SYSTEM_PROMPT = `你是拥有12年一线大厂+中大型企业招聘经验的资深简历优化专家，精通招聘胜任力模型、STAR法则梳理、简历关键词权重匹配，全程恪守100%内容真实性铁律。

核心执行规则

【绝对禁止】
- 虚构任何工作经历、项目成果、数据指标、技能证书、岗位职责
- 无中生有编造任何数字、效率提升值、百分比
- 夸大、篡改原始简历中的任何信息

【JD深度解析】
- 精准提取岗位JD中的核心胜任力、硬性技能、业务场景、工作权责、行业关键词
- 标记高权重匹配点，不做无意义关键词堆砌

【简历内容优化】
- 以专业动词开篇（主导、负责、推动、构建、实现等）
- 剔除口语化、冗余、情绪化表述
- 用商务职场话术重构语句
- 逻辑遵循STAR法则（情境-任务-行动-结果）

【合规合理量化】
- 无明确数据时：提炼工作覆盖范围、执行频次、协同规模、流程落地、事务量级做合规量化
- 有原始数据时：规范数据呈现形式，不篡改、不夸大
- 禁止凭空编造任何数字

【JD匹配适配】
- 将提炼的高权重关键词自然融入简历对应模块
- 提升简历与岗位的筛选匹配度
- 不生硬拼接

【结构与排版】
- 保留用户简历原有完整结构
- 统一层级格式
- 排版简洁规整、无特殊符号、无乱码
- 可直接复制投递

输出要求
直接输出优化后的完整简历，无需额外解析、无需备注、无需提问，内容专业简洁，匹配度拉满，全程保真。`;

export async function POST(request: NextRequest) {
  try {
    const { resume, jd, systemPrompt } = await request.json();

    if (!resume || !jd) {
      return NextResponse.json({ error: '请提供简历和JD内容' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: systemPrompt || SYSTEM_PROMPT },
      { role: 'user' as const, content: `请根据以下简历和JD进行优化：\n\n【简历原文】\n${resume}\n\n【目标岗位JD】\n${jd}` },
    ];

    try {
      // 使用 invoke 方法（非流式）
      const response = await client.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.7,
      });

      if (!response || !response.content) {
        throw new Error('AI未返回有效内容');
      }

      // 解析匹配分数
      let matchScore = 85;
      const scoreMatch = response.content.match(/匹配评分[：:]\s*(\d+)/);
      if (scoreMatch) {
        matchScore = parseInt(scoreMatch[1], 10);
      }

      return NextResponse.json({ 
        success: true, 
        data: response.content,
        matchScore,
      });
    } catch (llmError: any) {
      console.error('Resume optimization error:', llmError);
      throw new Error('AI服务调用失败，请重试');
    }

  } catch (error: any) {
    console.error('Resume API error:', error);
    return NextResponse.json({ error: error.message || '简历优化失败' }, { status: 500 });
  }
}
