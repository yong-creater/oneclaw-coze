import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取数据看板统计
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取工具总数
    const { count: totalTools } = await client
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 获取总浏览量
    const { data: viewStats } = await client
      .from('tools')
      .select('view_count')
      .eq('is_active', true);

    const totalViews = viewStats?.reduce((sum, t) => sum + (t.view_count || 0), 0) || 0;

    // 获取总点击量
    const { data: clickStats } = await client
      .from('tools')
      .select('click_count')
      .eq('is_active', true);

    const totalClicks = clickStats?.reduce((sum, t) => sum + (t.click_count || 0), 0) || 0;

    // 获取用户评分数
    const { count: totalRatings } = await client
      .from('user_ratings')
      .select('*', { count: 'exact', head: true });

    // 获取分类分布
    const { data: categories } = await client
      .from('categories')
      .select('name');

    const categoryStats = await Promise.all(
      (categories || []).map(async (cat) => {
        const { count } = await client
          .from('tools')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // 通过关联查询获取每个分类的工具数
        return { name: cat.name, count: 0 };
      })
    );

    // 简化：直接查询工具表获取分类统计
    const { data: toolsWithCategory } = await client
      .from('tools')
      .select('categories(name)')
      .eq('is_active', true);

    const categoryCount: Record<string, number> = {};
    toolsWithCategory?.forEach((t: any) => {
      const name = t.categories?.name;
      if (name) {
        categoryCount[name] = (categoryCount[name] || 0) + 1;
      }
    });

    const categoryDistribution = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 获取热门工具 TOP 5
    const { data: topTools } = await client
      .from('tools')
      .select('name, click_count')
      .eq('is_active', true)
      .order('click_count', { ascending: false })
      .limit(5);

    // 获取免费类型分布
    const { data: freeTypeData } = await client
      .from('tools')
      .select('free_type')
      .eq('is_active', true);

    const freeTypeCount: Record<string, number> = {};
    freeTypeData?.forEach((t: any) => {
      freeTypeCount[t.free_type] = (freeTypeCount[t.free_type] || 0) + 1;
    });

    // 获取最近7天新增工具数（简化处理）
    const { data: recentTools } = await client
      .from('tools')
      .select('created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(30);

    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({ date: dateStr, count: 0 });
    }

    recentTools?.forEach((t: any) => {
      const dateStr = t.created_at?.split('T')[0];
      const dayIndex = last7Days.findIndex(d => d.date === dateStr);
      if (dayIndex >= 0) {
        last7Days[dayIndex].count++;
      }
    });

    // 获取评论数
    const { count: totalReviews } = await client
      .from('user_reviews')
      .select('*', { count: 'exact', head: true });

    // 获取收藏数
    const { count: totalFavorites } = await client
      .from('user_favorites')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        total_tools: totalTools || 0,
        total_views: totalViews,
        total_clicks: totalClicks,
        total_ratings: totalRatings || 0,
        total_reviews: totalReviews || 0,
        total_favorites: totalFavorites || 0,
        categories: categoryDistribution,
        top_tools: topTools || [],
        free_type_distribution: Object.entries(freeTypeCount).map(([name, count]) => ({ name, count })),
        recent_activity: last7Days
      }
    });
  } catch (error) {
    console.error('获取数据看板失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
