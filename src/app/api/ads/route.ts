import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取广告列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const now = new Date().toISOString();

    let query = client
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('priority', { ascending: false });

    if (position) {
      query = query.eq('position', position);
    }

    const { data: ads, error } = await query.limit(10);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: ads || [] });
  } catch (error) {
    console.error('获取广告失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 记录广告点击
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id参数' }, { status: 400 });
    }

    const { error } = await client.rpc('increment_ad_clicks', { ad_id: id });

    if (error) {
      // 如果RPC不存在，直接更新
      const { data: ad } = await client
        .from('advertisements')
        .select('clicks')
        .eq('id', id)
        .single();

      if (ad) {
        await client
          .from('advertisements')
          .update({ clicks: (ad.clicks || 0) + 1 })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录点击失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
