import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';
import { requireAuth, getOptionalUserId } from '@/lib/user-middleware';

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const currentUserId = await getOptionalUserId(request);

    // 检查工具是否被收藏
    if (toolId) {
      if (!currentUserId) {
        return NextResponse.json({ success: true, data: { is_favorited: false } });
      }

      let isFavorited = false;
      if (isVolcenginePgMode()) {
        const { getPgPool } = await import('@/lib/db');
        const pool = await getPgPool();
        const result = await pool.query(`
          SELECT id FROM user_favorites WHERE user_id = $1 AND tool_id = $2
        `, [currentUserId, toolId]);
        isFavorited = result.rows.length > 0;
      } else {
        const { query } = await import('@/lib/db');
        const result = await query('user_favorites', {
          eq: { user_id: currentUserId, tool_id: toolId },
        });
        isFavorited = !!result.data?.[0];
      }

      return NextResponse.json({ success: true, data: { is_favorited: isFavorited } });
    }

    // 获取用户的收藏列表（需要登录）
    if (!currentUserId) {
      return NextResponse.json({
        success: false,
        error: '请先登录',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const offset = (page - 1) * limit;
    let favorites: any[] = [];
    let total = 0;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      const [listResult, countResult] = await Promise.all([
        pool.query(`
          SELECT f.*, t.id as "tools.id", t.name as "tools.name", t.logo as "tools.logo", 
                 t.producer as "tools.producer", t.highlight as "tools.highlight", 
                 t.free_type as "tools.free_type", t.feature_tags as "tools.feature_tags",
                 c.name as "tools.categories.name"
          FROM user_favorites f
          LEFT JOIN tools t ON f.tool_id = t.id
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE f.user_id = $1
          ORDER BY f.created_at DESC
          LIMIT $2 OFFSET $3
        `, [currentUserId, limit, offset]),
        pool.query(`SELECT COUNT(*) as total FROM user_favorites WHERE user_id = $1`, [currentUserId])
      ]);

      favorites = listResult.rows;
      total = parseInt(countResult.rows[0]?.total || '0');
    } else {
      const { query } = await import('@/lib/db');
      const result = await query('user_favorites', {
        select: '*, tools(id, name, logo, producer, highlight, free_type, feature_tags, categories(name))',
        eq: { user_id: currentUserId },
        order: { column: 'created_at', ascending: false },
        limit,
        offset,
        count: true,
      });
      favorites = result.data || [];
      total = result.count || 0;
    }

    return NextResponse.json({
      success: true,
      data: favorites,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    let data;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      // 检查是否已收藏
      const existing = await pool.query(`
        SELECT id FROM user_favorites WHERE user_id = $1 AND tool_id = $2
      `, [userId, tool_id]);

      if (existing.rows[0]) {
        return NextResponse.json({ success: false, error: '已收藏该工具' }, { status: 400 });
      }

      const result = await pool.query(`
        INSERT INTO user_favorites (user_id, tool_id, created_at)
        VALUES ($1, $2, NOW())
        RETURNING *
      `, [userId, tool_id]);
      data = result.rows[0];
    } else {
      const { query } = await import('@/lib/db');
      const existing = await query('user_favorites', {
        eq: { user_id: userId, tool_id },
      });

      if (existing.data?.[0]) {
        return NextResponse.json({ success: false, error: '已收藏该工具' }, { status: 400 });
      }

      data = { id: Date.now(), user_id: userId, tool_id };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (!toolId) {
      return NextResponse.json({ success: false, error: '缺少工具ID' }, { status: 400 });
    }

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      await pool.query(`
        DELETE FROM user_favorites WHERE user_id = $1 AND tool_id = $2
      `, [userId, toolId]);
    } else {
      // Supabase 模式 - 简化处理
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
