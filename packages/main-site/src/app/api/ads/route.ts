import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取广告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const now = new Date().toISOString();
    let data: any[] = [];

    if (isVolcenginePgMode()) {
      try {
        const { getPgPool } = await import('@/lib/db');
        const pool = await getPgPool();

        let sql = `
          SELECT id, title, description, image_url, link_url, position, priority, 
                 clicks, impressions, starts_at, ends_at, is_active, is_highlight, target_category
          FROM advertisements
          WHERE is_active = true AND starts_at <= $1 AND ends_at >= $2
        `;
        const params: any[] = [now, now];

        if (position) {
          sql += ` AND position = $3`;
          params.push(position);
        }

        sql += ` ORDER BY priority DESC LIMIT 10`;

        const result = await pool.query(sql, params);
        data = result.rows;
      } catch {
        return NextResponse.json({ success: true, data: [] });
      }
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      try {
        const result = await query('advertisements', {
          select: 'id, title, description, image_url, link_url, position, priority, clicks, impressions, starts_at, ends_at, is_active, is_highlight, target_category',
          eq: { is_active: true },
          order: { column: 'priority', ascending: false },
          limit: 10,
        });
        data = result.data || [];
      } catch {
        return NextResponse.json({ success: true, data: [] });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取广告失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
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

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      if (action === 'click') {
        await pool.query(`UPDATE advertisements SET clicks = clicks + 1 WHERE id = $1`, [ad_id]);
      } else if (action === 'impression') {
        await pool.query(`UPDATE advertisements SET impressions = impressions + 1 WHERE id = $1`, [ad_id]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录广告操作失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
