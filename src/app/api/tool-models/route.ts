import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// 工具ID映射到数据库tool_id
const TOOL_ID_MAP: Record<string, string> = {
  'novel': 'novel-polish',
  'novel-polish': 'novel-polish',
  'novel-script': 'novel-script',
  'novel-split-panel': 'novel-split-panel',
  'novel-generate-image': 'novel-generate-image',
  'product-compliance': 'product-compliance',
  'product-enhance': 'product-enhance',
  'background-removal': 'background-removal',
  'portrait-enhance': 'portrait-enhance',
  'xhs-generator': 'xhs-generator',
  'resume': 'resume',
};

// 默认免费模型配置（当数据库无配置时使用）
const DEFAULT_CONFIGS: Record<string, { model: string; source: string; isFree: boolean }> = {
  'novel-polish': { model: 'doubao-seed-1-8-251228', source: 'coze', isFree: true },
  'novel-script': { model: 'doubao-seed-1-8-251228', source: 'coze', isFree: true },
  'novel-split-panel': { model: 'doubao-seed-1-8-251228', source: 'coze', isFree: true },
  'novel-generate-image': { model: 'coze-image', source: 'coze', isFree: true },
  'product-compliance': { model: 'doubao-seed-1-6-vision-250815', source: 'coze', isFree: true },
  'product-enhance': { model: 'coze-image', source: 'coze', isFree: true },
  'background-removal': { model: 'coze-image', source: 'coze', isFree: true },
  'portrait-enhance': { model: 'coze-image', source: 'coze', isFree: true },
  'xhs-generator': { model: 'doubao-seed-1-8-251228', source: 'coze', isFree: true },
  'resume': { model: 'doubao-seed-1-8-251228', source: 'coze', isFree: true },
};

// GET - 获取单个工具的模型配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (!toolId) {
      return NextResponse.json({ error: '请提供工具ID' }, { status: 400 });
    }

    const dbToolId = TOOL_ID_MAP[toolId] || toolId;

    // 尝试从数据库获取
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('tool_model_configs')
          .select('*')
          .eq('tool_id', dbToolId)
          .eq('is_active', true)
          .single();

        if (!error && data) {
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
        }
      } catch (e) {
        console.error('Database query failed, using defaults');
      }
    }

    // 使用默认配置
    const defaultConfig = DEFAULT_CONFIGS[dbToolId];
    if (defaultConfig) {
      return NextResponse.json({
        success: true,
        config: {
          tool_id: dbToolId,
          tool_name: dbToolId.replace(/-/g, ' '),
          tool_type: dbToolId.split('-')[0],
          default_model: defaultConfig.model,
          model_source: defaultConfig.source,
          is_free: defaultConfig.isFree,
        },
        isDefault: true,
      });
    }

    return NextResponse.json({ error: '工具配置不存在' }, { status: 404 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
