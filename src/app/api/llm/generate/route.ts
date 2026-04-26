import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// Coze SDK 免费模型列表
const FREE_MODELS = [
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-2-0-lite-260215',
  'doubao-seed-2-0-mini-260215',
  'doubao-seed-1-6-251015',
  'doubao-seed-1-8-251228',
  'doubao-seed-1-6-vision-250815',
  'doubao-seed-1-6-thinking-250715',
  'doubao-pro-4k-240815',
  'doubao-pro-32k-240815',
  'doubao-lite-4k-240815',
  'doubao-lite-32k-240815',
  'glm-5.0-260211',
  'glm-4',
  'glm-4-flash',
  'glm-4-plus',
  'glm-4v',
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
  'kimi-k2-250905',
  'kimi-k2-5-260127',
  'moonshot-v1-8k',
  'moonshot-v1-32k',
  'deepseek-chat',
];

function isFreeModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return FREE_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 非流式生成接口
export async function POST(request: NextRequest) {
  try {
    const { prompt, system, model, temperature, max_tokens } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '缺少prompt参数' }, { status: 400 });
    }

    const messages = [
      { role: 'system', content: system || '你是一个有用的人工智能助手。' },
      { role: 'user', content: prompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';
    const useFreeModel = isFreeModel(targetModel);

    // 构建消息
    const fullContent: string[] = [];

    if (useFreeModel) {
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);
      
      const llmConfig = {
        model: targetModel,
        temperature: temperature ?? 0.7,
        streaming: true
      };

      const aiStream = client.stream(messages as any, llmConfig);
      
      for await (const chunk of aiStream) {
        if (chunk.content) {
          fullContent.push(chunk.content.toString());
        }
      }
    } else {
      return NextResponse.json({ error: '当前仅支持免费模型' }, { status: 400 });
    }

    const text = fullContent.join('');

    return NextResponse.json({ text, model: targetModel });
  } catch (error: any) {
    console.error('LLM API error:', error);
    return NextResponse.json(
      { error: error.message || '生成失败' },
      { status: 500 }
    );
  }
}
