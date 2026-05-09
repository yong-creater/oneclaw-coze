import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const client = getSupabaseClient();

    // 获取各表数量
    const [toolsResult, categoriesResult, tagsResult] = await Promise.all([
      client.from('tools').select('id', { count: 'exact', head: true }),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('tags').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      success: true,
      database: {
        tools: toolsResult.count || 0,
        categories: categoriesResult.count || 0,
        tags: tagsResult.count || 0,
      },
      environment: process.env.COZE_PROJECT_ENV || process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('获取数据库状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取数据库状态失败',
    }, { status: 500 });
  }
}
