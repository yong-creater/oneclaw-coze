import { NextResponse } from 'next/server';
import { isVolcenginePgMode } from '@/lib/db';

// 获取分类列表（分类数据变化少，可以长时间缓存）
export async function GET() {
  try {
    let data;

    if (isVolcenginePgMode()) {
      // 火山引擎 PostgreSQL 模式
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      
      const result = await pool.query(`
        SELECT * FROM categories ORDER BY sort_order
      `);
      data = result.rows;
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      const result = await query('categories', {
        order: { column: 'sort_order', ascending: true },
      });
      data = result.data;
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}
