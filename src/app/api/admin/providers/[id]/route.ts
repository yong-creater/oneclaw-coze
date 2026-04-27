import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const { data, error } = await client
      .from('model_providers')
      .select('*, models(*)')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const { name, api_url, api_key, is_active, extra_config } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (api_url !== undefined) updateData.api_url = api_url;
    if (api_key !== undefined) updateData.api_key = api_key;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (extra_config !== undefined) updateData.extra_config = extra_config;

    const { data, error } = await client
      .from('model_providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // 检查是否是系统预置
    const { data: provider } = await client
      .from('model_providers')
      .select('is_system')
      .eq('id', id)
      .single();

    if (provider?.is_system) {
      return NextResponse.json(
        { error: '系统预置的提供商不能删除' },
        { status: 403 }
      );
    }

    // 检查是否有工具在使用
    const { data: tools } = await client
      .from('utility_tools')
      .select('id, name')
      .eq('model_provider_id', id);

    if (tools && tools.length > 0) {
      return NextResponse.json(
        { error: `有 ${tools.length} 个工具正在使用此提供商，请先修改工具配置` },
        { status: 400 }
      );
    }

    const { error } = await client
      .from('model_providers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
