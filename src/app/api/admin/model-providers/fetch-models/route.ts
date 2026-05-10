import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { buildApiBaseUrl } from '@/lib/model-selector';

// 常见图片生成模型列表（当 API 不支持列举图片模型时作为建议）
const KNOWN_IMAGE_MODELS = [
  { id: 'gpt-image-2', name: 'GPT Image 2', display_name: 'GPT Image 2', description: 'OpenAI 最新图片生成模型' },
  { id: 'dall-e-3', name: 'DALL·E 3', display_name: 'DALL·E 3', description: 'OpenAI 图片生成模型' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', display_name: 'SDXL', description: 'Stability AI 图片生成模型' },
  { id: 'flux-1', name: 'Flux 1', display_name: 'Flux 1', description: 'Black Forest Labs 图片生成模型' },
];

// 构建模型列表端点（基于 buildApiBaseUrl 统一处理 /v1 前缀）
function buildEndpoints(apiUrl: string, _providerType: string): Array<{ url: string; desc: string }> {
  const fullApiUrl = buildApiBaseUrl(apiUrl);
  return [
    { url: `${fullApiUrl}/models`, desc: 'OpenAI v1 格式' },
  ];
}

// 获取模型列表（通过提供商的 API）并保存到数据库
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { provider_id, api_url, api_key, provider_type } = body;

    if (!provider_id || !api_url) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 获取真实 API Key：优先使用前端传入的，否则从数据库读取
    let realApiKey = api_key;
    if (!realApiKey || realApiKey.includes('...')) {
      const { data: provider } = await client
        .from('model_providers')
        .select('api_key')
        .eq('id', provider_id)
        .single();
      realApiKey = provider?.api_key;
    }
    if (!realApiKey) {
      return NextResponse.json({ success: false, error: '未配置 API Key，请先在提供商设置中填写' }, { status: 400 });
    }

    let models: any[] = [];
    let lastError = '';
    const endpoints = buildEndpoints(api_url, provider_type);

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${realApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();

          // 解析不同格式的响应
          // 格式1: OpenAI 格式 { "data": [...] }
          if (data.data && Array.isArray(data.data)) {
            models = data.data.map((model: any) => ({
              id: model.id,
              name: model.id,
              display_name: model.name || model.id,
              description: model.description || '',
              context_length: model.context_window || model.context_length,
              pricing: model.pricing || {},
              is_available: model.ready ?? model.status !== 'deprecated',
            }));
            break;
          }

          // 格式2: 4SAPI 格式 { "models": [...] }
          if (data.models && Array.isArray(data.models)) {
            models = data.models.map((model: any) => ({
              id: model.id || model.model_id,
              name: model.id || model.model_id,
              display_name: model.name || model.model_name || model.id,
              description: model.description || '',
              pricing: { image: model.price || 0 },
              is_available: model.available !== false,
            }));
            break;
          }

          // 格式3: 直接数组
          if (Array.isArray(data)) {
            models = data.map((model: any) => ({
              id: model.id || model,
              name: model.id || model,
              display_name: model.name || model.id || model,
              description: model.description || '',
              pricing: model.pricing || {},
              is_available: model.available !== false,
            }));
            break;
          }

          // 格式4: { "object": "list", "data": [...] }
          if (data.object === 'list' && data.data) {
            models = data.data.map((model: any) => ({
              id: model.id,
              name: model.id,
              display_name: model.id,
              description: '',
              pricing: {},
              is_available: true,
            }));
            break;
          }
        } else {
          lastError = `API 返回 ${response.status}`;
          try {
            const errorText = await response.text();
            lastError += `: ${errorText.substring(0, 100)}`;
          } catch {
            // 忽略
          }
        }
      } catch (e: any) {
        lastError = e.message || '请求失败';
      }
    }

    // 对于图片模型提供商，如果获取到了模型列表，尝试筛选图片相关模型
    if (models.length > 0 && provider_type === 'image') {
      const imageKeywords = ['image', 'dall', 'flux', 'stable', 'diffusion', 'sd', 'midjourney', 'gpt-image', 'imagen'];
      const imageModels = models.filter((m: any) =>
        imageKeywords.some(kw => m.id.toLowerCase().includes(kw) || (m.display_name || '').toLowerCase().includes(kw))
      );

      // 如果筛选出了图片模型，使用筛选结果；否则保留全部（可能 API 只返回了图片模型）
      if (imageModels.length > 0) {
        models = imageModels;
      }
    }

    // 如果没有获取到模型
    if (models.length === 0) {
      // 对于图片模型提供商，提供已知模型建议
      if (provider_type === 'image') {
        return NextResponse.json({
          success: false,
          error: `无法自动获取图片模型列表（该 API 不支持模型列举）。${lastError ? '最后错误: ' + lastError + '。' : ''}请手动添加模型，常见图片模型: ${KNOWN_IMAGE_MODELS.map(m => m.id).join(', ')}`,
          suggested_models: KNOWN_IMAGE_MODELS,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: `无法获取模型列表。${lastError}。请检查 API URL 和 Key 是否正确，或手动添加模型。`
      }, { status: 400 });
    }

    // ========== 保存到数据库 ==========
    // 1. 先删除该提供商下的所有旧模型
    await client
      .from('models')
      .delete()
      .eq('provider_id', provider_id);

    // 2. 批量插入新模型
    const modelsToInsert = models.map(m => {
      // price_per_1k_tokens 是 numeric 类型，需要提取数值或设为 null
      let pricePerToken: number | null = null;
      if (m.pricing) {
        if (typeof m.pricing === 'number') {
          pricePerToken = m.pricing;
        } else if (typeof m.pricing === 'object') {
          // 尝试从 pricing 对象中提取数值
          const keys = Object.keys(m.pricing);
          if (keys.length > 0) {
            const firstVal = m.pricing[keys[0]];
            if (typeof firstVal === 'number') {
              pricePerToken = firstVal;
            }
          }
        }
      }

      return {
        provider_id,
        name: m.name,
        display_name: m.display_name,
        model_type: provider_type,
        description: m.description || '',
        price_per_1k_tokens: pricePerToken,
        is_available: m.is_available !== false,
        config: {},
      };
    });

    const { error: insertError } = await client
      .from('models')
      .insert(modelsToInsert);

    if (insertError) {
      console.error('[fetch-models] 保存模型失败:', insertError);
      return NextResponse.json({
        success: false,
        error: '保存模型失败: ' + insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      models,
      count: models.length,
      provider_type,
    });
  } catch (error: any) {
    console.error('[fetch-models] 错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '获取模型列表失败',
    }, { status: 500 });
  }
}
