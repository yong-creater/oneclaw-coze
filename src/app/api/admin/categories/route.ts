import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// 获取分类列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.CATEGORIES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { data: categories, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.CATEGORIES_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, slug, sort_order = 0 } = body;

    // 输入安全检查
    if (name && (containsXss(name) || containsSqlInjection(name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }
    if (slug && (containsXss(slug) || containsSqlInjection(slug) || !/^[a-z0-9-]+$/.test(slug))) {
      return NextResponse.json({ success: false, error: 'Slug格式不正确' }, { status: 400 });
    }

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const { data, error } = await client
      .from('categories')
      .insert({ name, slug, sort_order })
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'CREATE', 'CATEGORY', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'CREATE', 'CATEGORY', data.id, name, { slug }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建分类失败:', error);
    await logFailure(auth.user, 'CREATE', 'CATEGORY', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 更新分类
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.CATEGORIES_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id参数' }, { status: 400 });
    }

    // 输入安全检查
    if (body.name && (containsXss(body.name) || containsSqlInjection(body.name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await client
      .from('categories')
      .select('name')
      .eq('id', parseInt(id))
      .single();

    const { data, error } = await client
      .from('categories')
      .update(body)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'UPDATE', 'CATEGORY', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'UPDATE', 'CATEGORY', parseInt(id), oldData?.name || body.name, { changes: Object.keys(body) }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新分类失败:', error);
    await logFailure(auth.user, 'UPDATE', 'CATEGORY', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.CATEGORIES_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id参数' }, { status: 400 });
    }

    // 获取删除前的数据用于日志
    const { data: categoryData } = await client
      .from('categories')
      .select('name')
      .eq('id', parseInt(id))
      .single();

    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      await logFailure(auth.user, 'DELETE', 'CATEGORY', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'DELETE', 'CATEGORY', parseInt(id), categoryData?.name || 'Unknown', {}, request);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    await logFailure(auth.user, 'DELETE', 'CATEGORY', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
