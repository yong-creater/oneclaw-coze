import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 4sapi 配置（设为 false 可完全禁用付费模型）
const ENABLE_4SAPI = process.env.ENABLE_4SAPI === 'true';
const API4S_KEY = ENABLE_4SAPI ? (process.env.API4S_KEY || process.env.NEXT_PUBLIC_API2D_KEY || '') : '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com';

// 免费模型（Coze SDK）- 这些模型直接使用，不走 4sapi
const FREE_MODELS = [
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-1-6-251015', 
  'doubao-seed-2-0-thinking-251125',
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

// 检查是否为 4sapi 模型（排除免费模型）
function isApi4sModel(model: string): boolean {
  return !isFreeModel(model);
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

    // 检查是否为付费模型
    const isPaidModel = isApi4sModel(model);
    
    // 如果是付费模型但未启用4sapi，返回错误
    if (isPaidModel && (!ENABLE_4SAPI || !API4S_KEY)) {
      return NextResponse.json({ 
        error: '付费模型未启用，请选择免费模型或联系管理员配置付费API' 
      }, { status: 403 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 设置 SSE 响应头
    const encoder = new TextEncoder();
    
    // 判断使用哪个 API
    if (isApi4sModel(model) && API4S_KEY) {
      // 使用 4sapi
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await fetch(`${API4S_URL}/v1/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API4S_KEY}`
              },
              body: JSON.stringify({
                model: model,
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
                    // Ignore parse errors for partial data
                  }
                }
              }
            }
            controller.close();
          } catch (error: any) {
            console.error('4sapi stream error:', error);
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
    }

    // 使用 Coze SDK（免费模型）
    const llmConfig = {
      model: model || 'doubao-seed-1-6-251015',
      temperature: temperature ?? 0.7,
      streaming: true
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const aiStream = client.stream(messages as any, llmConfig);
          
          for await (const chunk of aiStream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(chunk.content.toString()));
            }
          }
          controller.close();
        } catch (error: any) {
          console.error('LLM stream error:', error);
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
