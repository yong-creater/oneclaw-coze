import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    // 获取评论列表
    const { data: reviews, error } = await client
      .from('user_reviews')
      .select('*, tools(id, name, logo)')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 为每个评论获取对应的评分
    const reviewsWithRatings = await Promise.all(
      (reviews || []).map(async (review) => {
        const { data: rating } = await client
          .from('user_ratings')
          .select('effect_score, usability_score, quota_score, stability_score, overall_score')
          .eq('user_id', review.user_id)
          .eq('tool_id', review.tool_id)
          .maybeSingle();

        return {
          ...review,
          user_ratings: rating
        };
      })
    );

    return NextResponse.json({ success: true, data: reviewsWithRatings });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 更新评论状态
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const { error } = await client
      .from('user_reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
