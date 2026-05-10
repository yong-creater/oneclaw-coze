import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// PUT /api/admin/prompts/[id] - 编辑灵感
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.is_featured !== undefined) updateData.is_featured = !!body.is_featured;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tool_slug !== undefined) updateData.tool_slug = body.tool_slug || null;
    if (body.image !== undefined) updateData.image = body.image || null;
    if (body.style !== undefined) updateData.style = body.style || null;
    if (body.views !== undefined) updateData.views = body.views;
    if (body.likes !== undefined) updateData.likes = body.likes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: '未找到该灵感' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('编辑灵感失败:', error);
    return NextResponse.json({ success: false, error: '编辑失败' }, { status: 500 });
  }
}

// DELETE /api/admin/prompts/[id] - 删除灵感
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除灵感失败:', error);
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
