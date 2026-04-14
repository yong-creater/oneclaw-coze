import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个Prompt详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    
    const { data: prompt, error } = await client
      .from('prompts')
      .select('*, tools(id, name, logo)')
      .eq('id', parseInt(id))
      .eq('status', 'published')
      .single();
    
    if (error || !prompt) {
      return NextResponse.json({ 
        success: false, 
        error: '提示词不存在' 
      }, { status: 404 });
    }
    
    // 增加浏览量
    await client
      .from('prompts')
      .update({ uses: (prompt.uses || 0) + 1 })
      .eq('id', prompt.id);
    
    return NextResponse.json({ success: true, data: prompt });
  } catch (error) {
    console.error('获取提示词详情失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}
