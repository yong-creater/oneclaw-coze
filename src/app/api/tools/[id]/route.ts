import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取单个工具详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toolId = parseInt(id);

    if (isNaN(toolId)) {
      return NextResponse.json({ success: false, error: '无效的工具ID' }, { status: 400 });
    }

    let tool;

    if (isVolcenginePgMode()) {
      // 火山引擎 PostgreSQL 模式
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      
      const result = await pool.query(`
        SELECT t.*, c.name as category_name, c.slug as category_slug
        FROM tools t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1 AND t.is_active = true
      `, [toolId]);
      
      tool = result.rows[0];
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      const result = await query('tools', {
        select: '*, categories(name, slug)',
        eq: { id: toolId, is_active: true },
      });
      tool = result.data?.[0];
    }

    if (!tool) {
      return NextResponse.json({ success: false, error: '工具不存在' }, { status: 404 });
    }

    // 异步增加浏览量（不阻塞响应）
    if (isVolcenginePgMode()) {
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      pool.query('UPDATE tools SET view_count = view_count + 1 WHERE id = $1', [toolId]).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tool,
        view_count: (tool.view_count || 0) + 1
      }
    }, {
      headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error('获取工具详情失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
