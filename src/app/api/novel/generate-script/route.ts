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

// 推文脚本生成系统提示词
const SYSTEM_PROMPT = `你是专业的短视频脚本策划师，擅长为漫画内容生成适配抖音/小红书平台的推文脚本。

核心要求：
1. 根据小说内容和漫画分镜，生成完整的推文脚本
2. 适配指定的平台（抖音/小红书）和风格（悬疑/甜宠/爽文/古风/搞笑）
3. 脚本时长精确分配（15秒/30秒/60秒）
4. 每个镜头包含：时长、旁白、字幕、背景音乐建议、话题标签
5. 节奏紧凑，符合平台引流逻辑

输出格式：
时长：【X秒】
镜头：【镜头编号】
旁白：【旁白内容】
字幕：【字幕内容（简短有力）】
背景音乐：【BGM建议】
话题：【#标签1 #标签2 #标签3】`;

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
    const { text, panels, platform, style, duration, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    const platformMap: Record<string, string> = {
      douyin: '抖音',
      xiaohongshu: '小红书',
    };

    const durationSeconds = parseInt(duration || '30');
    const shotCount = Math.min(Math.ceil(durationSeconds / 5), 12);

    const userPrompt = `请根据以下小说和漫画分镜生成推文脚本：

发布平台：${platformMap[platform || 'douyin']}
推文风格：${style || '爽文'}
视频时长：${durationSeconds}秒
分镜数量：约${shotCount}个镜头
小说内容：
${text.substring(0, 2000)}...

请生成完整的短视频推文脚本。`;

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
    console.error('Generate script error:', error);
    return NextResponse.json({ error: error.message || '脚本生成失败' }, { status: 500 });
  }
}
