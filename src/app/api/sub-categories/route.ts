import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sub_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('获取子分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    
    const { verifyToken } = await import('@/lib/auth');
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, parent_id, sort_order } = body;

    if (!name || !slug || !parent_id) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sub_categories')
      .insert({ name, slug, parent_id, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建子分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
