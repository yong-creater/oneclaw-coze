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

    // 获取 tool_model_configs 作为备选数据源
    const { data: modelConfigs } = await client
      .from('tool_model_configs')
      .select('tool_id, model_source, default_model')
      .eq('is_active', true);

    // 创建一个 tool_id -> config 的 Map
    const configMap: Record<string, any> = {};
    (modelConfigs || []).forEach(c => {
      configMap[c.tool_id] = c;
    });

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

    // 创建一个按 slug 和 id 索引的提供商 Map，方便查找
    const providerMapBySlug = (providers || []).reduce((acc, p) => {
      acc[p.slug] = p;
      return acc;
    }, {} as Record<string, any>);
    
    const providerMapById = (providers || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<number, any>);
    
    // 根据模型名称推断提供商
    const inferProviderByModelName = (modelName: string) => {
      if (!modelName) return null;
      // LLM 模型
      if (modelName.includes('doubao-seed') || modelName.includes('doubao-pro') || modelName.includes('doubao-lite')) {
        return providerMapBySlug['coze-llm'] || providerMapById[2];
      }
      // 图片模型 - coze
      if (modelName === 'coze-image') {
        return providerMapBySlug['coze'] || providerMapById[1];
      }
      // 图片模型 - 4sapi
      if (modelName.includes('gpt-image')) {
        return providerMapBySlug['4sapi'] || providerMapById[3];
      }
      return null;
    };

    // 过滤出已配置模型的工具，并只为每个工具返回其对应的提供商
    const toolsWithModels = (tools || []).filter((tool: any) => {
      // 优先从 tool_model_configs 获取配置
      const config = configMap[tool.slug];
      // 检查是否有模型配置
      return tool.model_provider_id || tool.model_name || (config?.model_source && config?.default_model);
    });

    // 组合数据 - 只包含有模型配置的工具，且只返回该工具对应的提供商
    const configs = toolsWithModels.map((tool: any) => {
      // 优先从 tool_model_configs 获取配置
      const config = configMap[tool.slug];
      
      // 确定模型名称
      const modelName = config?.default_model || tool.model_name;
      
      // 确定提供商：优先使用 config.model_source，其次用 providerMapById[tool.model_provider_id]，最后根据模型名推断
      let configuredProvider = config?.model_source ? providerMapBySlug[config.model_source] : null;
      if (!configuredProvider) {
        configuredProvider = tool.model_provider_id ? providerMapById[tool.model_provider_id] : null;
      }
      if (!configuredProvider && modelName) {
        configuredProvider = inferProviderByModelName(modelName);
      }
      
      // 只返回该提供商相关的模型（按类型分组）
      const availableProviders: Record<string, any[]> = {};
      if (configuredProvider) {
        const normalized = normalizeProviders([configuredProvider]);
        for (const p of normalized) {
          if (!availableProviders[p.provider_type]) {
            availableProviders[p.provider_type] = [];
          }
          availableProviders[p.provider_type].push(p);
        }
      }
      
      return {
        id: tool.id,
        tool_id: tool.slug,
        tool_name: tool.name,
        tool_icon: tool.icon,
        tool_description: tool.description,
        tool_group: tool.utility_groups?.name,
        model_provider_id: configuredProvider?.id || tool.model_provider_id,
        model_name: modelName,
        available_providers: availableProviders,
      };
    });

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
