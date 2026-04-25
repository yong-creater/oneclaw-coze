import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getToolCards, TOOL_CONFIGS } from '@/config/tools';

// 获取用户历史记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const supabase = getSupabaseClient();
    
    // 如果没有 user_id，返回所有工具作为"最近"（未登录用户）
    if (!userId) {
      // 返回最近添加的工具（模拟最近使用）
      const recentTools = getToolCards().slice(0, limit);
      return NextResponse.json({
        success: true,
        data: recentTools.map(tool => ({
          tool_id: tool.id,
          tool_name: tool.name,
          tool_description: tool.description,
          tool_icon: tool.icon,
          tool_color: tool.color,
          tool_category: tool.categoryName,
          tool_href: tool.href,
          viewed_at: new Date().toISOString(),
        })),
      });
    }
    
    // 获取用户历史
    const { data, error } = await supabase
      .from('user_history')
      .select(`
        id,
        tool_id,
        viewed_at,
        tools (
          id,
          name,
          logo,
          producer,
          highlight,
          free_type,
          category_id,
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取用户历史失败:', error);
      return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
    }
    
    // 格式化返回数据
    const formattedData = data?.map(item => ({
      id: item.id,
      tool_id: item.tool_id,
      tool_name: (item.tools as any)?.name || '',
      tool_description: (item.tools as any)?.highlight || '',
      tool_icon: '', // 可以从工具配置中获取
      tool_category: (item.tools as any)?.categories?.name || '',
      tool_href: `/tools/${item.tool_id}`,
      viewed_at: item.viewed_at,
    })) || [];
    
    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('获取用户历史失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 添加历史记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, tool_id } = body;
    
    if (!tool_id) {
      return NextResponse.json({ success: false, error: '缺少 tool_id' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient();
    
    // 如果没有 user_id（未登录用户），直接返回成功
    if (!user_id) {
      return NextResponse.json({ success: true, message: '未登录用户' });
    }
    
    // 检查是否已有记录
    const { data: existing } = await supabase
      .from('user_history')
      .select('id')
      .eq('user_id', user_id)
      .eq('tool_id', tool_id)
      .single();
    
    if (existing) {
      // 更新查看时间
      const { error: updateError } = await supabase
        .from('user_history')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('更新历史记录失败:', updateError);
        return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
      }
    } else {
      // 插入新记录
      const { error: insertError } = await supabase
        .from('user_history')
        .insert({
          user_id,
          tool_id,
          viewed_at: new Date().toISOString(),
        });
      
      if (insertError) {
        console.error('添加历史记录失败:', insertError);
        return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true, message: '记录成功' });
  } catch (error) {
    console.error('添加历史记录失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 删除历史记录
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const historyId = searchParams.get('history_id');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少 user_id' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient();
    
    if (historyId) {
      // 删除单条记录
      const { error } = await supabase
        .from('user_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('删除历史记录失败:', error);
        return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
      }
    } else {
      // 清空所有记录
      const { error } = await supabase
        .from('user_history')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('清空历史记录失败:', error);
        return NextResponse.json({ success: false, error: '清空失败' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
