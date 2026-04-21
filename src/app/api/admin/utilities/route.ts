import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 检查Supabase配置
const isConfigured = supabaseUrl && supabaseKey;
const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// 保存使用记录
export async function POST(request: NextRequest) {
  // 如果未配置Supabase，返回成功但不保存
  if (!isConfigured || !supabase) {
    return NextResponse.json({ success: true, message: 'Supabase not configured, log not saved' });
  }

  try {
    const { tool_type, user_id, input_data, output_data, status, error_message } = await request.json();

    if (!tool_type) {
      return NextResponse.json({ error: '缺少工具类型' }, { status: 400 });
    }

    // 获取客户端信息
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const { data, error } = await supabase
      .from('utility_usage_logs')
      .insert({
        tool_type,
        user_id: user_id || null,
        input_data: input_data || null,
        output_data: output_data || null,
        status: status || 'success',
        error_message: error_message || null,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('保存使用记录失败:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('保存使用记录异常:', error);
    return NextResponse.json({ error: '服务器异常' }, { status: 500 });
  }
}

// 获取使用记录列表
export async function GET(request: NextRequest) {
  // 如果未配置Supabase，返回空数据
  if (!isConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
      stats: {
        resume: { total: 0, success: 0, failed: 0 },
        novel: { total: 0, success: 0, failed: 0 },
        product_page: { total: 0, success: 0, failed: 0 }
      }
    });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const tool_type = searchParams.get('tool_type');  // resume, novel, product_page, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let query = supabase
      .from('utility_usage_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (tool_type && tool_type !== 'all') {
      query = query.eq('tool_type', tool_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date + 'T23:59:59Z');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取使用记录失败:', error);
      return NextResponse.json({ error: '获取失败' }, { status: 500 });
    }

    // 获取统计数据
    const statsQuery = supabase
      .from('utility_usage_logs')
      .select('tool_type, status');

    let statsFilteredQuery = supabase
      .from('utility_usage_logs')
      .select('tool_type, status');

    if (tool_type && tool_type !== 'all') {
      statsFilteredQuery = statsFilteredQuery.eq('tool_type', tool_type);
    }

    const { data: statsData } = await statsFilteredQuery;

    // 计算各工具的使用统计
    const toolStats: Record<string, { total: number; success: number; failed: number }> = {};
    const toolTypes = ['resume', 'novel', 'product_page'];

    for (const type of toolTypes) {
      const typeData = statsData?.filter(d => d.tool_type === type) || [];
      toolStats[type] = {
        total: typeData.length,
        success: typeData.filter(d => d.status === 'success').length,
        failed: typeData.filter(d => d.status === 'failed').length
      };
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      },
      stats: toolStats
    });
  } catch (error) {
    console.error('获取使用记录异常:', error);
    return NextResponse.json({ error: '服务器异常' }, { status: 500 });
  }
}
