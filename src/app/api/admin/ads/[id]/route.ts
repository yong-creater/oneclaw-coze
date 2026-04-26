import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// PUT - 更新广告
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, Permissions.ADS_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    
    // 输入安全检查
    if (body.title && (containsXss(body.title) || containsSqlInjection(body.title))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await client
      .from('advertisements')
      .select('title')
      .eq('id', id)
      .single();

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
      await logFailure(auth.user, 'UPDATE', 'AD', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    await logSuccess(auth.user, 'UPDATE', 'AD', id, oldData?.title || body.title, { changes: Object.keys(updateData) }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新广告失败:', error);
    await logFailure(auth.user, 'UPDATE', 'AD', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// DELETE - 删除广告
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, Permissions.ADS_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    
    // 获取删除前的数据用于日志
    const { data: adData } = await client
      .from('advertisements')
      .select('title')
      .eq('id', id)
      .single();

    const { error } = await client
      .from('advertisements')
      .delete()
      .eq('id', id);
    
    if (error) {
      await logFailure(auth.user, 'DELETE', 'AD', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    await logSuccess(auth.user, 'DELETE', 'AD', id, adData?.title || 'Unknown', {}, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除广告失败:', error);
    await logFailure(auth.user, 'DELETE', 'AD', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
