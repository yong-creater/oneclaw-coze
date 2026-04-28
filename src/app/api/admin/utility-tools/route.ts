import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// 获取工具列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const toolSlug = searchParams.get('slug');
    const includeAll = searchParams.get('include_all');

    let query = supabase
      .from('utility_tools')
      .select('*, utility_groups(name, slug, icon, color), model_config')
      .order('sort_order', { ascending: true });

    if (!includeAll) {
      query = query.eq('is_active', true);
    }

    if (groupId) {
      query = query.eq('group_id', parseInt(groupId));
    }

    if (toolSlug) {
      query = query.eq('slug', toolSlug);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: '获取工具失败' }, { status: 500 });
    }

    return NextResponse.json({ tools: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建工具
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { group_id, name, slug, icon, description, cover_image, color, sort_order, use_cases, model_config, model_provider_id, model_name } = body;

    // 输入安全检查
    if (name && (containsXss(name) || containsSqlInjection(name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }
    if (slug && (containsXss(slug) || containsSqlInjection(slug) || !/^[a-z0-9-]+$/.test(slug))) {
      return NextResponse.json({ success: false, error: 'Slug格式不正确' }, { status: 400 });
    }

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('utility_tools')
      .insert({
        group_id,
        name,
        slug,
        icon,
        description,
        cover_image,
        color: color || 'from-orange-500 to-amber-500',
        sort_order: sort_order || 0,
        use_cases: use_cases || [],
        model_config: model_config || {
          default_model: 'ep-20250312145957-p8xpp',
          model_source: 'coze',
          model_price_per_1k_tokens: 0,
          is_free: true,
          is_active: true,
        },
        model_provider_id: model_provider_id || 1,  // 默认使用扣子
        model_name: model_name || 'coze-image',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: '工具slug已存在' }, { status: 400 });
      }
      await logFailure(auth.user, 'CREATE', 'UTILITY_TOOL', error.message, request);
      return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 });
    }

    // 同步创建 tool_model_configs 表记录（工具与模型的关联）
    if (data && model_provider_id && model_name) {
      const { data: provider } = await supabase
        .from('model_providers')
        .select('slug, provider_type')
        .eq('id', model_provider_id)
        .single();
      
      if (provider) {
        await supabase
          .from('tool_model_configs')
          .insert({
            tool_slug: slug,
            model_source: provider.slug,
            default_model: model_name,
            model_type: provider.provider_type,
            is_active: true
          });
      }
    }

    await logSuccess(auth.user, 'CREATE', 'UTILITY_TOOL', data.id, name, { slug }, request);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'CREATE', 'UTILITY_TOOL', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新工具
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, group_id, name, slug, icon, description, cover_image, color, sort_order, use_cases, is_active, model_config, model_provider_id, model_name } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    // 输入安全检查
    if (name && (containsXss(name) || containsSqlInjection(name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await supabase
      .from('utility_tools')
      .select('name')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('utility_tools')
      .update({
        group_id,
        name,
        slug,
        icon,
        description,
        cover_image,
        color,
        sort_order,
        use_cases,
        is_active,
        model_config,
        model_provider_id,
        model_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'UPDATE', 'UTILITY_TOOL', error.message, request);
      return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
    }

    // 同步更新 tool_model_configs 表（工具与模型的关联）
    if (model_provider_id && model_name) {
      // 获取提供商信息以推断 model_source
      const { data: provider } = await supabase
        .from('model_providers')
        .select('slug, provider_type')
        .eq('id', model_provider_id)
        .single();
      
      if (provider) {
        // 检查是否已存在配置
        const { data: existingConfig } = await supabase
          .from('tool_model_configs')
          .select('id')
          .eq('tool_slug', slug)
          .single();
        
        if (existingConfig) {
          // 更新现有配置
          await supabase
            .from('tool_model_configs')
            .update({
              model_source: provider.slug,
              default_model: model_name,
              model_type: provider.provider_type,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('tool_slug', slug);
        } else {
          // 创建新配置
          await supabase
            .from('tool_model_configs')
            .insert({
              tool_slug: slug,
              model_source: provider.slug,
              default_model: model_name,
              model_type: provider.provider_type,
              is_active: true
            });
        }
      }
    } else if (!model_provider_id || !model_name) {
      // 如果清空了模型配置，也删除 tool_model_configs 中的记录
      await supabase
        .from('tool_model_configs')
        .delete()
        .eq('tool_slug', slug);
    }

    await logSuccess(auth.user, 'UPDATE', 'UTILITY_TOOL', id, oldData?.name || name, { changes: ['name', 'is_active', 'sort_order'] }, request);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'UPDATE', 'UTILITY_TOOL', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 删除工具
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    // 获取删除前的数据用于日志
    const { data: toolData } = await supabase
      .from('utility_tools')
      .select('name')
      .eq('id', parseInt(id))
      .single();

    const { error } = await supabase
      .from('utility_tools')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      await logFailure(auth.user, 'DELETE', 'UTILITY_TOOL', error.message, request);
      return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
    }

    await logSuccess(auth.user, 'DELETE', 'UTILITY_TOOL', parseInt(id), toolData?.name || 'Unknown', {}, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'DELETE', 'UTILITY_TOOL', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
