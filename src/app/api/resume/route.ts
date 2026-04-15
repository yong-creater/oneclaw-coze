import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 系统提示词
const SYSTEM_PROMPT = `你是拥有10年HR经验的简历优化专家，擅长将简历按照STAR法则（场景Situation-任务Task-行动Action-结果Result）重构，并生成与目标岗位的匹配度报告。

核心要求：
1. STAR法则重构：所有工作经历和项目经历必须按「场景(S)-任务(T)-行动(A)-结果(R)」结构重写
2. 量化成果：必须包含具体数据和百分比，无数据时生成合理的量化表述
3. 关键词匹配：突出与JD匹配的核心关键词，用【】标注
4. 逻辑连贯：保持原有核心信息不改变，人设一致

输出格式要求（必须严格遵循）：
## 优化后简历
[完整的STAR法则优化版简历]

## 匹配度报告
### 匹配评分：X分
### 已匹配关键词：[关键词1] [关键词2]...
### 缺失关键词：[关键词1] [关键词2]...
### 优化建议：
1. [建议1]
2. [建议2]
3. [建议3]`;

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
