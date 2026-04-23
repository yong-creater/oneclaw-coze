import { NextRequest, NextResponse } from 'next/server';

// Coze API 配置
const COZE_API_KEY = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.OPENAI_API_KEY || '';
const COZE_API_BASE = 'https://integration.coze.cn/api/v3';

// 4sAPI 配置
const ENABLE_4SAPI = process.env.ENABLE_4SAPI === 'true';
const API4S_KEY = process.env.API4S_KEY || '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com/v1';

// 4sAPI 专属模型列表
const API4S_MODELS = [
  'gpt-4o',
  'gpt-4o-mini', 
  'gpt-4-turbo',
  'claude-3-5-sonnet',
  'claude-3-5-haiku',
  'claude-sonnet-4',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
];

// 免费模型列表 (Coze)
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

// 检查是否为免费模型 (Coze)
function isFreeModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return FREE_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 检查是否为 4sAPI 模型
function is4sapiModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return API4S_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 调用 4sAPI
async function call4sapiAPI(messages: any[], model: string): Promise<string> {
  if (!ENABLE_4SAPI || !API4S_KEY) {
    throw new Error('4sAPI 未启用或未配置密钥');
  }

  const response = await fetch(`${API4S_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API4S_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`4sAPI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

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
  
  return content || reasoningContent || '';
}

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
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';

    let content = '';
    
    if (is4sapiModel(targetModel)) {
      content = await call4sapiAPI(messages, targetModel);
    } else if (isFreeModel(targetModel)) {
      content = await callCozeAPI(messages, targetModel);
    } else {
      return NextResponse.json({ error: '不支持的模型，请选择免费模型或4sAPI模型' }, { status: 400 });
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
