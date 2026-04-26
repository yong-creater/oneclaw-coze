import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取精选工具使用统计
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get('tool_slug');

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

    // 获取详细的调用记录（从utility_usage_logs）
    let logsQuery = supabase
      .from('utility_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (toolSlug) {
      logsQuery = logsQuery.eq('tool_type', toolSlug);
    }

    const { data: recentLogs, error: logsError } = await logsQuery;

    if (logsError) {
      console.error('Logs query error:', logsError);
    }

    // 计算总计
    const totalStats = {
      total_usage: 0,
      unique_users: 0,
      total_successes: 0,
      total_failures: 0
    };

    toolStats?.forEach((tool: any) => {
      totalStats.total_usage += parseInt(tool.total_usage) || 0;
      totalStats.unique_users += parseInt(tool.unique_users) || 0;
      totalStats.total_successes += parseInt(tool.successes) || 0;
      totalStats.total_failures += parseInt(tool.failures) || 0;
    });

    // 转换日志格式以保持前端兼容
    const formattedLogs = (recentLogs || []).map((log: any) => ({
      id: log.id,
      tool_slug: log.tool_type,
      user_id: log.user_id,
      action_type: log.status === 'success' ? 'use' : 'failed',
      input_summary: log.input_data ? JSON.stringify(log.input_data).slice(0, 100) : null,
      output_summary: log.output_data ? JSON.stringify(log.output_data).slice(0, 100) : null,
      duration_ms: null,
      created_at: log.created_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: totalStats,
        toolStats: toolStats || [],
        recentLogs: formattedLogs
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
