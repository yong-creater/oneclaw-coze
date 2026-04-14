import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';

// 获取工具评分统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (!toolId) {
      return NextResponse.json({ success: false, error: '缺少tool_id参数' }, { status: 400 });
    }

    const currentUserId = await getOptionalUserId(request);
    let data: any = {
      count: 0,
      avg_effect: 0,
      avg_usability: 0,
      avg_quota: 0,
      avg_stability: 0,
      avg_overall: 0,
      user_rating: null
    };

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      const result = await pool.query(`
        SELECT 
          AVG(effect_score) as avg_effect,
          AVG(usability_score) as avg_usability,
          AVG(quota_score) as avg_quota,
          AVG(stability_score) as avg_stability,
          AVG((effect_score + usability_score + quota_score + stability_score) / 4.0) as avg_overall,
          COUNT(*) as count
        FROM user_ratings
        WHERE tool_id = $1
      `, [toolId]);

      if (result.rows[0] && result.rows[0].count > 0) {
        data = {
          count: parseInt(result.rows[0].count),
          avg_effect: Math.round(parseFloat(result.rows[0].avg_effect) * 10) / 10,
          avg_usability: Math.round(parseFloat(result.rows[0].avg_usability) * 10) / 10,
          avg_quota: Math.round(parseFloat(result.rows[0].avg_quota) * 10) / 10,
          avg_stability: Math.round(parseFloat(result.rows[0].avg_stability) * 10) / 10,
          avg_overall: Math.round(parseFloat(result.rows[0].avg_overall) * 10) / 10,
          user_rating: null
        };
      }

      // 获取用户评分（如果已登录）
      if (currentUserId) {
        const userResult = await pool.query(`
          SELECT * FROM user_ratings
          WHERE tool_id = $1 AND user_id = $2
        `, [toolId, currentUserId]);
        if (userResult.rows[0]) {
          data.user_rating = userResult.rows[0];
        }
      }
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      const result = await query('user_ratings', {
        select: 'effect_score, usability_score, quota_score, stability_score',
        eq: { tool_id: toolId },
      });

      if (result.data && result.data.length > 0) {
        const ratings = result.data;
        const count = ratings.length;
        const avg_effect = ratings.reduce((sum: number, r: any) => sum + r.effect_score, 0) / count;
        const avg_usability = ratings.reduce((sum: number, r: any) => sum + r.usability_score, 0) / count;
        const avg_quota = ratings.reduce((sum: number, r: any) => sum + r.quota_score, 0) / count;
        const avg_stability = ratings.reduce((sum: number, r: any) => sum + r.stability_score, 0) / count;
        const avg_overall = (avg_effect + avg_usability + avg_quota + avg_stability) / 4;

        data = {
          count,
          avg_effect: Math.round(avg_effect * 10) / 10,
          avg_usability: Math.round(avg_usability * 10) / 10,
          avg_quota: Math.round(avg_quota * 10) / 10,
          avg_stability: Math.round(avg_stability * 10) / 10,
          avg_overall: Math.round(avg_overall * 10) / 10,
          user_rating: null
        };
      }

      if (currentUserId) {
        const { query: q2 } = await import('@/lib/db');
        const userResult = await q2('user_ratings', {
          eq: { tool_id: toolId, user_id: currentUserId },
        });
        if (userResult.data?.[0]) {
          data.user_rating = userResult.data[0];
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取评分失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建或更新评分
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
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    const scores = [effect_score, usability_score, quota_score, stability_score];
    if (scores.some(s => s === undefined || s === null)) {
      return NextResponse.json({ success: false, error: '请填写完整评分' }, { status: 400 });
    }
    if (scores.some(s => s < 1 || s > 5)) {
      return NextResponse.json({ success: false, error: '评分必须在1-5之间' }, { status: 400 });
    }

    let data;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      // 检查是否已评分
      const existing = await pool.query(`
        SELECT id FROM user_ratings WHERE user_id = $1 AND tool_id = $2
      `, [userId, tool_id]);

      if (existing.rows[0]) {
        // 更新
        const result = await pool.query(`
          UPDATE user_ratings 
          SET effect_score = $1, usability_score = $2, quota_score = $3, stability_score = $4, updated_at = NOW()
          WHERE id = $5
          RETURNING *
        `, [effect_score, usability_score, quota_score, stability_score, existing.rows[0].id]);
        data = result.rows[0];
      } else {
        // 创建
        const result = await pool.query(`
          INSERT INTO user_ratings (user_id, tool_id, effect_score, usability_score, quota_score, stability_score, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `, [userId, tool_id, effect_score, usability_score, quota_score, stability_score]);
        data = result.rows[0];
      }
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      const existing = await query('user_ratings', {
        eq: { user_id: userId, tool_id },
      });

      if (existing.data?.[0]) {
        const { query: q2 } = await import('@/lib/db');
        // 简单处理，更新逻辑需要适配
        data = existing.data[0];
      } else {
        data = { id: Date.now() };
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('提交评分失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
