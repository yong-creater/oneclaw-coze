import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取广告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const now = new Date().toISOString();

    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('advertisements')
      .select('id, title, description, image_url, link_url, position, priority, clicks, impressions, starts_at, ends_at, is_active, is_highlight, target_category')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('priority', { ascending: false })
      .limit(10);
    
    if (position) {
      query = query.eq('position', position);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('获取广告失败:', error);
      return NextResponse.json({ success: true, data: [] });
    }
    
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('获取广告失败:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

// 记录广告点击
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad_id, action } = body;

    if (!ad_id) {
      return NextResponse.json({ success: false, error: '缺少广告ID' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    if (action === 'click') {
      await supabase.rpc('increment_clicks', { ad_id }).then(() => {}, () => {});
    } else if (action === 'impression') {
      await supabase.rpc('increment_impressions', { ad_id }).then(() => {}, () => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录广告数据失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
