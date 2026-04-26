import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - 获取模板列表（管理端，含所有状态）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' });

    if (type) {
      query = query.eq('template_type', type);
    }

    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: '获取模板失败' }, { status: 500 });
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
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST - 创建模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      template_type,
      category,
      thumbnail,
      content,
      params,
      tags,
      is_featured,
      sort_order,
    } = body;

    if (!name || !template_type) {
      return NextResponse.json({ error: '名称和类型不能为空' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        template_type,
        category,
        thumbnail,
        content,
        params,
        tags: tags || [],
        is_featured: is_featured || false,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
