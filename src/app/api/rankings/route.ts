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

    // 为每个工具添加评分统计
    const toolsWithRatings = await Promise.all(
      tools.map(async (tool) => {
        const { data: ratings } = await client
          .from('user_ratings')
          .select('effect_score, usability_score, quota_score, stability_score')
          .eq('tool_id', tool.id);

        let avgRating = 0;
        if (ratings && ratings.length > 0) {
          const total = ratings.reduce((sum, r) => {
            const avg = (r.effect_score + r.usability_score + r.quota_score + r.stability_score) / 4;
            return sum + avg;
          }, 0);
          avgRating = Math.round((total / ratings.length) * 10) / 10;
        }

        return {
          ...tool,
          rating_count: ratings?.length || 0,
          avg_rating: avgRating
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: toolsWithRatings,
      meta: {
        type,
        scene,
        limit
      }
    });
  } catch (error) {
    console.error('获取榜单失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
