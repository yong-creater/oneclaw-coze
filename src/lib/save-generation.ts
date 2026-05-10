import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 模型价格表（4sAPI模型）
const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'dall-e-3': { input: 0.04, output: 0 }, // 按图计费
  'gpt-image-1': { input: 0.01, output: 0 }, // 按图计费
};

// 免费模型列表
const FREE_MODELS = [
  'doubao-seed', 'doubao-pro', 'doubao-lite',
  'ep-20250312145957-p8xpp', 'ep-20250410165509-dtk4n',
];

/**
 * 计算生成费用
 */
export function calculateCost(inputTokens: number, outputTokens: number, model: string): { cost: number; isFree: boolean } {
  // 检查是否为免费模型
  const isFree = FREE_MODELS.some(m => model.toLowerCase().includes(m.toLowerCase()));
  if (isFree) {
    return { cost: 0, isFree: true };
  }

  // 查找模型价格
  const modelKey = Object.keys(MODEL_PRICES).find(k => model.toLowerCase().includes(k.toLowerCase()));
  if (!modelKey) {
    return { cost: 0, isFree: false };
  }

  const price = MODEL_PRICES[modelKey];
  const cost = (inputTokens / 1000) * price.input + (outputTokens / 1000) * price.output;
  return { cost, isFree: false };
}

/**
 * 获取模型信息
 */
export function getModelInfo(modelId: string): { name: string; price: string; isFree: boolean } {
  const isFree = FREE_MODELS.some(m => modelId.toLowerCase().includes(m.toLowerCase()));
  if (isFree) {
    return { name: '扣子内置模型', price: '免费', isFree: true };
  }

  const modelKey = Object.keys(MODEL_PRICES).find(k => modelId.toLowerCase().includes(k.toLowerCase()));
  if (modelKey) {
    const price = MODEL_PRICES[modelKey];
    return { 
      name: modelKey.toUpperCase(), 
      price: `$${price.input}/1K in, $${price.output}/1K out`,
      isFree: false 
    };
  }

  return { name: modelId, price: '未知', isFree: false };
}

// 获取用户ID的辅助函数
export function getUserId(request: NextRequest): string | null {
  const tokenCookie = request.cookies.get('user_token');
  if (tokenCookie?.value) {
    try {
      const payload = JSON.parse(Buffer.from(tokenCookie.value.split('.')[1], 'base64').toString());
      return payload.user_id || payload.sub || null;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

// 保存生成记录的辅助函数（异步，不影响主流程）
export async function saveGeneration(
  request: NextRequest,
  params: {
    tool_id: number;
    tool_name: string;
    tool_type: string;
    input_params: any;
    output_content: any;
    title?: string;
    thumbnail?: string;
    usage_type?: string;
    input_tokens?: number;
    output_tokens?: number;
    model?: string;
  }
): Promise<void> {
  const userId = getUserId(request);
  if (!userId) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    
    // 计算费用
    const inputTokens = params.input_tokens || 0;
    const outputTokens = params.output_tokens || 0;
    const model = params.model || 'doubao-seed';
    const { cost, isFree } = calculateCost(inputTokens, outputTokens, model);

    await supabase
      .from('user_generations')
      .insert({
        user_id: userId,
        tool_id: params.tool_id,
        tool_name: params.tool_name,
        tool_type: params.tool_type,
        input_params: params.input_params ? JSON.stringify(params.input_params) : null,
        output_content: params.output_content ? JSON.stringify(params.output_content) : null,
        title: params.title,
        thumbnail: params.thumbnail,
        usage_type: params.usage_type,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost: cost,
        model: model,
        is_free: isFree,
      });
  } catch (error) {
    console.error('Failed to save generation:', error);
  }
}
