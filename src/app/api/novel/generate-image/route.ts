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

// 生图提示词模板
const SYSTEM_PROMPT = `你是专业的AI漫画图像生成专家，擅长生成高质量的小说风格漫画图片。

核心要求：
1. 根据分镜描述生成专业、生动的漫画提示词
2. 提示词应包含：场景、人物、动作、情绪、风格等关键元素
3. 适配指定的漫画风格（古风/Q版/写实/赛博朋克/暗黑）
4. 画质要求明确（标清512/高清1024/超清2048）

输出格式：
直接输出英文提示词`;

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
    const { prompt, quality, style, model } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '请提供分镜描述' }, { status: 400 });
    }

    const qualityMap: Record<string, { size: string; quality: string }> = {
      '512': { size: '512x512', quality: 'standard' },
      '1024': { size: '1024x1024', quality: 'hd' },
      '2048': { size: '1024x1024', quality: 'hd' },
    };

    const q = qualityMap[quality || '1024'] || qualityMap['1024'];

    const userPrompt = `请为以下漫画分镜生成AI生图提示词：

分镜描述：${prompt}
漫画风格：${style || '古风'}
画质设置：${q.size}

请生成专业的英文提示词。`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';

    let fullPrompt = '';
    
    if (is4sapiModel(targetModel)) {
      fullPrompt = await call4sapiAPI(messages, targetModel);
    } else if (isFreeModel(targetModel)) {
      fullPrompt = await callCozeAPI(messages, targetModel);
    } else {
      return NextResponse.json({ error: '不支持的模型，请选择免费模型或4sAPI模型' }, { status: 400 });
    }

    // 返回占位图片URL
    const placeholderImageUrl = `https://picsum.photos/${q.size}?random=${Date.now()}`;

    return NextResponse.json({
      prompt: fullPrompt || prompt,
      imageUrl: placeholderImageUrl,
      quality: q.size,
    });

  } catch (error: any) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: error.message || '生图失败' }, { status: 500 });
  }
}
