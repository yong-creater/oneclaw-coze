import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// 获取 Supabase 客户端
function getSupabase() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// GET - 获取模板列表（管理端，含所有状态）
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.TEMPLATES_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' });

    if (type) {
      query = query.eq('template_type', type);
    }

    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: '获取模板失败: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误: ' + error.message }, { status: 500 });
  }
}

// POST - 创建模板
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.TEMPLATES_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { name, description, template_type, category, thumbnail, content, params, tags, is_featured, is_active, sort_order } = body;

    // 输入安全检查
    if (name && (containsXss(name) || containsSqlInjection(name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }
    if (description && (containsXss(description) || containsSqlInjection(description))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        template_type,
        category,
        thumbnail,
        content: content ? JSON.stringify(content) : null,
        params: params ? JSON.stringify(params) : null,
        tags,
        is_featured: is_featured ?? false,
        is_active: is_active ?? true,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'CREATE', 'TEMPLATE', error.message, request);
      return NextResponse.json({ error: '创建模板失败: ' + error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'CREATE', 'TEMPLATE', data.id, name, { template_type }, request);
    return NextResponse.json({ success: true, template: data });
  } catch (error: any) {
    console.error('Error:', error);
    await logFailure(auth.user, 'CREATE', 'TEMPLATE', error.message, request);
    return NextResponse.json({ error: '创建模板失败' }, { status: 500 });
  }
}

// PUT - 更新模板
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.TEMPLATES_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, name, description, template_type, category, thumbnail, content, params, tags, is_featured, is_active, sort_order } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少模板ID' }, { status: 400 });
    }

    // 输入安全检查
    if (name && (containsXss(name) || containsSqlInjection(name))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const updatableFields = ['name', 'description', 'template_type', 'category', 'thumbnail', 'content', 'params', 'tags', 'is_featured', 'is_active', 'sort_order'];
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await supabase
      .from('templates')
      .select('name')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'UPDATE', 'TEMPLATE', error.message, request);
      return NextResponse.json({ error: '更新模板失败: ' + error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'UPDATE', 'TEMPLATE', id, oldData?.name || name, { changes: Object.keys(updateData) }, request);
    return NextResponse.json({ success: true, template: data });
  } catch (error: any) {
    console.error('Error:', error);
    await logFailure(auth.user, 'UPDATE', 'TEMPLATE', error.message, request);
    return NextResponse.json({ error: '更新模板失败' }, { status: 500 });
  }
}

// DELETE - 删除模板
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.TEMPLATES_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const supabase = getSupabase();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少模板ID' }, { status: 400 });
    }

    // 获取删除前的数据用于日志
    const { data: templateData } = await supabase
      .from('templates')
      .select('name')
      .eq('id', parseInt(id))
      .single();

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      await logFailure(auth.user, 'DELETE', 'TEMPLATE', error.message, request);
      return NextResponse.json({ error: '删除模板失败: ' + error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'DELETE', 'TEMPLATE', parseInt(id), templateData?.name || 'Unknown', {}, request);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    await logFailure(auth.user, 'DELETE', 'TEMPLATE', error.message, request);
    return NextResponse.json({ error: '删除模板失败' }, { status: 500 });
  }
}
