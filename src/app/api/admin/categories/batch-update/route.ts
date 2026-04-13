import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 批量更新分类排序
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ success: false, error: '缺少分类数据' }, { status: 400 });
    }

    // 批量更新
    const updates = categories.map(async (item: { id: number; sort_order: number }) => {
      const { error } = await client
        .from('categories')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
      
      if (error) {
        console.error(`更新分类 ${item.id} 失败:`, error);
        return false;
      }
      return true;
    });

    const results = await Promise.all(updates);
    const allSuccess = results.every(r => r);

    if (allSuccess) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: '部分更新失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('批量更新分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
