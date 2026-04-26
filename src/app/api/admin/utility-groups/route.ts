import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { createClient } from '@supabase/supabase-js';

// 获取公共数据（无需认证）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const groupSlug = searchParams.get('group');

    // 获取分组列表
    const { data: groups, error: groupError } = await supabase
      .from('utility_groups')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (groupError) {
      return NextResponse.json({ error: '获取分组失败' }, { status: 500 });
    }

    // 获取工具列表
    let query = supabase
      .from('utility_tools')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (groupSlug) {
      query = query.eq('group_id', groupSlug);
    }

    const { data: tools, error: toolError } = await query;

    if (toolError) {
      return NextResponse.json({ error: '获取工具失败' }, { status: 500 });
    }

    // 按分组组织数据
    const groupedTools = groups.map(group => ({
      ...group,
      tools: tools.filter(t => t.group_id === group.id)
    }));

    return NextResponse.json({
      groups: groupedTools,
      tools: tools || []
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建分组（需管理员权限）
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('user_id')
      .eq('token', adminToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json({ error: '会话无效' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, icon, color, sort_order } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('utility_groups')
      .insert({ name, slug, description, icon, color, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '分组slug已存在' }, { status: 400 });
      }
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新分组
export async function PUT(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('user_id')
      .eq('token', adminToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json({ error: '会话无效' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, description, icon, color, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('utility_groups')
      .update({ name, slug, description, icon, color, sort_order, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 删除分组
export async function DELETE(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('user_id')
      .eq('token', adminToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json({ error: '会话无效' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('utility_groups')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
