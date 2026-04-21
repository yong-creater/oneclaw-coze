import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/user-middleware';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!toolId) {
      return NextResponse.json({ success: false, error: '缺少tool_id参数' }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    const supabase = getSupabaseClient();

    // 先获取评论
    const { data: reviews, count, error } = await supabase
      .from('user_reviews')
      .select('*', { count: 'exact' })
      .eq('tool_id', toolId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取评论失败:', error);
      return NextResponse.json({ success: false, error: '获取评论失败' });
    }

    // 分别获取用户信息
    const userIds = [...new Set((reviews || []).map((r: any) => r.user_id))];
    let usersMap: Record<string, any> = {};

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('user_id, nickname, avatar_url')
        .in('user_id', userIds);

      (users || []).forEach((u: any) => {
        usersMap[u.user_id] = u;
      });
    }

    // 如果有评论，获取对应的评分数据
    const reviewIds = (reviews || []).map((r: any) => r.id);
    let ratingsMap: Record<number, any> = {};

    if (reviewIds.length > 0) {
      const { data: ratings } = await supabase
        .from('user_ratings')
        .select('*')
        .in('review_id', reviewIds);

      (ratings || []).forEach((r: any) => {
        ratingsMap[r.review_id] = r;
      });
    }

    // 最终合并评论、用户和评分数据
    const finalReviews = (reviews || []).map((review: any) => ({
      ...review,
      users: usersMap[review.user_id],
      rating: ratingsMap[review.id]
    }));

    return NextResponse.json({
      success: true,
      data: finalReviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 提交评论
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { tool_id, content, rating } = await request.json();

    if (!tool_id || !content) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    if (content.length < 10 || content.length > 500) {
      return NextResponse.json({ success: false, error: '评论长度需在10-500字之间' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 插入评论
    const { data: review, error: reviewError } = await supabase
      .from('user_reviews')
      .insert({
        user_id: userId,
        tool_id,
        content,
        likes: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (reviewError) {
      console.error('提交评论失败:', reviewError);
      return NextResponse.json({ success: false, error: '提交评论失败' });
    }

    // 如果有评分，也插入评分
    if (rating) {
      await supabase
        .from('user_ratings')
        .insert({
          user_id: userId,
          tool_id,
          review_id: review.id,
          effect_score: rating.effect_score || 0,
          usability_score: rating.usability_score || 0,
          quota_score: rating.quota_score || 0,
          stability_score: rating.stability_score || 0,
          created_at: new Date().toISOString()
        });
    }

    return NextResponse.json({
      success: true,
      message: '评论已提交，等待审核'
    });
  } catch (error) {
    console.error('提交评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
