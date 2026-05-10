import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  
  // 获取所有模型提供商
  const { data: providers, error } = await supabase
    .from('model_providers')
    .select('*')
    .order('provider_type');

  if (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }

  // 脱敏处理：隐藏 API Key 的中间部分
  const sanitized = (providers || []).map(p => ({
    ...p,
    api_key: p.api_key ? `${p.api_key.slice(0, 8)}...${p.api_key.slice(-4)}` : null,
    has_api_key: !!p.api_key,
  }));

  return NextResponse.json({ success: true, data: sanitized });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, api_url, api_key, provider_type, is_active, is_system } = body;

  if (!name || !slug || !provider_type) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('model_providers')
    .insert({
      name,
      slug,
      api_url: api_url || null,
      api_key: api_key || null,
      provider_type,
      is_active: is_active !== false,
      is_system: is_system === true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, slug, api_url, api_key, provider_type, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: '缺少ID' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  
  // 如果传入了新的 api_key 才更新
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (api_url !== undefined) updateData.api_url = api_url || null;
  if (provider_type !== undefined) updateData.provider_type = provider_type;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (api_key !== undefined) updateData.api_key = api_key || null; // 空字符串清除

  const { data, error } = await supabase
    .from('model_providers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少ID' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  
  // 检查是否为系统内置provider，不允许删除
  const { data: provider } = await supabase
    .from('model_providers')
    .select('is_system')
    .eq('id', id)
    .single();

  if (provider?.is_system) {
    return NextResponse.json({ error: '系统内置provider不允许删除' }, { status: 403 });
  }

  const { error } = await supabase
    .from('model_providers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
