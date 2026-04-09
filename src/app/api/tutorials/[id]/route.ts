import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个教程详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    
    const { data: tutorial, error } = await client
      .from('tutorials')
      .select('*, tools(id, name, logo)')
      .eq('id', parseInt(id))
      .eq('status', 'published')
      .single();
    
    if (error || !tutorial) {
      return NextResponse.json({ 
        success: false, 
        error: '教程不存在' 
      }, { status: 404 });
    }
    
    // 增加浏览量
    await client
      .from('tutorials')
      .update({ views: (tutorial.views || 0) + 1 })
      .eq('id', tutorial.id);
    
    return NextResponse.json({ success: true, data: tutorial });
  } catch (error) {
    console.error('获取教程详情失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

// 更新教程（点赞）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    
    if (body.action === 'like') {
      const { data: tutorial } = await client
        .from('tutorials')
        .select('likes')
        .eq('id', parseInt(id))
        .single();
      
      if (!tutorial) {
        return NextResponse.json({ success: false, error: '教程不存在' }, { status: 404 });
      }
      
      await client
        .from('tutorials')
        .update({ likes: (tutorial.likes || 0) + 1 })
        .eq('id', parseInt(id));
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: '无效操作' }, { status: 400 });
  } catch (error) {
    console.error('更新教程失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
