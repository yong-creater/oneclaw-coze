import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 工具对比API
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ success: false, error: '缺少ids参数' }, { status: 400 });
    }

    const toolIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    if (toolIds.length < 2 || toolIds.length > 4) {
      return NextResponse.json({ success: false, error: '请选择2-4个工具进行对比' }, { status: 400 });
    }

    // 获取工具详情
    const { data: tools, error } = await client
      .from('tools')
      .select(`
        id, name, logo, producer, highlight, free_type, free_quota_desc,
        feature_tags, max_duration, official_url, promotion_url,
        is_official, advantages, limitations, commercial_license,
        launch_date, view_count, click_count,
        categories(name)
      `)
      .in('id', toolIds);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 获取评分统计
    const toolsWithRatings = await Promise.all(
      (tools || []).map(async (tool) => {
        const { data: ratings } = await client
          .from('user_ratings')
          .select('effect_score, usability_score, quota_score, stability_score')
          .eq('tool_id', tool.id);

        let avgRating = 0;
        const ratingCount = ratings?.length || 0;
        
        if (ratings && ratings.length > 0) {
          const total = ratings.reduce((sum, r) => {
            const avg = (r.effect_score + r.usability_score + r.quota_score + r.stability_score) / 4;
            return sum + avg;
          }, 0);
          avgRating = Math.round((total / ratings.length) * 10) / 10;
        }

        return {
          ...tool,
          rating: avgRating,
          rating_count: ratingCount
        };
      })
    );

    // 构建对比数据
    const comparison = {
      tools: toolsWithRatings,
      dimensions: [
        {
          name: '免费类型',
          key: 'free_type',
          values: toolsWithRatings.map(t => t.free_type)
        },
        {
          name: '免费额度',
          key: 'free_quota_desc',
          values: toolsWithRatings.map(t => t.free_quota_desc || '无')
        },
        {
          name: '生成时长',
          key: 'max_duration',
          values: toolsWithRatings.map(t => t.max_duration)
        },
        {
          name: '商用授权',
          key: 'commercial_license',
          values: toolsWithRatings.map(t => t.commercial_license)
        },
        {
          name: '用户评分',
          key: 'rating',
          values: toolsWithRatings.map(t => t.rating > 0 ? `${t.rating} (${t.rating_count}人)` : '暂无评分')
        },
        {
          name: '访问量',
          key: 'click_count',
          values: toolsWithRatings.map(t => `${t.click_count} 次`)
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('工具对比失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
