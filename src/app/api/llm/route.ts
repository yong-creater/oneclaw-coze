import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 4sapi 配置
const ENABLE_4SAPI = process.env.ENABLE_4SAPI === 'true';
const API4S_KEY = process.env.API4S_KEY || '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com';

// Coze SDK 免费模型列表（豆包系列）
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
];

// 检查是否为免费模型
function isFreeModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return FREE_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

const SYSTEM_PROMPTS: Record<string, string> = {
  polish: '你是专业小说编辑，擅长洗稿润色，保留核心剧情，优化句式表达，提升文字质感。',
  character: '你是小说人设专家，擅长打造鲜活的小说人物，生成完整的人物DNA设定卡。',
  imagePrompt: '你是AI绘画提示词工程师，生成适配Midjourney、Stable Diffusion的高质量提示词。',
  scenePrompt: '你是专业场景设计师，生成小说场景描写和配套的AI绘图提示词。'
};

export async function POST(request: NextRequest) {
  try {
    const { model, messages, feature, temperature, max_tokens } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // 如果有feature，替换system message
    if (feature && SYSTEM_PROMPTS[feature]) {
      messages[0] = { role: 'system', content: SYSTEM_PROMPTS[feature] };
    }

    const encoder = new TextEncoder();
    const targetModel = model || 'doubao-seed-1-6-251015';
    const useFreeModel = isFreeModel(targetModel);

    // 免费模型走 Coze SDK，付费模型走 4sapi
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (useFreeModel) {
            // 方案1：Coze SDK 免费模型
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
                controller.enqueue(encoder.encode(chunk.content.toString()));
              }
            }
            controller.close();
            return;
          }

          // 方案2：付费模型走 4sapi
          if (!ENABLE_4SAPI || !API4S_KEY) {
            controller.enqueue(encoder.encode(`\n\n[错误: 付费模型未启用，请选择豆包模型或联系管理员配置付费API]`));
            controller.close();
            return;
          }

          const response = await fetch(`${API4S_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API4S_KEY}`
            },
            body: JSON.stringify({
              model: targetModel,
              messages: messages,
              temperature: temperature ?? 0.7,
              max_tokens: max_tokens ?? 4000,
              stream: true
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`4sapi error: ${response.status} - ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
          controller.close();
        } catch (error: any) {
          console.error('LLM API error:', error);
          controller.enqueue(encoder.encode(`\n\n[错误: ${error.message || '生成失败'}]`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('LLM API error:', error);
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
