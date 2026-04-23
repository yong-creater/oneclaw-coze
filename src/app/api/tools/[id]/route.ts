import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toolId = parseInt(id);

    // 获取工具详情
    const { data: tool, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (error || !tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    // 增加浏览次数
    await supabase
      .from('tools')
      .update({ view_count: (tool.view_count || 0) + 1 })
      .eq('id', toolId);

    // 获取分类信息
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', tool.category_id)
      .single();

    return NextResponse.json({
      success: true,
      data: { ...tool, category }
    });
  } catch (error) {
    console.error('Failed to fetch tool:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}
