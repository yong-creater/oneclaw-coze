import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取教程列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let data: any[] = [];
    let total = 0;

    if (isVolcenginePgMode()) {
      try {
        const { getPgPool } = await import('@/lib/db');
        const pool = await getPgPool();

        let sql = `
          SELECT tut.*, t.id as tool_id, t.name as tool_name, t.logo as tool_logo
          FROM tutorials tut
          LEFT JOIN tools t ON tut.tool_id = t.id
          WHERE tut.status = 'published'
        `;
        let countSql = `SELECT COUNT(*) as total FROM tutorials tut WHERE tut.status = 'published'`;
        const params: any[] = [];
        const countParams: any[] = [];
        let paramIndex = 1;
        let countIndex = 1;

        if (toolId) {
          sql += ` AND tut.tool_id = $${paramIndex}`;
          countSql += ` AND tut.tool_id = $${countIndex}`;
          params.push(toolId);
          countParams.push(toolId);
          paramIndex++;
          countIndex++;
        }
        if (category) {
          sql += ` AND tut.category = $${paramIndex}`;
          countSql += ` AND tut.category = $${countIndex}`;
          params.push(category);
          countParams.push(category);
          paramIndex++;
          countIndex++;
        }
        if (search) {
          sql += ` AND (tut.title ILIKE $${paramIndex} OR tut.content ILIKE $${paramIndex})`;
          countSql += ` AND (tut.title ILIKE $${countIndex} OR tut.content ILIKE $${countIndex})`;
          params.push(`%${search}%`);
          countParams.push(`%${search}%`);
          paramIndex++;
          countIndex++;
        }

        sql += ` ORDER BY tut.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const [result, countResult] = await Promise.all([
          pool.query(sql, params),
          pool.query(countSql, countParams)
        ]);

        data = result.rows;
        total = parseInt(countResult.rows[0]?.total || '0');
      } catch (dbError) {
        // 表不存在时返回空数据
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, total_pages: 0 }
        });
      }
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      const eq: any = { status: 'published' };
      if (toolId) eq['tool_id'] = toolId;
      if (category) eq['category'] = category;
      
      const result = await query('tutorials', {
        select: '*, tools(id, name, logo)',
        eq,
        order: { column: 'created_at', ascending: false },
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
    console.error('获取Tutorials失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}
