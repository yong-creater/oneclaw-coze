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

// 支持的模型列表
const SUPPORTED_MODELS = [
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-2-0-lite-260215',
  'doubao-seed-2-0-mini-260215',
  'doubao-seed-1-8-251228',
  'deepseek-r1-250528',
  'deepseek-v3-2-251201',
  'kimi-k2-5-260127',
  'glm-5-0-260211',
  'qwen3-5-plus-260215',
];

export async function POST(request: NextRequest) {
  try {
    const { text, style, panelCount, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    // 验证模型参数
    const selectedModel = model && SUPPORTED_MODELS.includes(model) 
      ? model 
      : 'doubao-seed-1-8-251228';

    const userPrompt = `请对以下小说内容进行漫画分镜拆解：

分镜风格：${style || '写实'}
分镜数量：${panelCount || '自动判断（建议6-8个）'}
小说内容：
${text}`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const fullContent: string[] = [];

    const llmConfig = {
      model: selectedModel,
      temperature: 0.7,
      streaming: true
    };

    const aiStream = client.stream(messages as any, llmConfig);
    
    for await (const chunk of aiStream) {
      if (chunk.content) {
        fullContent.push(chunk.content.toString());
      }
    }

    const content = fullContent.join('');

    if (!content) {
      throw new Error('AI未返回有效内容');
    }

    return NextResponse.json({ content, model: selectedModel });

  } catch (error: any) {
    console.error('Split panel error:', error);
    return NextResponse.json({ error: error.message || '分镜拆解失败' }, { status: 500 });
  }
}
