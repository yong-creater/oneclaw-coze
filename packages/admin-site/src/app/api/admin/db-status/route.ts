import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 获取各表数量
    const [toolsResult, categoriesResult, tagsResult] = await Promise.all([
      client.from('tools').select('id', { count: 'exact', head: true }),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('tags').select('id', { count: 'exact', head: true }),
    ]);

    // 获取环境信息
    const supabaseUrl = process.env.COZE_SUPABASE_URL || '未配置';
    
    return NextResponse.json({
      success: true,
      database: {
        url: supabaseUrl.substring(0, 60) + '...',
        connected: !toolsResult.error,
      },
      counts: {
        tools: toolsResult.count || 0,
        categories: categoriesResult.count || 0,
        tags: tagsResult.count || 0,
      },
      environment: {
        coze_env: process.env.COZE_PROJECT_ENV || '未知',
        node_env: process.env.NODE_ENV || '未知',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
