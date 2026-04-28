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
    let lastError = '';

    // 尝试多种 API 端点格式
    const endpoints = [
      { url: `${api_url}/models`, desc: 'OpenAI 兼容格式' },
      { url: `${api_url}/v1/models`, desc: 'OpenAI v1 格式' },
      { url: `${api_url}/images/models`, desc: '4SAPI 图片模型' },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[fetch-models] 尝试端点: ${endpoint.url}`);
        
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        console.log(`[fetch-models] ${endpoint.url} 返回: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`[fetch-models] 数据格式:`, JSON.stringify(data).substring(0, 500));

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
            console.log(`[fetch-models] 解析到 ${models.length} 个模型 (OpenAI格式)`);
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
            console.log(`[fetch-models] 解析到 ${models.length} 个模型 (4SAPI格式)`);
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
            console.log(`[fetch-models] 解析到 ${models.length} 个模型 (数组格式)`);
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
            console.log(`[fetch-models] 解析到 ${models.length} 个模型 (list格式)`);
            break;
          }
        } else {
          lastError = `API 返回 ${response.status}`;
          // 读取错误信息
          try {
            const errorText = await response.text();
            console.log(`[fetch-models] 错误响应: ${errorText.substring(0, 200)}`);
            lastError += `: ${errorText.substring(0, 100)}`;
          } catch (e) {
            // 忽略
          }
        }
      } catch (e: any) {
        lastError = e.message || '请求失败';
        console.log(`[fetch-models] 端点 ${endpoint.url} 请求失败:`, e.message);
      }
    }

    // 如果没有获取到模型
    if (models.length === 0) {
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
    const modelsToInsert = models.map(m => ({
      provider_id,
      name: m.name,
      display_name: m.display_name,
      model_type: provider_type,
      description: m.description || '',
      price_per_1k_tokens: JSON.stringify(m.pricing || {}),
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
