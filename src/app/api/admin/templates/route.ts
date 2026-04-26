import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 获取 Supabase 客户端（在函数内部创建，避免构建时错误）
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
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { name, description, template_type, category, thumbnail, content, params, tags, is_featured, is_active, sort_order } = body;

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
      return NextResponse.json({ error: '创建模板失败: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: '创建模板失败' }, { status: 500 });
  }
}
