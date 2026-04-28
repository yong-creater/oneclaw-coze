import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';

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

    if (!provider_id || !api_url || !api_key) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    let models: any[] = [];
    let error = '';

    // 根据提供商类型调用不同的 API
    if (provider_type === 'llm' || provider_type === 'image') {
      try {
        // 尝试 OpenAI 兼容格式
        const response = await fetch(`${api_url}/models`, {
          headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();
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
          }
        } else {
          throw new Error(`API 返回 ${response.status}`);
        }
      } catch (apiError: any) {
        error = apiError.message || 'API 调用失败';
      }
    }

    // 4SAPI 特殊处理
    if (api_url.includes('4s.ai') || api_url.includes('4sapi')) {
      try {
        const response = await fetch(`${api_url}/images/models`, {
          headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.models) {
            models = data.models.map((model: any) => ({
              id: model.id || model.model_id,
              name: model.id || model.model_id,
              display_name: model.name || model.model_name || model.id,
              description: model.description || '',
              pricing: { image: model.price || 0 },
              is_available: model.available !== false,
            }));
          }
        }
      } catch (e) {
        console.log('[fetch-models] 4SAPI 特定接口失败');
      }
    }

    // 如果没有获取到模型
    if (models.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: error || '无法获取模型列表，请检查 API 配置' 
      }, { status: 400 });
    }

    // ========== 保存到数据库 ==========
    // 1. 先删除该提供商下的所有旧模型
    await client
      .from('models')
      .delete()
      .eq('provider_id', provider_id);

    // 2. 批量插入新模型
    const modelsToInsert = models.map(m => ({
      provider_id,
      name: m.name,
      display_name: m.display_name,
      model_type: provider_type,
      description: m.description || '',
      price_per_1k_tokens: JSON.stringify({
        input: m.pricing?.input || 0,
        output: m.pricing?.output || 0,
        image: m.pricing?.image || 0,
      }),
      is_available: m.is_available !== false,
      config: JSON.stringify({}),
    }));

    const { error: insertError } = await client
      .from('models')
      .insert(modelsToInsert);

    if (insertError) {
      console.error('[fetch-models] 保存模型失败:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: '保存模型失败' 
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
