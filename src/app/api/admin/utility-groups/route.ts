import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取分组列表（无需认证）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // 获取分组列表
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

// 创建分组（无需认证 - 分组是公开配置）
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

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

// 更新分组（无需认证 - 分组是公开配置）
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

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

// 删除分组（无需认证 - 分组是公开配置）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

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
