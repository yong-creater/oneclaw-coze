import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取分类列表（分类数据变化少，可以长时间缓存）
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order');
    
    if (error) throw new Error(error.message);
    
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
