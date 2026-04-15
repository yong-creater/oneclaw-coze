import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 需求拆分系统提示词
const SYSTEM_PROMPT = `你是专业的需求分析和测试用例架构师，擅长将复杂需求拆分为独立的需求点。

请根据用户提供的需求内容，拆分为3-10个独立的需求点，每个需求点包含：
- 标题：简洁明确的功能描述
- 描述：详细的功能说明

输出格式要求：
请按以下格式输出需求点列表，每行一个需求点：
【需求点1标题】
需求点1的详细描述...

【需求点2标题】
需求点2的详细描述...

注意：
1. 每个需求点应该是独立可测试的功能模块
2. 需求点之间应该有清晰的边界
3. 按优先级排序（核心功能在前）

只输出需求点，不要输出其他内容。`;

export async function POST(request: NextRequest) {
  try {
    const { requirement, title, module } = await request.json();

    if (!requirement) {
      return NextResponse.json({ error: '请提供需求内容' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: `需求标题：${title || '未命名需求'}\n所属模块：${module || '通用'}\n\n需求内容：\n${requirement}` },
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

      return NextResponse.json({ content: response.content });
    } catch (llmError: any) {
      console.error('TestCraft analyze error:', llmError);
      throw new Error('分析服务调用失败，请重试');
    }

  } catch (error: any) {
    console.error('TestCraft analyze API error:', error);
    return NextResponse.json({ error: error.message || '分析失败' }, { status: 500 });
  }
}
