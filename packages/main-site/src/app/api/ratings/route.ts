import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';

// 获取工具评分统计
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (!toolId) {
      return NextResponse.json({ success: false, error: '缺少tool_id参数' }, { status: 400 });
    }

    // 获取当前登录用户
    const currentUserId = await getOptionalUserId(request);

    // 获取工具的平均评分
    const { data: ratings, error } = await client
      .from('user_ratings')
      .select('effect_score, usability_score, quota_score, stability_score')
      .eq('tool_id', toolId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!ratings || ratings.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          count: 0,
          avg_effect: 0,
          avg_usability: 0,
          avg_quota: 0,
          avg_stability: 0,
          avg_overall: 0,
          user_rating: null
        }
      });
    }

    const count = ratings.length;
    const avg_effect = ratings.reduce((sum, r) => sum + r.effect_score, 0) / count;
    const avg_usability = ratings.reduce((sum, r) => sum + r.usability_score, 0) / count;
    const avg_quota = ratings.reduce((sum, r) => sum + r.quota_score, 0) / count;
    const avg_stability = ratings.reduce((sum, r) => sum + r.stability_score, 0) / count;
    const avg_overall = (avg_effect + avg_usability + avg_quota + avg_stability) / 4;

    // 获取用户评分（如果已登录）
    let user_rating = null;
    if (currentUserId) {
      const { data: userRating } = await client
        .from('user_ratings')
        .select('*')
        .eq('tool_id', toolId)
        .eq('user_id', currentUserId)
        .maybeSingle();
      user_rating = userRating;
    }

    return NextResponse.json({
      success: true,
      data: {
        count,
        avg_effect: Math.round(avg_effect * 10) / 10,
        avg_usability: Math.round(avg_usability * 10) / 10,
        avg_quota: Math.round(avg_quota * 10) / 10,
        avg_stability: Math.round(avg_stability * 10) / 10,
        avg_overall: Math.round(avg_overall * 10) / 10,
        user_rating
      }
    });
  } catch (error) {
    console.error('获取评分失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建或更新评分
export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const client = getSupabaseClient();
    const body = await request.json();
    const { tool_id, effect_score, usability_score, quota_score, stability_score } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    // 验证评分范围
    const scores = [effect_score, usability_score, quota_score, stability_score];
    if (scores.some(s => s === undefined || s === null)) {
      return NextResponse.json({ success: false, error: '请填写完整评分' }, { status: 400 });
    }
    if (scores.some(s => s < 1 || s > 5)) {
      return NextResponse.json({ success: false, error: '评分必须在1-5之间' }, { status: 400 });
    }

    // 检查是否已评分
    const { data: existing } = await client
      .from('user_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', tool_id)
      .maybeSingle();

    let data, error;

    if (existing) {
      // 更新评分
      const result = await client
        .from('user_ratings')
        .update({
          effect_score,
          usability_score,
          quota_score,
          stability_score,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // 创建评分
      const result = await client
        .from('user_ratings')
        .insert({
          user_id: userId,
          tool_id,
          effect_score,
          usability_score,
          quota_score,
          stability_score
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('提交评分失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
