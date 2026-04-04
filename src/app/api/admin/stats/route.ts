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

    // 并行获取所有统计数据
    const [
      toolsCount,
      featuredCount,
      activeCount,
      categories,
      tags,
      ratingsCount,
      reviewsPending
    ] = await Promise.all([
      client.from('tools').select('id', { count: 'exact', head: true }),
      client.from('tools').select('id', { count: 'exact', head: true }).eq('is_featured', true),
      client.from('tools').select('id', { count: 'exact', head: true }).eq('is_active', true),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('tags').select('id', { count: 'exact', head: true }),
      client.from('user_ratings').select('id', { count: 'exact', head: true }),
      client.from('user_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending')
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
        tools_count: toolsCount.count || 0,
        featured_count: featuredCount.count || 0,
        active_count: activeCount.count || 0,
        categories: categories.count || 0,
        tags: tags.count || 0,
        total_views: totalViews,
        total_clicks: totalClicks,
        ratings_count: ratingsCount.count || 0,
        reviews_pending: reviewsPending.count || 0
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
