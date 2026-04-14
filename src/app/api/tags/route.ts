import { NextRequest, NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取标签列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    let data;

    if (isVolcenginePgMode()) {
      // 火山引擎 PostgreSQL 模式
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      
      let sql = `SELECT * FROM tags`;
      const params: any[] = [];
      
      if (type) {
        sql += ` WHERE type = $1`;
        params.push(type);
      }
      
      sql += ` ORDER BY type, name`;
      
      const result = await pool.query(sql, params);
      data = result.rows;
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      const result = await query('tags', {
        eq: type ? { type } : undefined,
        order: { column: 'type', ascending: true },
      });
      data = result.data;
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}
