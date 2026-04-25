import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { validateSession } from '@/lib/auth';

// 获取后台统计数据
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权访问，请先登录',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const admin = await validateSession(token);
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: '登录已过期，请重新登录',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    const client = getSupabaseClient();

    // 获取今天的开始时间
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 并行获取所有统计数据
    const [
      toolsCount,
      featuredCount,
      activeCount,
      categories,
      tags,
      usersCount,
      templatesCount,
      ratingsCount,
      reviewsPending,
      vipCount,
      todayUses,
      totalUses,
      favoritesCount,
    ] = await Promise.all([
      // 工具统计
      client.from('tools').select('id', { count: 'exact', head: true }),
      client.from('tools').select('id', { count: 'exact', head: true }).eq('is_featured', true),
      client.from('tools').select('id', { count: 'exact', head: true }).eq('is_active', true),
      // 分类和标签
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('tags').select('id', { count: 'exact', head: true }),
      // 用户统计
      client.from('users').select('id', { count: 'exact', head: true }),
      // 模板统计
      client.from('templates').select('id', { count: 'exact', head: true }),
      // 评分和评论
      client.from('user_ratings').select('id', { count: 'exact', head: true }),
      client.from('user_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      // VIP会员
      client.from('members').select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('expire_at', new Date().toISOString()),
      // 使用统计
      client.from('utility_usage_logs').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),
      // 总使用量
      client.from('utility_usage_logs').select('id', { count: 'exact', head: true }),
      // 收藏统计
      client.from('user_favorites').select('id', { count: 'exact', head: true }),
    ]);

    // 获取总浏览量和点击量
    const { data: statsData } = await client
      .from('tools')
      .select('view_count, click_count');

    let totalViews = 0;
    let totalClicks = 0;
    if (statsData) {
      totalViews = statsData.reduce((sum, t) => sum + (t.view_count || 0), 0);
      totalClicks = statsData.reduce((sum, t) => sum + (t.click_count || 0), 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        // 工具统计
        tools_count: toolsCount.count || 0,
        featured_count: featuredCount.count || 0,
        active_count: activeCount.count || 0,
        // 分类和标签
        categories: categories.count || 0,
        tags: tags.count || 0,
        // 用户统计
        users_count: usersCount.count || 0,
        vip_count: vipCount.count || 0,
        // 模板
        templates_count: templatesCount.count || 0,
        // 浏览和点击
        total_views: totalViews,
        total_clicks: totalClicks,
        // 评分和评论
        ratings_count: ratingsCount.count || 0,
        reviews_pending: reviewsPending.count || 0,
        // 使用量
        today_uses: todayUses.count || 0,
        total_uses: totalUses.count || 0,
        // 收藏
        favorites_count: favoritesCount.count || 0,
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
