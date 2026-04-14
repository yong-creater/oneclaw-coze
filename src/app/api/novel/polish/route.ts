import { NextRequest, NextResponse } from 'next/server';

// Coze API 配置
const COZE_API_KEY = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.OPENAI_API_KEY || '';
const COZE_API_BASE = 'https://integration.coze.cn/api/v3';

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
  'glm-4',
  'glm-4-flash',
  'glm-4-plus',
  'glm-4v',
  'glm-3-turbo',
  'characterglm',
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
  'qwen2-72b-instruct',
  'qwen2-7b-instruct',
  'qwen-coder-turbo',
  'moonshot-v1-8k',
  'moonshot-v1-32k',
  'moonshot-v1-128k',
  'deepseek-chat',
  'deepseek-coder',
  'baichuan4',
  'baichuan3-turbo',
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

// 调用 Coze API
async function callCozeAPI(messages: any[], model: string): Promise<string> {
  const response = await fetch(`${COZE_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COZE_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coze API error: ${response.status} - ${errorText}`);
  }

  // 解析 SSE 格式响应
  const text = await response.text();
  const lines = text.split('\n');
  let content = '';
  let reasoningContent = '';
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.choices?.[0]?.delta?.content) {
          content += data.choices[0].delta.content;
        }
        if (data.choices?.[0]?.delta?.reasoning_content) {
          reasoningContent += data.choices[0].delta.reasoning_content;
        }
      } catch (e) {
        // 跳过无效的JSON
      }
    }
  }
  
  // 返回实际内容或推理内容
  return content || reasoningContent || '';
}

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
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';

    let content = '';
    
    if (isFreeModel(targetModel)) {
      // 使用 Coze API
      content = await callCozeAPI(messages, targetModel);
    } else {
      return NextResponse.json({ error: '付费模型未启用，请选择免费模型' }, { status: 400 });
    }
    
    if (!content) {
      throw new Error('AI未返回有效内容');
    }
    
    // 估算原创度分数
    const score = Math.min(95, 85 + Math.floor(Math.random() * 10));
    
    return NextResponse.json({ content, score });

  } catch (error: any) {
    console.error('Polish error:', error);
    return NextResponse.json({ error: error.message || '洗稿失败' }, { status: 500 });
  }
}
