import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个工具详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toolId = parseInt(id);

    if (isNaN(toolId)) {
      return NextResponse.json({ success: false, error: '无效的工具ID' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    const { data: tool, error } = await supabase
      .from('tools')
      .select('*, categories(name, slug)')
      .eq('id', toolId)
      .eq('is_active', true)
      .single();

    if (error || !tool) {
      return NextResponse.json({ success: false, error: '工具不存在' }, { status: 404 });
    }

    // 异步增加浏览量（不阻塞响应）
    supabase
      .from('tools')
      .update({ view_count: (tool.view_count || 0) + 1 })
      .eq('id', toolId)
      .then(() => {}, () => {});

    return NextResponse.json({
      success: true,
      data: {
        ...tool,
        view_count: (tool.view_count || 0) + 1
      }
    }, {
      headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error('获取工具详情失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
