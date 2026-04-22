import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// PUT - 更新广告
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    
    // 构建更新对象
    const updateData: Record<string, unknown> = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.link_url !== undefined) updateData.link_url = body.link_url;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.starts_at !== undefined) updateData.starts_at = body.starts_at;
    if (body.ends_at !== undefined) updateData.ends_at = body.ends_at;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_highlight !== undefined) updateData.is_highlight = body.is_highlight;
    if (body.target_category !== undefined) updateData.target_category = body.target_category;
    
    const { data, error } = await client
      .from('advertisements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新广告失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// DELETE - 删除广告
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    
    const { error } = await client
      .from('advertisements')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除广告失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
