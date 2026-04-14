import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 分镜拆解系统提示词
const SYSTEM_PROMPT = `你是专业的漫画分镜师，擅长将小说内容拆解为适合漫画表现的生动分镜脚本。

核心要求：
1. 根据小说内容拆解为多个漫画分镜（按指定数量或自动判断）
2. 每个分镜明确：场景、人物动作、对话/台词、情绪表达
3. 适配指定的分镜风格（古风/Q版/写实/赛博朋克/暗黑）
4. 分镜之间逻辑连贯，符合漫画叙事节奏
5. 每个分镜应包含足够的视觉信息便于后续生图

输出格式（严格遵循）：
分镜1：【场景描述】
人物动作：【具体动作描述】
对话：【台词内容】
情绪：【情绪表达】

分镜2：【场景描述】
...（以此类推）

请直接输出分镜内容，不要添加其他说明。`;

export async function POST(request: NextRequest) {
  try {
    const { text, count, style, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    const panelCount = count === 'auto' ? '自动判断合适数量' : `${count}个分镜`;

    const userPrompt = `请将以下小说内容拆解为漫画分镜：

分镜数量：${panelCount}
分镜风格：${style || '古风'}

小说内容：
${text}`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    // 使用Coze SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const llmConfig = {
      model: model || 'doubao-seed-1-8-251228',
      temperature: 0.7,
      streaming: false
    };

    // 非流式调用
    let content = '';
    
    try {
      const aiStream = client.stream(messages, llmConfig);
      
      for await (const chunk of aiStream) {
        if (chunk && typeof chunk === 'object' && 'content' in chunk) {
          content += (chunk as any).content || '';
        } else if (typeof chunk === 'string') {
          content += chunk;
        }
      }
    } catch (llmError) {
      console.error('LLM streaming error:', llmError);
      throw new Error('AI服务调用失败，请重试');
    }
    
    if (!content) {
      throw new Error('AI未返回有效内容');
    }
    
    return NextResponse.json({ content });

  } catch (error: any) {
    console.error('Split panel error:', error);
    return NextResponse.json({ error: error.message || '分镜拆解失败' }, { status: 500 });
  }
}
