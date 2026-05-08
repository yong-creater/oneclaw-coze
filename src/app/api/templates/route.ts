import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 禁用缓存，后台修改后前台立即生效
export const revalidate = 0;

function getSupabase() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// GET - 前台获取模板列表（公开接口，无需认证）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get('type');
    const category = searchParams.get('category');

    let query = supabase
      .from('templates')
      .select('id, name, description, template_type, category, thumbnail, tags, usage_count, is_featured, is_active')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true });

    if (templateType) {
      query = query.eq('template_type', templateType);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Templates fetch error:', error);
      return NextResponse.json({ success: false, error: '获取模板失败' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true, templates: data || [] });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json({ success: false, templates: [] }, { status: 200 });
  }
}
