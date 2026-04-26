import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取精选工具使用统计
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get('tool_slug'); // 可选：获取特定工具统计

    // 获取所有工具的使用统计（从视图）
    let query = supabase
      .from('utility_tool_stats')
      .select('*');

    if (toolSlug) {
      query = query.eq('tool_slug', toolSlug);
    }

    const { data: toolStats, error: statsError } = await query;

    if (statsError) {
      console.error('Stats query error:', statsError);
      return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
    }

    // 获取详细的调用记录
    let logsQuery = supabase
      .from('utility_usage_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (toolSlug) {
      logsQuery = logsQuery.eq('tool_slug', toolSlug);
    }

    const { data: recentLogs, error: logsError } = await logsQuery;

    if (logsError) {
      console.error('Logs query error:', logsError);
    }

    // 计算总计
    const totalStats = {
      total_usage: 0,
      unique_users: 0,
      total_opens: 0,
      total_uses: 0,
      total_generations: 0
    };

    toolStats?.forEach((tool: any) => {
      totalStats.total_usage += parseInt(tool.total_usage) || 0;
      totalStats.unique_users += parseInt(tool.unique_users) || 0;
      totalStats.total_opens += parseInt(tool.opens) || 0;
      totalStats.total_uses += parseInt(tool.uses) || 0;
      totalStats.total_generations += parseInt(tool.generations) || 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: totalStats,
        toolStats: toolStats || [],
        recentLogs: recentLogs || []
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
