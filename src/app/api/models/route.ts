import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API2D_URL || 'https://4sapi.com';
const API_KEY = process.env.NEXT_PUBLIC_API2D_KEY;

// 国内模型供应商（不走4sapi，用Coze免费）
const DOMESTIC_PROVIDERS = ['doubao', 'deepseek', 'kimi', 'glm', 'qwen', 'minimax', 'ali', 'baidu', 'tencent', 'huawei', '字节', ' moonshot'];

// Coze 免费模型
const COZE_FREE_MODELS = [
  { id: 'doubao-seed-2-0-pro-260215', name: '豆包 Seed Pro', category: '对话', recommend: '旗舰全能', provider: 'Coze', providerLogo: '🦞' },
  { id: 'doubao-seed-2-0-lite-260215', name: '豆包 Seed Lite', category: '对话', recommend: '均衡性价比', provider: 'Coze', providerLogo: '🦞' },
  { id: 'doubao-seed-2-0-mini-260215', name: '豆包 Seed Mini', category: '对话', recommend: '轻量快速', provider: 'Coze', providerLogo: '🦞' },
  { id: 'doubao-seed-1-8-251228', name: '豆包 Seed 1.8', category: '对话', recommend: '多模态Agent', provider: 'Coze', providerLogo: '🦞' },
  { id: 'doubao-seed-1-6-251015', name: '豆包 Seed 1.6', category: '对话', recommend: '能力多面手', provider: 'Coze', providerLogo: '🦞' },
  { id: 'doubao-seed-1-6-vision-250815', name: '豆包 Seed Vision', category: '视觉', recommend: '视觉理解SOTA', provider: 'Coze', providerLogo: '🦞' },
  { id: 'doubao-seed-1-6-thinking-250715', name: '豆包 Seed Thinking', category: '推理', recommend: '深度思考', provider: 'Coze', providerLogo: '🦞' },
  { id: 'deepseek-v3-2-251201', name: 'DeepSeek V3', category: '对话', recommend: '平衡推理', provider: 'Coze', providerLogo: '🔵' },
  { id: 'deepseek-r1-250528', name: 'DeepSeek R1', category: '推理', recommend: '671B满血推理', provider: 'Coze', providerLogo: '🔵' },
  { id: 'kimi-k2-5-260127', name: 'Kimi K2.5', category: '对话', recommend: 'Kimi最智能', provider: 'Coze', providerLogo: '🌙' },
  { id: 'kimi-k2-250905', name: 'Kimi K2', category: '对话', recommend: '万亿参数开源', provider: 'Coze', providerLogo: '🌙' },
  { id: 'glm-5-0-260211', name: 'GLM-5', category: '对话', recommend: '智谱旗舰', provider: 'Coze', providerLogo: '📊' },
  { id: 'glm-4-7-251222', name: 'GLM-4.7', category: '对话', recommend: '编程推理强', provider: 'Coze', providerLogo: '📊' },
  { id: 'qwen-3-5-plus-260215', name: 'Qwen 3.5 Plus', category: '对话', recommend: '混合注意力', provider: 'Coze', providerLogo: '🏢' },
  { id: 'minimax-m2-5-260212', name: 'MiniMax M2.5', category: '对话', recommend: '编码Agent SOTA', provider: 'Coze', providerLogo: '⚡' },
  { id: 'minimax-m2-7-260318', name: 'MiniMax M2.7', category: '对话', recommend: '复杂Agent', provider: 'Coze', providerLogo: '⚡' },
];

// 模型供应商映射（原始owner值）
const OWNER_MAP: Record<string, { name: string; logo: string }> = {
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
  'meta': { name: 'Meta', logo: '🦾' },
  'cohere': { name: 'Cohere', logo: '🌊' },
  'perplexity': { name: 'Perplexity', logo: '🔍' },
  'custom': { name: '其他', logo: '📦' },
};

// 模型名关键字映射厂商
const MODEL_KEYWORD_PROVIDER: Array<{ keywords: string[]; name: string; logo: string }> = [
  { keywords: ['claude', 'anthropic'], name: 'Anthropic', logo: '🧠' },
  { keywords: ['gemini'], name: 'Google', logo: '🔴' },
  { keywords: ['grok', 'xai'], name: 'xAI', logo: '💀' },
  { keywords: ['flux', 'stability'], name: 'Stability', logo: '⚡' },
  { keywords: ['veo'], name: 'Google', logo: '🔴' },
  { keywords: ['mistral'], name: 'Mistral', logo: '🌫️' },
  { keywords: ['llama', 'meta'], name: 'Meta', logo: '🦾' },
  { keywords: ['cohere'], name: 'Cohere', logo: '🌊' },
  { keywords: ['perplexity'], name: 'Perplexity', logo: '🔍' },
  { keywords: ['o1', 'o3', 'o4', 'gpt-5'], name: 'OpenAI', logo: '🤖' },
];

