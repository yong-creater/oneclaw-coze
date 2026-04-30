/**
 * LLM 模型选择器 - 统一处理不同 LLM 提供商的文本生成
 * 
 * 核心原则：从数据库读取模型配置，按 providerSlug 分发到不同的调用方式
 * - providerSlug 含 "coze" → 走扣子 SDK (LLMClient)
 * - 其他 → 走 OpenAI 兼容 API（4sapi 等），api_url/api_key 从 model_providers 表读取
 * 
 * 禁止硬编码 API Key、API URL、模型名
 */

import { LLMClient, Config, HeaderUtils, Message, ContentPart } from 'coze-coding-dev-sdk';
import { NextRequest } from 'next/server';
import { getToolModelConfig, getProviderConfig, ToolModelConfig } from './model-selector';

// 统一的消息内容类型：支持纯文字和多模态（图片+文字）
export type MessageContent = string | ContentPart[];

// 统一的消息格式
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

// 创建扣子 LLM 客户端
function createCozeLLMClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new LLMClient(config, customHeaders);
}

/**
 * 通过 OpenAI 兼容 API 调用 LLM（4sapi 等，流式输出）
 * api_url 和 api_key 从数据库 model_providers 表读取
 */
async function streamWithOpenAICompatible(
  messages: ChatMessage[],
  model: string,
  apiUrl: string,
  apiKey: string,
  temperature: number = 0.7,
  customHeaders: Record<string, string> = {}
): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        if (!apiKey) {
          controller.enqueue(encoder.encode('[错误: API密钥未配置，请在后台模型提供商中配置]'));
          controller.close();
          return;
        }

        const response = await fetch(`${apiUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...customHeaders,
          },
          body: JSON.stringify({
            model,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          controller.enqueue(encoder.encode(`[错误: API返回 ${response.status}]`));
          controller.close();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode('[错误: 无法读取响应流]'));
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              // 忽略解析错误的行
            }
          }
        }

        controller.close();
      } catch (error: any) {
        controller.enqueue(encoder.encode(`[错误: ${error.message}]`));
        controller.close();
      }
    },
  });
}

/**
 * 通过 OpenAI 兼容 API 调用 LLM（4sapi 等，非流式）
 */
async function invokeWithOpenAICompatible(
  messages: ChatMessage[],
  model: string,
  apiUrl: string,
  apiKey: string,
  temperature: number = 0.7
): Promise<{ content: string; error?: string }> {
  try {
    if (!apiKey) {
      return { content: '', error: 'API密钥未配置，请在后台模型提供商中配置' };
    }

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      return { content: '', error: `API返回错误: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { content };
  } catch (error: any) {
    return { content: '', error: error.message };
  }
}

/**
 * 统一的 LLM 流式生成函数
 * 
 * 核心逻辑：如果传了 toolId，从数据库获取模型配置（providerSlug + apiUrl + apiKey），
 * 根据 providerSlug 决定走扣子 SDK 还是 OpenAI 兼容 API。
 * 
 * @param request NextRequest（用于提取转发头）
 * @param messages 对话消息
 * @param options 配置选项
 * @returns ReadableStream（流式输出）
 */
export async function streamWithModel(
  request: NextRequest,
  messages: ChatMessage[],
  options: {
    model?: string;         // fallback 模型名
    toolId?: string;        // 工具ID，走数据库配置
    providerSlug?: string;  // 直接指定提供商 slug（无需 utility_tools 记录）
    modelName?: string;     // 配合 providerSlug 使用，指定模型名
    temperature?: number;   // 温度参数
  } = {}
): Promise<ReadableStream> {
  const { model: fallbackModel = 'doubao-seed-1-8-251228', toolId, providerSlug, modelName, temperature = 0.7 } = options;
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
  const encoder = new TextEncoder();

  // 优先级：providerSlug > toolId > fallback
  if (providerSlug) {
    try {
      const config = await getProviderConfig(providerSlug);
      if (config) {
        const useModelName = modelName || fallbackModel;
        console.log(`[LLMSelector] 使用提供商: ${providerSlug} / ${useModelName}`);
        const isCoze = providerSlug.includes('coze');

        if (isCoze) {
          const client = createCozeLLMClient(customHeaders);
          const llmConfig = { model: useModelName, temperature, streaming: true };

          return new ReadableStream({
            async start(controller) {
              try {
                const aiStream = client.stream(messages as Message[], llmConfig);
                for await (const chunk of aiStream) {
                  if (chunk.content) {
                    controller.enqueue(encoder.encode(chunk.content.toString()));
                  }
                }
                controller.close();
              } catch (error: any) {
                controller.enqueue(encoder.encode(`[错误: ${error.message}]`));
                controller.close();
              }
            },
          });
        } else {
          return await streamWithOpenAICompatible(
            messages, useModelName, config.api_url, config.api_key, temperature, customHeaders
          );
        }
      }
    } catch (error) {
      console.error('[LLMSelector] 提供商配置获取失败，使用默认模型:', error);
    }
  }

  // 如果传入了 toolId，优先从工具配置获取模型
  if (toolId) {
    try {
      const config = await getToolModelConfig(toolId);
      if (config) {
        console.log(`[LLMSelector] 工具 ${toolId} 使用模型: ${config.providerSlug} / ${config.modelName}`);
        const isCoze = config.providerSlug.includes('coze');

        if (isCoze) {
          // 走扣子 SDK
          const client = createCozeLLMClient(customHeaders);
          const llmConfig = {
            model: config.modelName,
            temperature,
            streaming: true,
          };

          return new ReadableStream({
            async start(controller) {
              try {
                const aiStream = client.stream(messages as Message[], llmConfig);
                for await (const chunk of aiStream) {
                  if (chunk.content) {
                    controller.enqueue(encoder.encode(chunk.content.toString()));
                  }
                }
                controller.close();
              } catch (error: any) {
                controller.enqueue(encoder.encode(`[错误: ${error.message}]`));
                controller.close();
              }
            },
          });
        } else {
          // 走 OpenAI 兼容 API
          return await streamWithOpenAICompatible(
            messages, config.modelName, config.apiUrl, config.apiKey, temperature, customHeaders
          );
        }
      }
    } catch (error) {
      console.error('[LLMSelector] 获取工具模型配置失败，使用默认模型:', error);
    }
  }

  // 无 toolId 时的 fallback：根据模型名推断 provider
  console.log(`[LLMSelector] 无 toolId，使用默认模型: ${fallbackModel}`);
  const client = createCozeLLMClient(customHeaders);
  const llmConfig = {
    model: fallbackModel,
    temperature,
    streaming: true,
  };

  return new ReadableStream({
    async start(controller) {
      try {
        const aiStream = client.stream(messages as Message[], llmConfig);
        for await (const chunk of aiStream) {
          if (chunk.content) {
            controller.enqueue(encoder.encode(chunk.content.toString()));
          }
        }
        controller.close();
      } catch (error: any) {
        controller.enqueue(encoder.encode(`[错误: ${error.message}]`));
        controller.close();
      }
    },
  });
}

