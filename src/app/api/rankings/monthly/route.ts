import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取月度榜单列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // 查询参数
    const month = searchParams.get('month'); // YYYY-MM 格式
    const region = searchParams.get('region') || 'global'; // global, china
    const type = searchParams.get('type') || 'hot'; // hot, growth, category, all
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'rank'; // rank, visits, growth_rate
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // 获取最新月份（如果没有指定月份）
    let targetMonth = month;
    if (!targetMonth) {
      const { data: latestData } = await client
        .from('monthly_rankings')
        .select('stats_month')
        .order('stats_month', { ascending: false })
        .limit(1);
      
      if (latestData && latestData.length > 0) {
        targetMonth = latestData[0].stats_month;
      } else {
        // 如果没有数据，使用当前月份
        const now = new Date();
        targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    }
    
    // 构建查询
    let query = client
      .from('monthly_rankings')
      .select('*', { count: 'exact' })
      .eq('stats_month', targetMonth)
      .eq('data_status', 'valid');
    
    // 地区筛选 - china 模式只显示 source_flag='cn' 的数据，global 模式显示所有数据
    if (region === 'china') {
      query = query.eq('source_flag', 'cn');
    }
    
    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    // 搜索
    if (search) {
      query = query.or(`tool_name.ilike.%${search}%,tool_description.ilike.%${search}%`);
    }
    
    // 排序 - 根据地区使用对应的 rank 字段
    switch (sortBy) {
      case 'visits':
        query = query.order('monthly_visits_num', { ascending: sortOrder === 'asc' });
        break;
      case 'growth_rate':
        query = query.order('growth_rate_num', { ascending: sortOrder === 'asc' });
        break;
      default:
        // 根据地区选择对应的 rank 字段
        if (region === 'china') {
          query = query.order('country_rank', { ascending: true });
        } else {
          query = query.order('global_rank', { ascending: true });
        }
    }
    
    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data: rankings, error, count } = await query;
    
    if (error) {
      console.error('获取榜单失败:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    // 处理返回数据，根据地区返回对应的 rank
    const processedRankings = (rankings || []).map((item: any) => ({
      ...item,
      display_rank: region === 'china' ? item.country_rank : item.global_rank,
      display_rank_change: region === 'china' ? item.country_rank_change : item.global_rank_change,
    }));
    
    // 获取可选月份列表
    const { data: monthsData } = await client
      .from('monthly_rankings')
      .select('stats_month')
      .order('stats_month', { ascending: false });
    
    const availableMonths = [...new Set(monthsData?.map(m => m.stats_month) || [])];
    
    // 获取可选分类列表
    const { data: categoriesData } = await client
      .from('monthly_rankings')
      .select('category')
      .eq('stats_month', targetMonth)
      .eq('data_status', 'valid')
      .not('category', 'is', null);
    
    const availableCategories = [...new Set(categoriesData?.map(c => c.category) || [])];
    
    // 计算分页信息
    const totalPages = Math.ceil((count || 0) / limit);
    
    return NextResponse.json({
      success: true,
      data: processedRankings,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
      },
      meta: {
        current_month: targetMonth,
        available_months: availableMonths,
        available_categories: availableCategories,
        region,
      },
    }, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
    });
  } catch (error: any) {
    console.error('获取榜单失败:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 批量导入榜单数据
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { 
      month, // YYYY-MM 格式
      tools, // 工具数据数组
      mode = 'replace' // replace替换、append追加
    } = body;
    
    if (!month || !tools || !Array.isArray(tools)) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数：month 和 tools' 
      }, { status: 400 });
    }
    
    // 验证月份格式
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ 
        success: false, 
        error: '月份格式错误，应为 YYYY-MM' 
      }, { status: 400 });
    }
    
    // 如果是替换模式，先删除该月份数据
    if (mode === 'replace') {
      await client
        .from('monthly_rankings')
        .delete()
        .eq('stats_month', month);
    }
    
    // 格式化并插入数据
    const formattedTools = tools.map((tool: any, index: number) => ({
      rank: tool.rank || index + 1,
      rank_change: tool.rank_change || 0,
      tool_id: tool.tool_id || null,
      tool_name: tool.tool_name || tool.name,
      tool_url: tool.tool_url || tool.url,
      tool_logo: tool.tool_logo || tool.logo,
      tool_logo_backup: tool.tool_logo_backup || tool.logo_backup,
      tool_description: tool.tool_description || tool.description,
      monthly_visits: tool.monthly_visits || tool.visits,
      monthly_visits_num: parseVisitsToNumber(tool.monthly_visits || tool.visits),
      growth: tool.growth,
      growth_num: tool.growth_num || parseGrowthToNumber(tool.growth),
      growth_rate: tool.growth_rate,
      growth_rate_num: parseFloat(tool.growth_rate?.replace('%', '') || '0'),
      global_rank: tool.global_rank,
      global_rank_change: tool.global_rank_change || 0,
      country_rank: tool.country_rank,
      country_rank_change: tool.country_rank_change || 0,
      category: tool.category,
      tags: tool.tags || [],
      source_flag: tool.source_flag || 'manual',
      data_status: 'valid',
      stats_month: month,
    }));
    
    const { data, error } = await client
      .from('monthly_rankings')
      .insert(formattedTools)
      .select();
    
    if (error) {
      console.error('导入榜单失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: `导入失败: ${error.message}`,
        details: error 
      }, { status: 500 });
    }
    
    // 记录更新日志
    await client
      .from('ranking_update_logs')
      .insert({
        update_month: month,
        update_type: 'manual',
        status: 'success',
        total_count: tools.length,
        error_count: 0,
      });
    
    return NextResponse.json({
      success: true,
      message: `成功导入 ${data?.length || 0} 条数据`,
      data: data,
    });
  } catch (error: any) {
    console.error('导入榜单失败:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 辅助函数：解析访问量字符串为数字
function parseVisitsToNumber(visits: string | number | null): number | null {
  if (!visits) return null;
  if (typeof visits === 'number') return visits;
  
  const str = String(visits).toUpperCase().trim();
  const match = str.match(/^([\d.]+)([KMB])?$/);
  
  if (!match) return null;
  
  const num = parseFloat(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'K': return Math.round(num * 1000);
    case 'M': return Math.round(num * 1000000);
    case 'B': return Math.round(num * 1000000000);
    default: return Math.round(num);
  }
}

// 辅助函数：解析增长值为数字
function parseGrowthToNumber(growth: string | number | null): number | null {
  if (!growth) return null;
  if (typeof growth === 'number') return growth;
  
  const str = String(growth).toUpperCase().trim();
  const match = str.match(/^([+-]?[\d.]+)([KMB])?$/);
  
  if (!match) return null;
  
  const num = parseFloat(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'K': return Math.round(num * 1000);
    case 'M': return Math.round(num * 1000000);
    case 'B': return Math.round(num * 1000000000);
    default: return num;
  }
}
