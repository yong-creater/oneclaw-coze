import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';

// 获取模型列表（通过提供商的 API）
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { provider_id, api_url, api_key, provider_type } = body;

    if (!api_url || !api_key) {
      return NextResponse.json({ success: false, error: '缺少 API 配置' }, { status: 400 });
    }

    let models: any[] = [];
    let error = '';

    // 根据提供商类型调用不同的 API
    if (provider_type === 'llm' || provider_type === 'image') {
      // 通用 OpenAI 兼容格式
      try {
        const response = await fetch(`${api_url}/models`, {
          headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10秒超时
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API 返回 ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // 解析 OpenAI 格式的模型列表
        if (data.data && Array.isArray(data.data)) {
          models = data.data.map((model: any) => ({
            id: model.id,
            name: model.id,
            display_name: model.name || model.id,
            description: model.description || '',
            context_length: model.context_window || model.context_length,
            pricing: {
              input: model.pricing?.prompt || model.pricing?.input || 0,
              output: model.pricing?.completion || model.pricing?.output || 0,
            },
            is_available: model.ready ?? model.status !== 'deprecated',
          }));
        }
      } catch (apiError: any) {
        error = apiError.message || 'API 调用失败';
        console.error('[fetch-models] API 调用失败:', apiError);
      }
    }

    // 4SAPI 特殊处理
    if (api_url.includes('4s.ai') || api_url.includes('4sapi')) {
      try {
        // 4SAPI 的模型列表接口
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
              pricing: {
                image: model.price || model.pricing?.image || 0,
              },
              capabilities: model.capabilities || [],
              is_available: model.available !== false,
            }));
          }
        }
      } catch (apiError: any) {
        // 如果特定接口失败，尝试通用接口
        console.log('[fetch-models] 4SAPI 特定接口失败，尝试通用接口');
      }
    }

    // 如果没有获取到模型，返回错误
    if (models.length === 0 && error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      models,
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
