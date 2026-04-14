import { NextRequest, NextResponse } from 'next/server';
import { query, isVolcenginePgMode } from '@/lib/db';

// 获取前台工具列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // 筛选参数
    const category_slug = searchParams.get('category');
    const free_types = searchParams.get('free_types')?.split(',').filter(Boolean) || [];
    const feature_tags = searchParams.get('features')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search');
    
    // 构建基础查询
    const where: Record<string, any> = { is_active: true };
    
    // 分类筛选
    if (category_slug && category_slug !== 'all') {
      where['category_slug'] = category_slug;
    }
    
    // 免费类型筛选
    if (free_types.length > 0) {
      where['free_type'] = free_types;
    }
    
    // 搜索
    if (search) {
      where['search'] = search;
    }
    
    let data;
    let total = 0;
    
    if (isVolcenginePgMode()) {
      // 火山引擎 PostgreSQL 模式
      const { getPgPool } = await import('@/lib/db');
      const pool = await getPgPool();
      
      // 构建动态 SQL
      let sql = `
        SELECT t.*, c.name as category_name, c.slug as category_slug
        FROM tools t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.is_active = true
      `;
      const params: any[] = [];
      let paramIndex = 1;
      
      if (category_slug && category_slug !== 'all') {
        sql += ` AND c.slug = $${paramIndex}`;
        params.push(category_slug);
        paramIndex++;
      }
      
      if (free_types.length > 0) {
        sql += ` AND t.free_type = ANY($${paramIndex})`;
        params.push(free_types);
        paramIndex++;
      }
      
      if (search) {
        sql += ` AND (t.name ILIKE $${paramIndex} OR t.producer ILIKE $${paramIndex} OR t.highlight ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      // 获取总数
      const countSql = sql.replace('SELECT t.*, c.name as category_name, c.slug as category_slug', 'SELECT COUNT(*) as total');
      const countResult = await pool.query(countSql, params);
      total = parseInt(countResult.rows[0]?.total || '0');
      
      // 排序
      sql += ` ORDER BY t.is_featured DESC, t.created_at DESC`;
      
      // 分页
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await pool.query(sql, params);
      data = result.rows;
    } else {
      // Supabase 模式（备用）
      const result = await query('tools', {
        select: '*, categories(name, slug)',
        eq: { is_active: true },
        order: { column: 'is_featured', ascending: false },
        limit,
        offset,
        count: true,
      });
      data = result.data;
      total = result.count || 0;
    }
    
    // 添加缓存头
    const cacheControl = search || free_types.length || feature_tags.length
      ? 'public, max-age=30, stale-while-revalidate=60'
      : 'public, max-age=60, stale-while-revalidate=300';
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      }
    }, {
      headers: { 'Cache-Control': cacheControl }
    });
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}
