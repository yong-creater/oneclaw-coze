import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取各类榜单
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot'; // hot, free, new, scene
    const scene = searchParams.get('scene'); // 口播视频、电商带货等
    const limit = parseInt(searchParams.get('limit') || '10');

    let tools: any[] = [];

    switch (type) {
      case 'hot':
        // 热门榜单：按点击量排序
        const { data: hotTools } = await client
          .from('tools')
          .select('id, name, logo, producer, highlight, free_type, feature_tags, official_url, promotion_url, view_count, click_count, launch_date, categories(name, slug)')
          .eq('is_active', true)
          .order('click_count', { ascending: false })
          .limit(limit);
        tools = hotTools || [];
        break;

      case 'free':
        // 免费神器榜单：只显示完全免费的工具，按评分排序
        const { data: freeTools } = await client
          .from('tools')
          .select('id, name, logo, producer, highlight, free_type, feature_tags, official_url, promotion_url, view_count, click_count, launch_date, categories(name, slug)')
          .eq('is_active', true)
          .in('free_type', ['完全免费', '免费额度'])
          .order('click_count', { ascending: false })
          .limit(limit);
        tools = freeTools || [];
        break;

      case 'new':
        // 新品上线：最近30天内的工具，按上线时间排序
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: newTools } = await client
          .from('tools')
          .select('id, name, logo, producer, highlight, free_type, feature_tags, official_url, promotion_url, view_count, click_count, launch_date, categories(name, slug)')
          .eq('is_active', true)
          .gte('launch_date', thirtyDaysAgo.toISOString())
          .order('launch_date', { ascending: false })
          .limit(limit);
        tools = newTools || [];
        break;

      case 'scene':
        // 场景化榜单：按分类或二级分类筛选
        if (scene) {
          // 先查找对应的二级分类
          const { data: subCats } = await client
            .from('sub_categories')
            .select('id')
            .eq('name', scene);
          
          if (subCats && subCats.length > 0) {
            const subCatIds = subCats.map(c => c.id);
            // 这里需要用原生SQL查询JSON数组，简化处理
            const { data: sceneTools } = await client
              .from('tools')
              .select('id, name, logo, producer, highlight, free_type, feature_tags, official_url, promotion_url, view_count, click_count, categories(name, slug)')
              .eq('is_active', true)
              .order('click_count', { ascending: false })
              .limit(limit * 2);
            
            // 前端过滤
            tools = (sceneTools || []).filter((t: any) => {
              // 简单匹配场景名
              return t.feature_tags?.includes(scene) || 
                     t.highlight?.includes(scene);
            }).slice(0, limit);
          } else {
            tools = [];
          }
        } else {
          tools = [];
        }
        break;

      default:
        tools = [];
    }

    // 批量获取所有工具的评分统计（优化：单次查询）
    const toolIds = tools.map(t => t.id);
    let ratingsMap: Record<number, { count: number; avg: number }> = {};
    
    if (toolIds.length > 0) {
      const { data: allRatings } = await client
        .from('user_ratings')
        .select('tool_id, effect_score, usability_score, quota_score, stability_score')
        .in('tool_id', toolIds);

      if (allRatings) {
        // 按工具ID分组计算平均分
        const grouped = allRatings.reduce((acc, r) => {
          if (!acc[r.tool_id]) {
            acc[r.tool_id] = { total: 0, count: 0 };
          }
          const avg = (r.effect_score + r.usability_score + r.quota_score + r.stability_score) / 4;
          acc[r.tool_id].total += avg;
          acc[r.tool_id].count += 1;
          return acc;
        }, {} as Record<number, { total: number; count: number }>);

        ratingsMap = Object.fromEntries(
          Object.entries(grouped).map(([id, data]) => [
            Number(id),
            { count: data.count, avg: Math.round((data.total / data.count) * 10) / 10 }
          ])
        );
      }
    }

    // 合并评分数据
    const toolsWithRatings = tools.map(tool => ({
      ...tool,
      rating_count: ratingsMap[tool.id]?.count || 0,
      avg_rating: ratingsMap[tool.id]?.avg || 0
    }));

    // 榜单数据可以缓存较长时间
    return NextResponse.json({
      success: true,
      data: toolsWithRatings,
      meta: {
        type,
        scene,
        limit
      }
    }, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
  } catch (error) {
    console.error('获取榜单失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
