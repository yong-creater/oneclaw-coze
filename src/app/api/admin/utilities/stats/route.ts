import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 检查Supabase配置
const isConfigured = supabaseUrl && supabaseKey;
const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// 获取实用工具统计
export async function GET(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  // 如果未配置Supabase，返回空数据
  if (!isConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      data: {
        total: 0,
        success: 0,
        failed: 0,
        today: 0,
        yesterday: 0,
        thisWeek: 0,
        growth: '0',
        toolStats: {
          resume: { total: 0, success: 0, failed: 0 },
          novel: { total: 0, success: 0, failed: 0 },
          product_page: { total: 0, success: 0, failed: 0 }
        },
        trend: [],
        recentLogs: []
      }
    });
  }

  try {
    // 获取今日数据
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const thisWeekStart = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    // 获取总体统计
    const { data: allData } = await supabase
      .from('utility_usage_logs')
      .select('tool_type, status, created_at');

    // 计算统计数据
    const total = allData?.length || 0;
    const successCount = allData?.filter(d => d.status === 'success').length || 0;
    const failedCount = allData?.filter(d => d.status === 'failed').length || 0;

    // 今日统计
    const todayCount = allData?.filter(d => d.created_at.startsWith(today)).length || 0;
    const yesterdayCount = allData?.filter(d => d.created_at.startsWith(yesterday)).length || 0;
    const thisWeekCount = allData?.filter(d => d.created_at >= thisWeekStart).length || 0;

    // 各工具统计
    const toolStats: Record<string, { total: number; success: number; failed: number }> = {};
    const toolTypes = ['resume', 'novel', 'product_page'];

    for (const type of toolTypes) {
      const typeData = allData?.filter(d => d.tool_type === type) || [];
      toolStats[type] = {
        total: typeData.length,
        success: typeData.filter(d => d.status === 'success').length,
        failed: typeData.filter(d => d.status === 'failed').length
      };
    }

    // 最近7天的使用趋势
    const trend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const count = allData?.filter(d => d.created_at.startsWith(date)).length || 0;
      trend.push({ date, count });
    }

    // 获取最近的记录
    const { data: recentLogs } = await supabase
      .from('utility_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        total,
        success: successCount,
        failed: failedCount,
        today: todayCount,
        yesterday: yesterdayCount,
        thisWeek: thisWeekCount,
        growth: yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount * 100).toFixed(1) : '0',
        toolStats,
        trend,
        recentLogs: recentLogs || []
      }
    });
  } catch (error) {
    console.error('获取实用工具统计异常:', error);
    return NextResponse.json({ error: '服务器异常' }, { status: 500 });
  }
}
