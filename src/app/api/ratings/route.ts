import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/user-middleware';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取工具评分统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (!toolId) {
      return NextResponse.json({ success: false, error: '缺少tool_id参数' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 获取该工具的所有评分
    const { data: ratings, error } = await supabase
      .from('user_ratings')
      .select('effect_score, usability_score, quota_score, stability_score')
      .eq('tool_id', toolId);

    if (error) {
      console.error('获取评分失败:', error);
      return NextResponse.json({ success: false, error: '获取评分失败' });
    }

    // 计算平均值
    const count = ratings?.length || 0;
    if (count === 0) {
      return NextResponse.json({
        success: true,
        data: {
          count: 0,
          average: { effect: 0, usability: 0, quota: 0, stability: 0, overall: 0 }
        }
      });
    }

    const avgEffect = ratings!.reduce((sum, r) => sum + r.effect_score, 0) / count;
    const avgUsability = ratings!.reduce((sum, r) => sum + r.usability_score, 0) / count;
    const avgQuota = ratings!.reduce((sum, r) => sum + r.quota_score, 0) / count;
    const avgStability = ratings!.reduce((sum, r) => sum + r.stability_score, 0) / count;
    const avgOverall = (avgEffect + avgUsability + avgQuota + avgStability) / 4;

    return NextResponse.json({
      success: true,
      data: {
        count,
        average: {
          effect: Math.round(avgEffect * 10) / 10,
          usability: Math.round(avgUsability * 10) / 10,
          quota: Math.round(avgQuota * 10) / 10,
          stability: Math.round(avgStability * 10) / 10,
          overall: Math.round(avgOverall * 10) / 10
        }
      }
    });
  } catch (error) {
    console.error('获取评分失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 提交评分
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const { tool_id, effect_score, usability_score, quota_score, stability_score } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少tool_id参数' }, { status: 400 });
    }

    // 检查必填评分
    if (!effect_score || !usability_score || !quota_score || !stability_score) {
      return NextResponse.json({ success: false, error: '请完成所有评分项' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 检查是否已评分
    const { data: existing } = await supabase
      .from('user_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', tool_id)
      .single();

    if (existing) {
      // 更新评分
      const { error: updateError } = await supabase
        .from('user_ratings')
        .update({
          effect_score,
          usability_score,
          quota_score,
          stability_score,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('更新评分失败:', updateError);
        return NextResponse.json({ success: false, error: '更新评分失败' });
      }

      return NextResponse.json({ success: true, message: '评分已更新' });
    }

    // 新增评分
    const overallScore = ((effect_score + usability_score + quota_score + stability_score) / 4).toFixed(1);
    const { error: insertError } = await supabase
      .from('user_ratings')
      .insert({
        user_id: userId,
        tool_id,
        effect_score,
        usability_score,
        quota_score,
        stability_score,
        overall_score: overallScore,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('提交评分失败:', insertError);
      return NextResponse.json({ success: false, error: '提交评分失败' });
    }

    return NextResponse.json({ success: true, message: '评分成功' });
  } catch (error) {
    console.error('提交评分失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
