import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取数据看板统计
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // 并行获取各种统计数据
    const [
      toolsResult,
      categoriesResult,
      ratingsResult,
      reviewsResult,
      favoritesResult,
      recentToolsResult,
    ] = await Promise.all([
      supabase.from('tools').select('view_count, click_count, free_type, created_at', { count: 'exact' }).eq('is_active', true),
      supabase.from('categories').select('name'),
      supabase.from('user_ratings').select('*', { count: 'exact' }),
      supabase.from('user_reviews').select('*', { count: 'exact' }),
      supabase.from('user_favorites').select('*', { count: 'exact' }),
      supabase.from('tools').select('name, click_count').eq('is_active', true).order('click_count', { ascending: false }).limit(5),
    ]);

    // 计算统计数据
    const tools = toolsResult.data || [];
    const totalTools = toolsResult.count || 0;
    const totalViews = tools.reduce((sum, t) => sum + (t.view_count || 0), 0);
    const totalClicks = tools.reduce((sum, t) => sum + (t.click_count || 0), 0);

    // 分类分布（简化版）
    const categories = categoriesResult.data || [];
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const { count } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        return { name: cat.name, count: count || 0 };
      })
    );

    // 最近7天活动（简化版）
    const recentActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = dateStr + 'T00:00:00';
      const dayEnd = dateStr + 'T23:59:59';
      
      const { count } = await supabase
        .from('tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd);
      
      recentActivity.push({ date: dateStr, count: count || 0 });
    }

    return NextResponse.json({
      success: true,
      data: {
        total_tools: totalTools,
        total_views: totalViews,
        total_clicks: totalClicks,
        total_ratings: ratingsResult.count || 0,
        total_reviews: reviewsResult.count || 0,
        total_favorites: favoritesResult.count || 0,
        categories: categoryStats.sort((a, b) => b.count - a.count),
        top_tools: (recentToolsResult.data || []).map(t => ({
          name: t.name,
          click_count: t.click_count || 0
        })),
        free_type_distribution: Object.entries(
          tools.reduce((acc, t) => {
            const ft = t.free_type || '未知';
            acc[ft] = (acc[ft] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([name, count]) => ({ name, count })),
        recent_activity: recentActivity,
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取统计数据失败' 
    }, { status: 500 });
  }
}
