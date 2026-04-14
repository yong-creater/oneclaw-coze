import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取数据看板统计
export async function GET(request: NextRequest) {
  try {
    let stats = {
      total_tools: 0,
      total_views: 0,
      total_clicks: 0,
      total_ratings: 0,
      total_reviews: 0,
      total_favorites: 0,
      categories: [] as { name: string; count: number }[],
      top_tools: [] as { name: string; click_count: number }[],
      free_type_distribution: [] as { name: string; count: number }[],
      recent_activity: [] as { date: string; count: number }[]
    };

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      // 获取工具总数和统计
      const toolsResult = await pool.query(`
        SELECT 
          COUNT(*) as total_tools,
          COALESCE(SUM(view_count), 0) as total_views,
          COALESCE(SUM(click_count), 0) as total_clicks,
          free_type,
          DATE(created_at) as created_date
        FROM tools 
        WHERE is_active = true
        GROUP BY free_type, DATE(created_at)
      `);

      // 汇总统计
      let totalTools = 0;
      let totalViews = 0;
      let totalClicks = 0;
      const freeTypeCount: Record<string, number> = {};
      const recentActivity: Record<string, number> = {};

      for (const row of toolsResult.rows) {
        totalTools += parseInt(row.total_tools);
        totalViews += parseInt(row.total_views);
        totalClicks += parseInt(row.total_clicks);
        freeTypeCount[row.free_type] = (freeTypeCount[row.free_type] || 0) + parseInt(row.total_tools);
        const dateStr = row.created_date;
        recentActivity[dateStr] = (recentActivity[dateStr] || 0) + parseInt(row.total_tools);
      }

      stats.total_tools = totalTools;
      stats.total_views = totalViews;
      stats.total_clicks = totalClicks;

      // 分类分布
      const categoryResult = await pool.query(`
        SELECT c.name, COUNT(t.id) as count
        FROM categories c
        LEFT JOIN tools t ON t.category_id = c.id AND t.is_active = true
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `);
      stats.categories = categoryResult.rows.map(r => ({ name: r.name, count: parseInt(r.count) }));

      // 热门工具
      const topToolsResult = await pool.query(`
        SELECT name, click_count
        FROM tools
        WHERE is_active = true
        ORDER BY click_count DESC
        LIMIT 5
      `);
      stats.top_tools = topToolsResult.rows.map(r => ({ name: r.name, click_count: parseInt(r.click_count) }));

      // 免费类型分布
      stats.free_type_distribution = Object.entries(freeTypeCount).map(([name, count]) => ({ name, count }));

      // 最近7天活动
      const last7Days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push({ date: dateStr, count: recentActivity[dateStr] || 0 });
      }
      stats.recent_activity = last7Days;

      // 评分数
      const ratingsResult = await pool.query(`SELECT COUNT(*) as count FROM user_ratings`);
      stats.total_ratings = parseInt(ratingsResult.rows[0]?.count || '0');

      // 评论数
      const reviewsResult = await pool.query(`SELECT COUNT(*) as count FROM user_reviews`);
      stats.total_reviews = parseInt(reviewsResult.rows[0]?.count || '0');

      // 收藏数
      const favoritesResult = await pool.query(`SELECT COUNT(*) as count FROM user_favorites`);
      stats.total_favorites = parseInt(favoritesResult.rows[0]?.count || '0');
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      
      try {
        const result = await query('tools', {
          select: 'view_count, click_count, free_type, categories(name)',
          eq: { is_active: true },
          count: true,
        });
        
        if (result.data) {
          stats.total_tools = result.count || 0;
          for (const t of result.data) {
            stats.total_views += t.view_count || 0;
            stats.total_clicks += t.click_count || 0;
          }
        }
      } catch {}
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取数据看板失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
