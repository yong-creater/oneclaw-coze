import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';

// GET - 获取所有工具的模型配置
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    
    // 获取所有工具及其模型配置
    const { data: tools, error: toolsError } = await client
      .from('utility_tools')
      .select(`
        id,
        name,
        slug,
        icon,
        description,
        model_provider_id,
        model_name,
        utility_groups(name, slug)
      `)
      .order('name');

    if (toolsError) {
      return NextResponse.json({ error: '获取工具失败' }, { status: 500 });
    }

    // 获取所有提供商和模型
    const { data: providers } = await client
      .from('model_providers')
      .select('*, models(*)')
      .eq('is_active', true)
      .order('is_system', { ascending: false });

    // 转换PostgreSQL numeric类型为普通数字
    const normalizeProviders = (providers: any[]): any[] => {
      return providers?.map(p => ({
        ...p,
        models: p.models?.map((m: any) => ({
          ...m,
          price_per_1k_tokens: m.price_per_1k_tokens != null 
            ? (typeof m.price_per_1k_tokens === 'object' 
                ? parseFloat(m.price_per_1k_tokens.toString()) || 0 
                : Number(m.price_per_1k_tokens) || 0)
            : null,
        })) || [],
      })) || [];
    };

    // 按类型分组
    const providersByType = (normalizeProviders(providers || []) || []).reduce((acc, p) => {
      if (!acc[p.provider_type]) acc[p.provider_type] = [];
      acc[p.provider_type].push(p);
      return acc;
    }, {} as Record<string, any[]>);

    // 组合数据
    const configs = (tools || []).map((tool: any) => ({
      id: tool.id,
      tool_id: tool.slug,
      tool_name: tool.name,
      tool_icon: tool.icon,
      tool_description: tool.description,
      tool_group: tool.utility_groups?.name,
      model_provider_id: tool.model_provider_id,
      model_name: tool.model_name,
      available_providers: providersByType,
    }));

    return NextResponse.json({ 
      success: true,
      data: configs,
      providers: providersByType,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - 更新工具的模型配置
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { tool_id, model_provider_id, model_name } = body;

    if (!tool_id) {
      return NextResponse.json({ error: '缺少工具ID' }, { status: 400 });
    }

    const { data, error } = await client
      .from('utility_tools')
      .update({
        model_provider_id,
        model_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tool_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
