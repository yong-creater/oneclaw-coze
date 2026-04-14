import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';
import { requireAuth } from '@/lib/user-middleware';

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
    let reviews: any[] = [];
    let total = 0;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      const [listResult, countResult] = await Promise.all([
        pool.query(`
          SELECT * FROM user_reviews
          WHERE tool_id = $1 AND status = 'approved'
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [toolId, limit, offset]),
        pool.query(`SELECT COUNT(*) as total FROM user_reviews WHERE tool_id = $1 AND status = 'approved'`, [toolId])
      ]);

      reviews = listResult.rows;
      total = parseInt(countResult.rows[0]?.total || '0');
    } else {
      const { query } = await import('@/lib/db');
      const result = await query('user_reviews', {
        eq: { tool_id: toolId, status: 'approved' },
        order: { column: 'created_at', ascending: false },
        limit,
        offset,
        count: true,
      });
      reviews = result.data || [];
      total = result.count || 0;
    }

    // 如果有评论，获取对应的评分数据
    let reviewsWithRatings = reviews;
    if (reviews.length > 0) {
      const userIds = reviews.map(r => r.user_id);

      if (isVolcenginePgMode()) {
        const { getPgPool } = await import('@/lib/db');
        const pool = await getPgPool();
        const ratingsResult = await pool.query(`
          SELECT user_id, effect_score, usability_score, quota_score, stability_score, overall_score
          FROM user_ratings
          WHERE tool_id = $1 AND user_id = ANY($2)
        `, [toolId, userIds]);

        const ratingsMap = new Map(ratingsResult.rows.map((r: any) => [r.user_id, r]));
        reviewsWithRatings = reviews.map(review => ({
          ...review,
          user_rating: ratingsMap.get(review.user_id) || null
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: reviewsWithRatings,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建评论
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const { tool_id, rating, content } = body;

    if (!tool_id || !content) {
      return NextResponse.json({ success: false, error: '缺少必填参数' }, { status: 400 });
    }

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      const result = await pool.query(`
        INSERT INTO user_reviews (user_id, tool_id, rating, content, status, created_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW())
        RETURNING *
      `, [userId, tool_id, rating || 0, content]);

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    return NextResponse.json({ success: true, data: { id: Date.now() } });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
