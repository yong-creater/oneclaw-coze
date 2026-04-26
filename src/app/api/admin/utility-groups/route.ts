import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// 获取分组列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();

    const { data: groups, error: groupError } = await supabase
      .from('utility_groups')
      .select('*')
      .order('sort_order', { ascending: true });

    if (groupError) {
      return NextResponse.json({ error: '获取分组失败' }, { status: 500 });
    }

    return NextResponse.json({ groups: groups || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建分组
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { name, slug, description, icon, color, sort_order } = body;

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
      .from('utility_groups')
      .insert({ name, slug, description, icon, color, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: '分组slug已存在' }, { status: 400 });
      }
      await logFailure(auth.user, 'CREATE', 'UTILITY_GROUP', error.message, request);
      return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 });
    }

    await logSuccess(auth.user, 'CREATE', 'UTILITY_GROUP', data.id, name, { slug }, request);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'CREATE', 'UTILITY_GROUP', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新分组
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, name, slug, description, icon, color, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    // 输入安全检查
    if (name && (containsXss(name) || containsSqlInjection(name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await supabase
      .from('utility_groups')
      .select('name')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('utility_groups')
      .update({ name, slug, description, icon, color, sort_order, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'UPDATE', 'UTILITY_GROUP', error.message, request);
      return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
    }

    await logSuccess(auth.user, 'UPDATE', 'UTILITY_GROUP', id, oldData?.name || name, { changes: ['name', 'is_active', 'sort_order'] }, request);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'UPDATE', 'UTILITY_GROUP', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 删除分组
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
    const { data: groupData } = await supabase
      .from('utility_groups')
      .select('name')
      .eq('id', parseInt(id))
      .single();

    // 先将该分组的工具移到默认分组
    const { data: defaultGroup } = await supabase
      .from('utility_groups')
      .select('id')
      .eq('slug', 'featured')
      .single();

    if (defaultGroup && parseInt(id) !== defaultGroup.id) {
      await supabase
        .from('utility_tools')
        .update({ group_id: defaultGroup.id })
        .eq('group_id', parseInt(id));
    }

    const { error } = await supabase
      .from('utility_groups')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      await logFailure(auth.user, 'DELETE', 'UTILITY_GROUP', error.message, request);
      return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
    }

    await logSuccess(auth.user, 'DELETE', 'UTILITY_GROUP', parseInt(id), groupData?.name || 'Unknown', {}, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'DELETE', 'UTILITY_GROUP', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 批量更新排序
export async function PATCH(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.UTILITIES_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { groups } = body;

    if (!groups || !Array.isArray(groups)) {
      return NextResponse.json({ success: false, error: '缺少分组数据' }, { status: 400 });
    }

    // 批量更新每个分组的 sort_order
    for (let i = 0; i < groups.length; i++) {
      const { id, sort_order } = groups[i];
      const { error } = await supabase
        .from('utility_groups')
        .update({ sort_order: i, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        await logFailure(auth.user, 'BATCH_UPDATE', 'UTILITY_GROUP', error.message, request);
        return NextResponse.json({ success: false, error: '更新排序失败' }, { status: 500 });
      }
    }

    await logSuccess(auth.user, 'BATCH_UPDATE', 'UTILITY_GROUP', 0, '批量更新排序', { count: groups.length }, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    await logFailure(auth.user, 'BATCH_UPDATE', 'UTILITY_GROUP', 'Unknown error', request);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
