import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取工具列表（无需认证）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const toolSlug = searchParams.get('slug');
    const includeAll = searchParams.get('include_all'); // 包含所有工具（包括未激活的）

    let query = supabase
      .from('utility_tools')
      .select('*, utility_groups(name, slug, icon, color)')
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

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建工具（需管理员权限）
export async function POST(request: NextRequest) {
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
    const { group_id, name, slug, icon, description, cover_image, color, sort_order, use_cases } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
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
        use_cases: use_cases || []
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '工具slug已存在' }, { status: 400 });
      }
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新工具
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
    const { id, group_id, name, slug, icon, description, cover_image, color, sort_order, use_cases, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

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
        updated_at: new Date().toISOString()
      })
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

// 删除工具
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
      .from('utility_tools')
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
