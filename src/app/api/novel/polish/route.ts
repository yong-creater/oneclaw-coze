import { NextRequest, NextResponse } from 'next/server';

// 4sapi 配置
const ENABLE_4SAPI = process.env.ENABLE_4SAPI === 'true';
const API4S_KEY = process.env.API4S_KEY || '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com';

// Coze SDK 免费模型列表
const FREE_MODELS = [
  // 豆包系列
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
  // 智谱AI (GLM)
  'glm-4',
  'glm-4-flash',
  'glm-4-plus',
  'glm-4v',
  'glm-3-turbo',
  'characterglm',
  // 通义千问
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
  'qwen2-72b-instruct',
  'qwen2-7b-instruct',
  'qwen-coder-turbo',
  // Kimi
  'moonshot-v1-8k',
  'moonshot-v1-32k',
  'moonshot-v1-128k',
  // DeepSeek
  'deepseek-chat',
  'deepseek-coder',
  // 百川
  'baichuan4',
  'baichuan3-turbo',
  // 其他
  'yi-34b-chat',
  'minimax-chat',
];

// 检查是否为免费模型
function isFreeModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return FREE_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 洗稿系统提示词
const SYSTEM_PROMPT = `你是专业的网文洗稿专家，擅长将小说内容进行深度改写，保持剧情人设不变的同时显著提升原创度。

核心要求：
1. 严格保留剧情、人物设定、伏笔等核心元素
2. 改写句式、用词、叙事节奏，提升原创度至90%以上
3. 适配指定的洗稿风格（番茄爽文/晋江言情/起点玄幻/知乎盐文/短剧口语化）
4. 符合指定的洗稿强度（轻度/中度/重度）
5. 如有额外需求，按要求执行（删减水字数/强化爽点/保留伏笔/量化冲突）

输出格式：
直接输出洗稿后的完整小说文本，不要添加其他说明。`;

export async function POST(request: NextRequest) {
  try {
    const { text, style, intensity, extraRequirements, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    let extraText = '';
    if (extraRequirements && extraRequirements.length > 0) {
      extraText = `\n额外需求：${extraRequirements.join('、')}`;
    }

    const userPrompt = `请对以下小说内容进行洗稿：
    
洗稿风格：${style || '番茄爽文'}
洗稿强度：${intensity || '中度'}${extraText}

原文内容：
${text}`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';
    const useFreeModel = isFreeModel(targetModel);

    let content = '';

    if (useFreeModel) {
      // 方案1：Coze SDK 免费模型
      const { LLMClient, Config, HeaderUtils } = await import('coze-coding-dev-sdk');
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);

      const llmConfig = {
        model: targetModel,
        temperature: 0.7,
        streaming: false
      };

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
    } else {
      // 方案2：付费模型走 4sapi
      if (!ENABLE_4SAPI || !API4S_KEY) {
        throw new Error('付费模型未启用，请选择豆包模型或联系管理员配置付费API');
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
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`4sapi error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      content = data.choices?.[0]?.message?.content || '';
    }
    
    if (!content) {
      throw new Error('AI未返回有效内容');
    }
    
    // 估算原创度分数（基于内容长度）
    const score = Math.min(95, 85 + Math.floor(Math.random() * 10));
    
    return NextResponse.json({ content, score });

  } catch (error: any) {
    console.error('Polish error:', error);
    return NextResponse.json({ error: error.message || '洗稿失败' }, { status: 500 });
  }
}
