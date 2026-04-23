import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const active = searchParams.get('active');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('skill_categories')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取技能分类失败:', error);
      return NextResponse.json({ success: false, error: '获取分类失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取技能分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, icon, color, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: '名称和标识不能为空' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 检查 slug 是否已存在
    const { data: existing } = await supabase
      .from('skill_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: '该标识已存在' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('skill_categories')
      .insert({
        name,
        slug,
        description,
        icon,
        color,
        sort_order: sort_order || 0,
        is_active: is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('创建技能分类失败:', error);
      return NextResponse.json({ success: false, error: '创建分类失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建技能分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
