import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getTokenFromHeader } from '@/lib/auth';
import { validateSession } from '@/lib/auth';

// 获取技能列表（后台管理用，显示所有技能包括未激活的）
export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const token = getTokenFromHeader(request.headers.get('authorization')) || 
                  request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: '请先登录' 
      }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: '会话已过期' 
      }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('skills')
      .select(`
        *,
        skill_categories (
          id,
          name,
          slug,
          color
        )
      `, { count: 'exact' })
      .order('is_featured', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category_id', parseInt(category));
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取技能列表失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: '获取技能列表失败' 
      }, { status: 500 });
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
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

// 创建技能
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization')) || 
                  request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: '请先登录' 
      }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: '会话已过期' 
      }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        logo: body.logo,
        category_id: body.category_id,
        official_url: body.official_url,
        documentation_url: body.documentation_url,
        github_url: body.github_url,
        pricing: body.pricing || '免费',
        difficulty: body.difficulty || '入门',
        tags: body.tags || [],
        feature_list: body.feature_list || [],
        is_featured: body.is_featured || false,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('创建技能失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建技能失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}
