import { NextResponse } from 'next/server';

// 从环境变量获取4sAPI配置
const API4S_URL = process.env.API4S_URL || '';
const API4S_KEY = process.env.API4S_KEY || '';

// 品牌配置
const PROVIDER_CONFIG: Record<string, { icon: string; color: string; provider: string }> = {
  '豆包': { icon: 'Bot', color: 'bg-emerald-500', provider: '豆包' },
  'DeepSeek': { icon: 'Zap', color: 'bg-violet-500', provider: 'DeepSeek' },
  'Kimi': { icon: 'Moon', color: 'bg-amber-500', provider: 'Kimi' },
  'GLM': { icon: 'BarChart3', color: 'bg-blue-500', provider: 'GLM' },
  'Qwen': { icon: 'Mountain', color: 'bg-orange-500', provider: 'Qwen' },
  'GPT': { icon: 'Cpu', color: 'bg-green-500', provider: 'GPT (4sAPI)' },
  'Claude': { icon: 'Brain', color: 'bg-amber-600', provider: 'Claude (4sAPI)' },
  'Gemini': { icon: 'Sparkles', color: 'bg-blue-400', provider: 'Gemini (4sAPI)' },
};

// 免费模型列表（Coze SDK支持的模型）
const FREE_MODELS: Array<{ id: string; name: string; provider: string; description?: string; recommended?: boolean }> = [
  { id: 'doubao-seed-2-0-pro-260215', name: 'Seed 2.0 Pro', provider: '豆包', description: '旗舰全能' },
  { id: 'doubao-seed-2-0-lite-260215', name: 'Seed 2.0 Lite', provider: '豆包', description: '轻量快速' },
  { id: 'doubao-seed-1-8-251228', name: 'Seed 1.8', provider: '豆包', description: '多模态优化' },
  { id: 'deepseek-r1-250528', name: 'R1 (推理)', provider: 'DeepSeek', description: '深度推理', recommended: true },
  { id: 'deepseek-v3-2-251201', name: 'V3', provider: 'DeepSeek', description: '平衡推理' },
  { id: 'glm-5-0-260211', name: 'GLM-5', provider: 'GLM', description: '旗舰基座' },
  { id: 'qwen-3-5-plus-260215', name: 'Qwen 3.5 Plus', provider: 'Qwen', description: '混合架构' },
];

// 从4sAPI获取模型列表
async function fetchModelsFrom4sAPI(): Promise<Array<{ id: string; name: string; provider: string; description?: string }>> {
  if (!API4S_URL || !API4S_KEY) {
    console.log('4sAPI 未配置，跳过');
    return [];
  }

  try {
    const response = await fetch(`${API4S_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API4S_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('4sAPI 请求失败:', response.status);
      return [];
    }

    const data = await response.json();
    
    // 解析4sAPI返回的模型列表
    // 通常返回格式: { data: [{ id: "gpt-4o", object: "model" }, ...] }
    const models = data.data || [];
    
    // 分类模型
    const paidModels: Array<{ id: string; name: string; provider: string; description?: string }> = [];
    
    models.forEach((model: { id?: string; object?: string }) => {
      const modelId = model.id || '';
      if (modelId.includes('gpt-4') || modelId.includes('o1') || modelId.includes('o3')) {
        paidModels.push({
          id: modelId,
          name: modelId.replace(/^(gpt-|o[13]-)/i, 'GPT-').replace(/-/g, ' '),
          provider: 'GPT (4sAPI)',
          description: '付费模型',
        });
      } else if (modelId.includes('claude')) {
        paidModels.push({
          id: modelId,
          name: modelId.replace(/^(claude-)/i, 'Claude '),
          provider: 'Claude (4sAPI)',
          description: '付费模型',
        });
      } else if (modelId.includes('gemini')) {
        paidModels.push({
          id: modelId,
          name: modelId.replace(/^(gemini-)/i, 'Gemini ').replace(/-/g, ' '),
          provider: 'Gemini (4sAPI)',
          description: '付费模型',
        });
      }
    });

    return paidModels;
  } catch (error) {
    console.error('获取4sAPI模型失败:', error);
    return [];
  }
}

// 构建分组数据
function buildGroups(freeModels: typeof FREE_MODELS, paidModels: Array<{ id: string; name: string; provider: string; description?: string }>) {
  const groups: Array<{
    provider: string;
    icon: string;
    color: string;
    models: Array<{ value: string; label: string; region: string; recommended?: boolean }>;
  }> = [];

  // 按提供商分组免费模型
  const freeByProvider = new Map<string, typeof FREE_MODELS>();
  freeModels.forEach(m => {
    if (!freeByProvider.has(m.provider)) {
      freeByProvider.set(m.provider, []);
    }
    freeByProvider.get(m.provider)!.push(m);
  });

  freeByProvider.forEach((models, provider) => {
    const config = PROVIDER_CONFIG[provider] || { icon: 'Bot', color: 'bg-slate-500', provider };
    groups.push({
      provider: config.provider,
      icon: config.icon,
      color: config.color,
      models: models.map(m => ({
        value: m.id,
        label: m.name,
        region: '免费',
        recommended: m.recommended,
      })),
    });
  });

  // 按提供商分组付费模型
  if (paidModels.length > 0) {
    const paidByProvider = new Map<string, typeof paidModels>();
    paidModels.forEach(m => {
      const provider = m.provider;
      if (!paidByProvider.has(provider)) {
        paidByProvider.set(provider, []);
      }
      paidByProvider.get(provider)!.push(m);
    });

    paidByProvider.forEach((models, provider) => {
      const config = PROVIDER_CONFIG[provider] || { icon: 'Cpu', color: 'bg-slate-500', provider };
      groups.push({
        provider: config.provider,
        icon: config.icon,
        color: config.color,
        models: models.map(m => ({
          value: m.id,
          label: m.name,
          region: '付费',
        })),
      });
    });
  }

  return groups;
}

export async function GET() {
  try {
    // 并行获取免费模型和付费模型
    const [paidModels] = await Promise.all([
      fetchModelsFrom4sAPI(),
    ]);

    // 构建分组数据
    const groups = buildGroups(FREE_MODELS, paidModels);

    // 构建扁平列表
    const options = [
      ...FREE_MODELS.map(m => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        icon: PROVIDER_CONFIG[m.provider]?.icon || 'Bot',
        color: PROVIDER_CONFIG[m.provider]?.color || 'bg-slate-500',
        description: m.description,
        recommended: m.recommended,
        isPaid: false,
      })),
      ...paidModels.map(m => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        icon: PROVIDER_CONFIG[m.provider]?.icon || 'Cpu',
        color: PROVIDER_CONFIG[m.provider]?.color || 'bg-slate-500',
        description: m.description,
        isPaid: true,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        options,
        groups,
        defaultModel: 'deepseek-r1-250528',
      },
    });
  } catch (error) {
    console.error('获取模型列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取模型列表失败' },
      { status: 500 }
    );
  }
}
