import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取分类列表
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('获取分类失败:', error);
      return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data
    }, {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
