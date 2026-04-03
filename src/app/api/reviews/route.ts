import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (toolId) {
      // 获取工具的评论列表（只返回已审核通过的）
      const offset = (page - 1) * limit;
      
      const { data: reviews, error, count } = await client
        .from('user_reviews')
        .select('*, user_ratings(effect_score, usability_score, quota_score, stability_score, overall_score)', { count: 'exact' })
        .eq('tool_id', toolId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: reviews || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      });
    }

    return NextResponse.json({ success: false, error: '缺少tool_id参数' }, { status: 400 });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建评论
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { user_id, tool_id, content } = body;

    if (!user_id || !tool_id || !content) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 验证内容长度
    if (content.length < 10 || content.length > 500) {
      return NextResponse.json({ success: false, error: '评论长度需在10-500字之间' }, { status: 400 });
    }

    // 创建评论（默认pending状态，需要审核）
    const { data, error } = await client
      .from('user_reviews')
      .insert({
        user_id,
        tool_id,
        content,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: '评论已提交，等待审核'
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
