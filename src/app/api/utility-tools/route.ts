import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取精选工具分组和工具（公开接口）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // 获取所有活跃分组
    const { data: groups, error: groupError } = await supabase
      .from('utility_groups')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (groupError) {
      return NextResponse.json({ error: '获取分组失败' }, { status: 500 });
    }

    // 获取所有活跃工具
    const { data: tools, error: toolError } = await supabase
      .from('utility_tools')
      .select('*, utility_groups(name, slug, icon, color)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (toolError) {
      return NextResponse.json({ error: '获取工具失败' }, { status: 500 });
    }

    // 按分组组织数据
    const groupedData = groups.map(group => ({
      ...group,
      tools: tools.filter(t => t.group_id === group.id)
    }));

    return NextResponse.json({
      groups: groupedData,
      tools: tools || []
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
