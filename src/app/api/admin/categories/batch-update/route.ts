import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 批量更新分类排序
export async function PUT(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ success: false, error: '缺少分类数据' }, { status: 400 });
    }

    // 串行更新确保稳定性
    for (const item of categories) {
      const { error } = await client
        .from('categories')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
      
      if (error) {
        console.error(`更新分类 ${item.id} 失败:`, error);
        return NextResponse.json({ 
          success: false, 
          error: `更新分类 ${item.id} 失败: ${error.message}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('批量更新分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
