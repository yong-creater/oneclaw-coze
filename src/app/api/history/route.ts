import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';

// 获取用户浏览历史
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let history: any[] = [];
    let total = 0;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      const [listResult, countResult] = await Promise.all([
        pool.query(`
          SELECT h.*, t.id as "tools.id", t.name as "tools.name", t.logo as "tools.logo",
                 t.producer as "tools.producer", t.highlight as "tools.highlight",
                 t.free_type as "tools.free_type", t.feature_tags as "tools.feature_tags",
                 c.name as "tools.categories.name"
          FROM user_history h
          LEFT JOIN tools t ON h.tool_id = t.id
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE h.user_id = $1
          ORDER BY h.viewed_at DESC
          LIMIT $2 OFFSET $3
        `, [userId, limit, offset]),
        pool.query(`SELECT COUNT(*) as total FROM user_history WHERE user_id = $1`, [userId])
      ]);

      history = listResult.rows;
      total = parseInt(countResult.rows[0]?.total || '0');
    } else {
      const { query } = await import('@/lib/db');
      const result = await query('user_history', {
        select: '*, tools(id, name, logo, producer, highlight, free_type, feature_tags, categories(name))',
        eq: { user_id: userId },
        order: { column: 'viewed_at', ascending: false },
        limit,
        offset,
        count: true,
      });
      history = result.data || [];
      total = result.count || 0;
    }

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 记录浏览历史
export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getOptionalUserId(request);

    if (!currentUserId) {
      return NextResponse.json({ success: true, message: '未登录，跳过记录' });
    }

    const body = await request.json();
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      const existing = await pool.query(`
        SELECT id FROM user_history WHERE user_id = $1 AND tool_id = $2
      `, [currentUserId, tool_id]);

      if (existing.rows[0]) {
        await pool.query(`
          UPDATE user_history SET viewed_at = NOW() WHERE id = $1
        `, [existing.rows[0].id]);
      } else {
        await pool.query(`
          INSERT INTO user_history (user_id, tool_id, viewed_at) VALUES ($1, $2, NOW())
        `, [currentUserId, tool_id]);
      }
    } else {
      // Supabase 模式
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 清除浏览历史
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      await pool.query(`DELETE FROM user_history WHERE user_id = $1`, [userId]);
    } else {
      // Supabase 模式
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('清除浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
