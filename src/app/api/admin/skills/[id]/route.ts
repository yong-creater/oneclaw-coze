import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        skill_categories:id (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('id', parseInt(id))
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: '技能不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取技能失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name, slug, description, icon, logo, category_id,
      official_url, documentation_url, github_url,
      pricing, difficulty, tags, feature_list,
      is_featured, is_active
    } = body;

    const supabase = getSupabaseClient();

    // 检查 slug 是否被其他技能使用
    if (slug) {
      const { data: existing } = await supabase
        .from('skills')
        .select('id')
        .eq('slug', slug)
        .neq('id', parseInt(id))
        .single();

      if (existing) {
        return NextResponse.json({ success: false, error: '该标识已被其他技能使用' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (logo !== undefined) updateData.logo = logo;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (official_url !== undefined) updateData.official_url = official_url;
    if (documentation_url !== undefined) updateData.documentation_url = documentation_url;
    if (github_url !== undefined) updateData.github_url = github_url;
    if (pricing !== undefined) updateData.pricing = pricing;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (tags !== undefined) updateData.tags = tags;
    if (feature_list !== undefined) updateData.feature_list = feature_list;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新技能失败:', error);
      return NextResponse.json({ success: false, error: '更新技能失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新技能失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除技能失败:', error);
      return NextResponse.json({ success: false, error: '删除技能失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除技能失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
