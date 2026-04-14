import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');

    const offset = (page - 1) * limit;
    let data: any[] = [];
    let total = 0;

    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();

      let sql = `
        SELECT s.*, sc.id as "skill_categories.id", sc.name as "skill_categories.name",
               sc.slug as "skill_categories.slug", sc.color as "skill_categories.color"
        FROM skills s
        LEFT JOIN skill_categories sc ON s.category_id = sc.id
        WHERE s.is_active = true
      `;
      let countSql = `SELECT COUNT(*) as total FROM skills WHERE is_active = true`;
      const params: any[] = [];
      const countParams: any[] = [];
      let paramIndex = 1;

      if (category && category !== 'all') {
        sql += ` AND s.category_id = $${paramIndex}`;
        countSql += ` AND category_id = $${paramIndex}`;
        params.push(category);
        countParams.push(category);
        paramIndex++;
      }

      if (featured === 'true') {
        sql += ` AND s.is_featured = true`;
        countSql += ` AND is_featured = true`;
      }

      if (search) {
        sql += ` AND (s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`;
        countSql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        countParams.push(`%${search}%`);
        paramIndex++;
      }

      if (difficulty) {
        sql += ` AND s.difficulty = $${paramIndex}`;
        countSql += ` AND difficulty = $${paramIndex}`;
        params.push(difficulty);
        countParams.push(difficulty);
        paramIndex++;
      }

      sql += ` ORDER BY s.is_featured DESC, s.view_count DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const [listResult, countResult] = await Promise.all([
        pool.query(sql, params),
        pool.query(countSql, countParams)
      ]);

      data = listResult.rows;
      total = parseInt(countResult.rows[0]?.total || '0');
    } else {
      const { query } = await import('@/lib/db');
      const eq: any = { is_active: true };
      if (category && category !== 'all') eq['category_id'] = parseInt(category);
      if (featured === 'true') eq['is_featured'] = true;
      if (difficulty) eq['difficulty'] = difficulty;

      const result = await query('skills', {
        select: `*, skill_categories (id, name, slug, color)`,
        eq,
        order: { column: 'is_featured', ascending: false },
        limit,
        offset,
        count: true,
      });
      data = result.data || [];
      total = result.count || 0;
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取技能列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