/**
 * 统一的 LLM 非流式生成函数
 * 
 * @param request NextRequest（用于提取转发头）
 * @param messages 对话消息
 * @param options 配置选项
 * @returns 生成结果
 */
export async function invokeWithModel(
  request: NextRequest,
  messages: ChatMessage[],
  options: {
    model?: string;         // fallback 模型名
    toolId?: string;        // 工具ID，走数据库配置
    providerSlug?: string;  // 直接指定提供商 slug（无需 utility_tools 记录）
    modelName?: string;     // 配合 providerSlug 使用，指定模型名
    temperature?: number;   // 温度参数
  } = {}
): Promise<{ content: string; model?: string; error?: string }> {
  const { model: fallbackModel = 'doubao-seed-1-8-251228', toolId, providerSlug, modelName, temperature = 0.7 } = options;
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  // 优先级：providerSlug > toolId > fallback
  if (providerSlug) {
    try {
      const config = await getProviderConfig(providerSlug);
      if (config) {
        const useModelName = modelName || fallbackModel;
        console.log(`[LLMSelector] 使用提供商: ${providerSlug} / ${useModelName}`);
        const isCoze = providerSlug.includes('coze');

        if (isCoze) {
          const client = createCozeLLMClient(customHeaders);
          const response = await client.invoke(messages as Message[], {
            model: useModelName,
            temperature,
          });

          if (!response || !response.content) {
            return { content: '', model: useModelName, error: 'AI未返回有效内容' };
          }

          return { content: response.content, model: useModelName };
        } else {
          const result = await invokeWithOpenAICompatible(
            messages, useModelName, config.api_url, config.api_key, temperature
          );
          return { ...result, model: useModelName };
        }
      }
    } catch (error) {
      console.error('[LLMSelector] 提供商配置获取失败，使用默认模型:', error);
    }
  }

  // 如果传入了 toolId，优先从工具配置获取模型
  if (toolId) {
    try {
      const config = await getToolModelConfig(toolId);
      if (config) {
        console.log(`[LLMSelector] 工具 ${toolId} 使用模型: ${config.providerSlug} / ${config.modelName}`);
        const isCoze = config.providerSlug.includes('coze');

        if (isCoze) {
          // 走扣子 SDK
          const client = createCozeLLMClient(customHeaders);
          const response = await client.invoke(messages as Message[], {
            model: config.modelName,
            temperature,
          });

          if (!response || !response.content) {
            return { content: '', model: config.modelName, error: 'AI未返回有效内容' };
          }

          return { content: response.content, model: config.modelName };
        } else {
          // 走 OpenAI 兼容 API
          const result = await invokeWithOpenAICompatible(
            messages, config.modelName, config.apiUrl, config.apiKey, temperature
          );
          return { ...result, model: config.modelName };
        }
      }
    } catch (error) {
      console.error('[LLMSelector] 获取工具模型配置失败，使用默认模型:', error);
    }
  }

  // 无 toolId 时的 fallback
  console.log(`[LLMSelector] 无 toolId，使用默认模型: ${fallbackModel}`);
  const client = createCozeLLMClient(customHeaders);
  const response = await client.invoke(messages as Message[], {
    model: fallbackModel,
    temperature,
  });

  if (!response || !response.content) {
    return { content: '', model: fallbackModel, error: 'AI未返回有效内容' };
  }

  return { content: response.content, model: fallbackModel };
}
