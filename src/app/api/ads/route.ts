import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取广告列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    // 检查表是否存在
    try {
      const now = new Date().toISOString();

      let query = client
        .from('advertisements')
        .select('id, title, description, image_url, link_url, position, priority, clicks, impressions, starts_at, ends_at, is_active, is_highlight, target_category')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('priority', { ascending: false });

      if (position) {
        query = query.eq('position', position);
      }

      const { data: ads, error } = await query.limit(10);

      if (error) {
        // 如果表不存在，返回空数据
        if (error.message.includes('Could not find')) {
          return NextResponse.json({ success: true, data: [] });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: ads || [] });
    } catch (tableError) {
      // 表不存在时返回空数据
      return NextResponse.json({ success: true, data: [] });
    }
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

    // 直接更新点击数
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录点击失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
