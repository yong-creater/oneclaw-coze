import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';

// 添加模型
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { 
      provider_id, 
      name, 
      display_name, 
      description, 
      model_type,
      price_input,
      price_output,
      price_image,
    } = body;

    if (!provider_id || !name) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 构建价格对象
    const pricing: Record<string, number> = {};
    if (price_input !== undefined && price_input !== null && price_input !== '') {
      pricing.input = parseFloat(price_input);
    }
    if (price_output !== undefined && price_output !== null && price_output !== '') {
      pricing.output = parseFloat(price_output);
    }
    if (price_image !== undefined && price_image !== null && price_image !== '') {
      pricing.image = parseFloat(price_image);
    }

    // 插入模型
    const { data, error } = await client
      .from('models')
      .insert({
        provider_id,
        name,
        display_name: display_name || name,
        model_type: model_type || 'llm',
        description: description || '',
        price_per_1k_tokens: JSON.stringify(pricing),
        is_available: true,
        config: JSON.stringify({}),
      })
      .select()
      .single();

    if (error) {
      console.error('[models] 添加模型失败:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, model: data });
  } catch (error: any) {
    console.error('[models] 错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '添加模型失败',
    }, { status: 500 });
  }
}

// 获取模型列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const provider_id = searchParams.get('provider_id');

    let query = client.from('models').select('*');
    if (provider_id) {
      query = query.eq('provider_id', parseInt(provider_id));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, models: data });
  } catch (error: any) {
    console.error('[models] 错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '获取模型列表失败',
    }, { status: 500 });
  }
}

// 删除模型
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少模型 ID' }, { status: 400 });
    }

    // 检查模型是否是系统内置的
    const { data: model } = await client
      .from('models')
      .select('provider_id')
      .eq('id', parseInt(id))
      .single();

    if (!model) {
      return NextResponse.json({ success: false, error: '模型不存在' }, { status: 404 });
    }

    // 获取提供商信息
    const { data: provider } = await client
      .from('model_providers')
      .select('is_system')
      .eq('id', model.provider_id)
      .single();

    if (provider?.is_system) {
      return NextResponse.json({ success: false, error: '内置模型不可删除' }, { status: 403 });
    }

    const { error } = await client
      .from('models')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[models] 错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '删除模型失败',
    }, { status: 500 });
  }
}
