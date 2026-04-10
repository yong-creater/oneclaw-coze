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
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('skills')
      .select(`
        *,
        skill_categories:id (
          id,
          name,
          slug,
          color
        )
      `, { count: 'exact' })
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    if (featured !== null) {
      query = query.eq('is_featured', featured === 'true');
    }

    if (category && category !== 'all') {
      query = query.eq('category_id', parseInt(category));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取技能列表失败:', error);
      return NextResponse.json({ success: false, error: '获取技能列表失败' }, { status: 500 });
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
    console.error('获取技能列表失败:', error);
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
    const {
      name, slug, description, icon, logo, category_id,
      official_url, documentation_url, github_url,
      pricing, difficulty, tags, feature_list,
      is_featured, is_active
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: '技能名称不能为空' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 生成 slug
    const skillSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // 检查 slug 是否已存在
    if (slug) {
      const { data: existing } = await supabase
        .from('skills')
        .select('id')
        .eq('slug', skillSlug)
        .single();

      if (existing) {
        return NextResponse.json({ success: false, error: '该标识已存在' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('skills')
      .insert({
        name,
        slug: skillSlug,
        description,
        icon,
        logo,
        category_id,
        official_url,
        documentation_url,
        github_url,
        pricing: pricing || '免费',
        difficulty: difficulty || '入门',
        tags: tags || [],
        feature_list: feature_list || [],
        is_featured: is_featured || false,
        is_active: is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('创建技能失败:', error);
      return NextResponse.json({ success: false, error: '创建技能失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建技能失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
