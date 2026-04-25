import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { OUR_TOOLS, getToolById } from '@/config/tools';

// 获取用户收藏
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    const supabase = getSupabaseClient();
    
    // 如果没有 user_id，返回空（未登录用户无收藏）
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
    
    // 获取用户收藏
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        tool_id,
        created_at,
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
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取用户收藏失败:', error);
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
      created_at: item.created_at,
    })) || [];
    
    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('获取用户收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, tool_id } = body;
    
    if (!user_id || !tool_id) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient();
    
    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('tool_id', tool_id)
      .single();
    
    if (existing) {
      return NextResponse.json({ success: true, message: '已收藏' });
    }
    
    // 添加收藏
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id,
        tool_id,
      });
    
    if (error) {
      console.error('添加收藏失败:', error);
      return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: '收藏成功' });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const toolId = searchParams.get('tool_id');
    
    if (!userId || !toolId) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', parseInt(toolId));
    
    if (error) {
      console.error('取消收藏失败:', error);
      return NextResponse.json({ success: false, error: '取消失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: '取消成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
