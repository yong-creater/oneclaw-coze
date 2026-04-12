import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API2D_URL || 'https://4sapi.com';
const API_KEY = process.env.NEXT_PUBLIC_API2D_KEY;

interface Model {
  id: string;
  name: string;
  provider: string;
  providerLogo: string;
  category: string;
  recommend: string;
}

// 模型供应商映射
const PROVIDER_MAP: Record<string, { name: string; logo: string }> = {
  'openai': { name: 'OpenAI', logo: '🤖' },
  'anthropic': { name: 'Anthropic', logo: '🧠' },
  'google': { name: 'Google', logo: '🔴' },
  'vertex-ai': { name: 'Google', logo: '🔴' },
  'xai': { name: 'xAI', logo: '💀' },
  'moonshot': { name: 'Moonshot', logo: '🌙' },
  'deepseek': { name: 'DeepSeek', logo: '🔵' },
  'ali': { name: '阿里云', logo: '🏢' },
  'codex': { name: 'OpenAI Codex', logo: '🤖' },
  'mistral': { name: 'Mistral', logo: '🌫️' },
  'stability': { name: 'Stability', logo: '⚡' },
  'custom': { name: '其他', logo: '⚡' },
};

// 模型分类规则
const CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5', 'chatgpt'], category: '对话' },
  { keywords: ['claude'], category: '对话' },
  { keywords: ['gemini'], category: '对话' },
  { keywords: ['kimi', 'moonshot'], category: '对话' },
  { keywords: ['grok'], category: '对话' },
  { keywords: ['deepseek'], category: '对话' },
  { keywords: ['qwen', 'yi-', 'baichuan'], category: '对话' },
  { keywords: ['o1', 'o3', 'o4', 'reasoning'], category: '推理' },
  { keywords: ['dall-e', 'flux', 'stable-diffusion', 'imagen', 'midjourney'], category: '图像' },
  { keywords: ['whisper', 'tts', 'speech'], category: '音频' },
  { keywords: ['veo', 'video', 'sora'], category: '视频' },
  { keywords: ['embedding', 'vector'], category: '向量' },
  { keywords: ['codex', 'coder', 'code'], category: '代码' },
  { keywords: ['vision'], category: '视觉' },
];

// 推荐说明
const RECOMMEND_MAP: Record<string, string> = {
  'gpt-4o': 'GPT-4o 旗舰',
  'gpt-4o-mini': '快速响应',
  'claude-3-5-sonnet': 'Claude 写作',
  'gemini-2-5-pro': 'Gemini 旗舰',
  'gemini-2-5-flash': '极速免费',
  'kimi-k2': 'Kimi 最新',
  'grok-4': 'Grok 旗舰',
  'deepseek-v3': 'DeepSeek 旗舰',
  'o1': 'o1 推理',
  'o3': 'o3 最新推理',
};

// 获取模型分类
function getModelCategory(modelId: string): string {
  const lowerId = modelId.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (lowerId.includes(keyword)) {
        return rule.category;
      }
    }
  }
  return '对话';
}

// 获取供应商信息
function getProviderInfo(owner: string): { name: string; logo: string } {
  const lowerOwner = owner.toLowerCase();
  for (const [key, value] of Object.entries(PROVIDER_MAP)) {
    if (lowerOwner.includes(key)) {
      return value;
    }
  }
  return { name: owner, logo: '⚡' };
}

// 获取推荐说明
function getRecommend(modelId: string): string {
  const lowerId = modelId.toLowerCase();
  for (const [key, value] of Object.entries(RECOMMEND_MAP)) {
    if (lowerId.includes(key)) {
      return value;
    }
  }
  return getModelCategory(modelId);
}

// 格式化模型名称
function formatModelName(modelId: string): string {
  return modelId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(`${API_BASE_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models from 4sapi');
    }

    const data = await response.json();
    const rawModels = data.data || [];

    const models: Model[] = rawModels.map((m: any) => {
      const provider = getProviderInfo(m.owned_by);
      
      return {
        id: m.id,
        name: formatModelName(m.id),
        provider: provider.name,
        providerLogo: provider.logo,
        category: getModelCategory(m.id),
        recommend: getRecommend(m.id),
      };
    });

    return NextResponse.json({
      success: true,
      total: models.length,
      models,
    });

  } catch (error: any) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
