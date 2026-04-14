import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个工具详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('获取工具失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取工具失败' 
    }, { status: 500 });
  }
}

// 更新工具
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const body = await request.json();

    const updateData = {
      name: body.name,
      logo: body.logo,
      producer: body.producer,
      highlight: body.highlight,
      category_id: body.category_id,
      sub_category_ids: body.sub_category_ids || [],
      free_type: body.free_type,
      free_quota_desc: body.free_quota_desc,
      feature_tags: body.feature_tags || [],
      max_duration: body.max_duration,
      official_url: body.official_url,
      promotion_url: body.promotion_url,
      is_official: body.is_official || false,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false,
      advantages: body.advantages || [],
      limitations: body.limitations || [],
      commercial_license: body.commercial_license,
      launch_date: body.launch_date,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('更新工具失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '更新工具失败' 
    }, { status: 500 });
  }
}

// 删除工具
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    // 先删除相关的收藏和评分
    await supabase.from('user_favorites').delete().eq('tool_id', id);
    await supabase.from('user_ratings').delete().eq('tool_id', id);

    // 删除工具
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '删除成功' 
    });
  } catch (error) {
    console.error('删除工具失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '删除工具失败' 
    }, { status: 500 });
  }
}
