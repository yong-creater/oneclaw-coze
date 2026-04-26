import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用Coze内置的环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 模型选项（前端获取可用模型列表）
export const AVAILABLE_MODELS = {
  coze: [
    { id: 'doubao-seed-2-0-pro-260215', name: '豆包Seed 2.0 Pro', isFree: true, maxTokens: 64000 },
    { id: 'doubao-seed-2-0-lite-260215', name: '豆包Seed 2.0 Lite', isFree: true, maxTokens: 32000 },
    { id: 'doubao-seed-2-0-mini-260215', name: '豆包Seed 2.0 Mini', isFree: true, maxTokens: 16000 },
    { id: 'doubao-seed-1-8-251228', name: '豆包Seed 1.8', isFree: true, maxTokens: 32000 },
    { id: 'deepseek-r1-250528', name: 'DeepSeek R1', isFree: true, maxTokens: 64000 },
    { id: 'deepseek-v3-2-251201', name: 'DeepSeek V3', isFree: true, maxTokens: 64000 },
    { id: 'kimi-k2-5-260127', name: 'Kimi K2.5', isFree: true, maxTokens: 32000 },
    { id: 'glm-5-0-260211', name: 'GLM-5.0', isFree: true, maxTokens: 32000 },
    { id: 'qwen3-5-plus-260215', name: 'Qwen3.5 Plus', isFree: true, maxTokens: 32000 },
    { id: 'doubao-seed-1-6-vision-250815', name: '豆包视觉模型', isFree: true, maxTokens: 16000, isVision: true },
    { id: 'coze-image', name: '扣子图片生成', isFree: true, type: 'image' },
  ],
  // 4sapi模型（付费）
  '4sapi': [
    { id: '4s-gpt-4o', name: 'GPT-4o', price: 0.0025, maxTokens: 128000 },
    { id: '4s-gpt-4o-mini', name: 'GPT-4o Mini', price: 0.00015, maxTokens: 128000 },
    { id: '4s-gpt-4-turbo', name: 'GPT-4 Turbo', price: 0.01, maxTokens: 128000 },
    { id: '4s-claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', price: 0.003, maxTokens: 200000 },
    { id: '4s-claude-3-opus', name: 'Claude 3 Opus', price: 0.015, maxTokens: 200000 },
    { id: '4s-gemini-1-5-pro', name: 'Gemini 1.5 Pro', price: 0.00125, maxTokens: 2000000 },
    { id: '4s-gemini-1-5-flash', name: 'Gemini 1.5 Flash', price: 0.000075, maxTokens: 1000000 },
  ]
};

// GET - 获取模型配置列表
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('tool_model_configs')
      .select('*')
      .order('tool_id');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
    }

    // 附加模型选项信息
    const configs = (data || []).map(config => {
      const source = config.model_source;
      const modelOptions = source === '4sapi' ? AVAILABLE_MODELS['4sapi'] : AVAILABLE_MODELS.coze;
      const currentModel = modelOptions.find(m => m.id === config.default_model);
      
      return {
        ...config,
        model_info: currentModel,
        model_options: modelOptions,
        available_sources: [
          { id: 'coze', name: '扣子免费模型', models: AVAILABLE_MODELS.coze },
          { id: '4sapi', name: '4sAPI付费模型', models: AVAILABLE_MODELS['4sapi'] },
        ]
      };
    });

    return NextResponse.json({
      success: true,
      configs: configs || [],
      available_models: AVAILABLE_MODELS,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PUT - 批量更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { configs } = body;

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json({ error: '无效的配置数据' }, { status: 400 });
    }

    const results = [];
    for (const config of configs) {
      const { data, error } = await supabase
        .from('tool_model_configs')
        .update({
          default_model: config.default_model,
          model_source: config.model_source,
          model_price_per_1k_tokens: config.model_price_per_1k_tokens || 0,
          is_free: config.is_free ?? true,
          is_active: config.is_active ?? true,
          config_params: config.config_params ? JSON.stringify(config.config_params) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('tool_id', config.tool_id)
        .select()
        .single();

      if (error) {
        results.push({ tool_id: config.tool_id, success: false, error: error.message });
      } else {
        results.push({ tool_id: config.tool_id, success: true, data });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST - 获取单个工具的模型配置（供前台调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ error: '请提供工具ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tool_model_configs')
      .select('*')
      .eq('tool_id', tool_id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '工具配置不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config: {
        tool_id: data.tool_id,
        tool_name: data.tool_name,
        tool_type: data.tool_type,
        default_model: data.default_model,
        model_source: data.model_source,
        is_free: data.is_free,
        config_params: data.config_params,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
