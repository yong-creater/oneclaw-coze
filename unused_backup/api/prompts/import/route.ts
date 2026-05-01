import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 批量导入Prompts
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const prompts = body.prompts;

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的Prompt数据' 
      }, { status: 400 });
    }

    // 转换数据格式
    const promptsToInsert = prompts.map((p: Record<string, unknown>) => ({
      title: p.title,
      content: p.content,
      tool_id: p.tool_id || null,
      category: p.category,
      tags: p.tags || [],
      author: p.author || 'OneClaw官方',
      uses: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 200) + 20,
      status: 'published'
    }));

    // 批量插入
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < promptsToInsert.length; i += batchSize) {
      const batch = promptsToInsert.slice(i, i + batchSize);
      const { error } = await client
        .from('prompts')
        .insert(batch);

      if (error) {
        console.error('批量插入Prompts失败:', error);
        return NextResponse.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 });
      }
      insertedCount += batch.length;
    }

    return NextResponse.json({ 
      success: true, 
      message: `成功导入 ${insertedCount} 个Prompt模板`,
      count: insertedCount
    });
  } catch (error) {
    console.error('导入Prompts失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '导入失败' 
    }, { status: 500 });
  }
}
