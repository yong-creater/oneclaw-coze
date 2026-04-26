import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';

// 获取评论列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.REVIEWS_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
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
  const auth = await requirePermission(request, Permissions.REVIEWS_MODERATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: reviewData } = await client
      .from('user_reviews')
      .select('status')
      .eq('id', id)
      .single();

    const { error } = await client
      .from('user_reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      await logFailure(auth.user, 'UPDATE', 'REVIEW', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'UPDATE', 'REVIEW', id, `审核评论: ${status}`, { old_status: reviewData?.status, new_status: status }, request);
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新评论失败:', error);
    await logFailure(auth.user, 'UPDATE', 'REVIEW', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.REVIEWS_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少评论ID' }, { status: 400 });
    }

    // 获取删除前的数据用于日志
    const { data: reviewData } = await client
      .from('user_reviews')
      .select('content')
      .eq('id', parseInt(id))
      .single();

    const { error } = await client
      .from('user_reviews')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      await logFailure(auth.user, 'DELETE', 'REVIEW', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'DELETE', 'REVIEW', parseInt(id), '删除评论', {}, request);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    await logFailure(auth.user, 'DELETE', 'REVIEW', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
