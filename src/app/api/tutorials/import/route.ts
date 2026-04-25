import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 批量导入Tutorials
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const tutorials = body.tutorials;

    if (!Array.isArray(tutorials) || tutorials.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的教程数据' 
      }, { status: 400 });
    }

    // 转换数据格式
    const tutorialsToInsert = tutorials.map((t: Record<string, unknown>) => ({
      title: t.title,
      content: t.content,
      tool_id: t.tool_id || null,
      category: t.category,
      difficulty: t.difficulty || '初级',
      cover_image: t.cover_image || null,
      author: t.author || 'OneClaw官方',
      views: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 300) + 30,
      is_featured: t.is_featured || false,
      status: 'published'
    }));

    // 批量插入
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < tutorialsToInsert.length; i += batchSize) {
      const batch = tutorialsToInsert.slice(i, i + batchSize);
      const { error } = await client
        .from('tutorials')
        .insert(batch);

      if (error) {
        console.error('批量插入Tutorials失败:', error);
        return NextResponse.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 });
      }
      insertedCount += batch.length;
    }

    return NextResponse.json({ 
      success: true, 
      message: `成功导入 ${insertedCount} 个教程`,
      count: insertedCount
    });
  } catch (error) {
    console.error('导入Tutorials失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '导入失败' 
    }, { status: 500 });
  }
}