// 模型分类规则
const CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5'], category: '对话' },
  { keywords: ['claude'], category: '对话' },
  { keywords: ['gemini'], category: '对话' },
  { keywords: ['kimi', 'moonshot'], category: '对话' },
  { keywords: ['grok'], category: '对话' },
  { keywords: ['qwen', 'yi-', 'baichuan'], category: '对话' },
  { keywords: ['o1', 'o3', 'o4', 'reasoning'], category: '推理' },
  { keywords: ['dall-e', 'flux', 'stable-diffusion', 'imagen', 'midjourney'], category: '图像' },
  { keywords: ['whisper', 'tts', 'speech'], category: '音频' },
  { keywords: ['veo', 'video', 'sora'], category: '视频' },
  { keywords: ['embedding', 'vector'], category: '向量' },
  { keywords: ['codex', 'coder', 'code'], category: '代码' },
  { keywords: ['vision'], category: '视觉' },
  { keywords: ['llama'], category: '对话' },
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

// 获取供应商信息（优先按owner，其次按模型名关键字）
function getProviderInfo(modelId: string, owner: string): { name: string; logo: string } {
  const lowerOwner = owner.toLowerCase();
  
  // 先按owner映射
  for (const [key, value] of Object.entries(OWNER_MAP)) {
    if (lowerOwner.includes(key)) {
      // 如果是custom，则按模型名关键字进一步识别
      if (key === 'custom') {
        const lowerId = modelId.toLowerCase();
        for (const rule of MODEL_KEYWORD_PROVIDER) {
          for (const keyword of rule.keywords) {
            if (lowerId.includes(keyword)) {
              return { name: rule.name, logo: rule.logo };
            }
          }
        }
      }
      return value;
    }
  }
  
  // 如果owner没匹配，按模型名关键字识别
  const lowerId = modelId.toLowerCase();
  for (const rule of MODEL_KEYWORD_PROVIDER) {
    for (const keyword of rule.keywords) {
      if (lowerId.includes(keyword)) {
        return { name: rule.name, logo: rule.logo };
      }
    }
  }
  
  return { name: '其他', logo: '📦' };
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

// 判断是否为国内模型（用Coze免费）
function isDomesticModel(modelId: string, owner: string): boolean {
  const lowerId = modelId.toLowerCase();
  const lowerOwner = owner.toLowerCase();
  
  for (const keyword of DOMESTIC_PROVIDERS) {
    if (lowerId.includes(keyword.toLowerCase()) || lowerOwner.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// 判断是否为4sapi付费模型
function is4sapiModel(owner: string): boolean {
  const lowerOwner = owner.toLowerCase();
  // custom 也算，因为可能是三方模型
  return !lowerOwner.includes('doubao') && !lowerOwner.includes('deepseek') && 
         !lowerOwner.includes('kimi') && !lowerOwner.includes('glm') && 
         !lowerOwner.includes('qwen') && !lowerOwner.includes('minimax');
}

export async function GET() {
  try {
    const models: any[] = [];
    
    // 1. 添加 Coze 免费模型
    models.push(...COZE_FREE_MODELS.map(m => ({
      ...m,
      isFree: true,
      source: 'Coze 免费',
    })));
    
    // 2. 从 4sapi 获取付费模型
    if (API_KEY) {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/models`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
          },
          next: { revalidate: 3600 }
        });

        if (response.ok) {
          const data = await response.json();
          const rawModels = data.data || [];

          rawModels.forEach((m: any) => {
            // 跳过国内模型（走Coze免费）
            if (isDomesticModel(m.id, m.owned_by)) return;
            
            const provider = getProviderInfo(m.id, m.owned_by);
            
            models.push({
              id: m.id,
              name: formatModelName(m.id),
              provider: provider.name,
              providerLogo: provider.logo,
              category: getModelCategory(m.id),
              recommend: getRecommend(m.id),
              isFree: false,
              source: '4sapi 付费',
            });
          });
        }
      } catch (e) {
        console.error('Failed to fetch 4sapi models:', e);
      }
    }

    return NextResponse.json({
      success: true,
      total: models.length,
      freeCount: models.filter(m => m.isFree).length,
      paidCount: models.filter(m => !m.isFree).length,
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
