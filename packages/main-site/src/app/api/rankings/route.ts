import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取各类榜单
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot';
    const scene = searchParams.get('scene');
    const limit = parseInt(searchParams.get('limit') || '10');

    let tools: any[] = [];

    if (isVolcenginePgMode()) {
      // 火山引擎 PostgreSQL 模式
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      switch (type) {
        case 'hot':
          const hotResult = await pool.query(`
            SELECT t.id, t.name, t.logo, t.producer, t.highlight, t.free_type, 
                   t.feature_tags, t.official_url, t.promotion_url, t.view_count, 
                   t.click_count, t.launch_date, c.name as "categoryName", c.slug as "categorySlug"
            FROM tools t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.is_active = true
            ORDER BY t.click_count DESC
            LIMIT $1
          `, [limit]);
          tools = hotResult.rows || [];
          break;

        case 'free':
          const freeResult = await pool.query(`
            SELECT t.id, t.name, t.logo, t.producer, t.highlight, t.free_type, 
                   t.feature_tags, t.official_url, t.promotion_url, t.view_count, 
                   t.click_count, t.launch_date, c.name as "categoryName", c.slug as "categorySlug"
            FROM tools t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.is_active = true AND t.free_type IN ('完全免费', '免费额度')
            ORDER BY t.click_count DESC
            LIMIT $1
          `, [limit]);
          tools = freeResult.rows || [];
          break;

        case 'new':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const newResult = await pool.query(`
            SELECT t.id, t.name, t.logo, t.producer, t.highlight, t.free_type, 
                   t.feature_tags, t.official_url, t.promotion_url, t.view_count, 
                   t.click_count, t.launch_date, c.name as "categoryName", c.slug as "categorySlug"
            FROM tools t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.is_active = true AND t.launch_date >= $1
            ORDER BY t.launch_date DESC
            LIMIT $2
          `, [thirtyDaysAgo.toISOString(), limit]);
          tools = newResult.rows || [];
          break;

        case 'scene':
          if (scene) {
            const sceneResult = await pool.query(`
              SELECT t.id, t.name, t.logo, t.producer, t.highlight, t.free_type, 
                     t.feature_tags, t.official_url, t.promotion_url, t.view_count, 
                     t.click_count, c.name as "categoryName", c.slug as "categorySlug"
              FROM tools t
              LEFT JOIN categories c ON t.category_id = c.id
              WHERE t.is_active = true AND (t.feature_tags @> $1 OR t.highlight ILIKE $2)
              ORDER BY t.click_count DESC
              LIMIT $3
            `, [`[${scene}]`, `%${scene}%`, limit]);
            tools = sceneResult.rows || [];
          } else {
            tools = [];
          }
          break;

        default:
          tools = [];
      }
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      let eq: any = { is_active: true };
      if (type === 'free') {
        eq['free_type'] = ['完全免费', '免费额度'];
      }
      const result = await query('tools', {
        select: 'id, name, logo, producer, highlight, free_type, feature_tags, official_url, promotion_url, view_count, click_count, launch_date, categories(name, slug)',
        eq,
        order: { column: 'click_count', ascending: false },
        limit,
      });
      tools = result.data || [];
    }

    // 批量获取评分统计
    const toolIds = tools.map(t => t.id);
    let ratingsMap: Record<number, { count: number; avg: number }> = {};
    
    if (toolIds.length > 0) {
      if (isVolcenginePgMode()) {
        const { getPgPool } = await import('@/lib/db');
        const pool = await getPgPool();
        
        const ratingsResult = await pool.query(`
          SELECT tool_id, 
                 AVG((effect_score + usability_score + quota_score + stability_score) / 4.0) as avg_score,
                 COUNT(*) as count
          FROM user_ratings
          WHERE tool_id = ANY($1)
          GROUP BY tool_id
        `, [toolIds]);
        
        for (const row of ratingsResult.rows) {
          ratingsMap[row.tool_id] = {
            count: parseInt(row.count),
            avg: Math.round(parseFloat(row.avg_score) * 10) / 10
          };
        }
      } else {
        const { query } = await import('@/lib/db');
        const { data: allRatings } = await query('user_ratings', {
          select: 'tool_id, effect_score, usability_score, quota_score, stability_score',
        });
        
        if (allRatings) {
          const grouped = allRatings.reduce((acc: any, r: any) => {
            if (!acc[r.tool_id]) {
              acc[r.tool_id] = { total: 0, count: 0 };
            }
            const avg = (r.effect_score + r.usability_score + r.quota_score + r.stability_score) / 4;
            acc[r.tool_id].total += avg;
            acc[r.tool_id].count += 1;
            return acc;
          }, {});

          ratingsMap = Object.fromEntries(
            Object.entries(grouped).map(([id, data]: [string, any]) => [
              Number(id),
              { count: data.count, avg: Math.round((data.total / data.count) * 10) / 10 }
            ])
          );
        }
      }
    }

    // 合并评分数据
    const toolsWithRatings = tools.map(tool => ({
      ...tool,
      rating_count: ratingsMap[tool.id]?.count || 0,
      avg_rating: ratingsMap[tool.id]?.avg || 0
    }));

    return NextResponse.json({
      success: true,
      data: toolsWithRatings,
      meta: { type, scene, limit }
    }, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
  } catch (error) {
    console.error('获取榜单失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
