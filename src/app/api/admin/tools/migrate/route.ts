import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 从现有数据迁移工具
export async function POST(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    // 注意：此接口不再自动导入工具数据
    // 请通过 /api/admin/init-data 初始化基础数据
    // 工具数据需要通过数据库直接导入
    
    const client = getSupabaseClient();
    
    // 获取分类ID映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug');
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '请先调用 /api/admin/init-data 初始化基础数据' 
      }, { status: 400 });
    }
    
    const categorySlugToId = new Map(
      categories.map(c => [c.slug, c.id])
    );
    
    return NextResponse.json({ 
      success: true, 
      message: '请通过数据库导入工具数据',
      categories: categories.length,
      hint: '工具数据需要通过SQL脚本或数据库管理工具直接导入'
    });
    
  } catch (error) {
    console.error('迁移工具失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '迁移失败', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
