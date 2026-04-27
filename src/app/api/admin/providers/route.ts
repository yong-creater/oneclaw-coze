import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data: providers, error } = await client
      .from('model_providers')
      .select('*, models(*)')
      .order('is_system', { ascending: false })
      .order('created_at');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: providers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, slug, api_url, api_key, provider_type, extra_config } = body;

    if (!name || !slug || !provider_type) {
      return NextResponse.json(
        { error: '缺少必填字段：name, slug, provider_type' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('model_providers')
      .insert({
        name,
        slug,
        api_url,
        api_key,
        provider_type,
        extra_config: extra_config || {},
      })
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
