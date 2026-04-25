import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 获取单个模板详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json({ success: false, error: '无效的模板ID' }, { status: 400 });
    }

    const auth = await requireAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: '模板不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('获取模板详情失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败'
    }, { status: 500 });
  }
}

// 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json({ success: false, error: '无效的模板ID' }, { status: 400 });
    }

    const auth = await requireAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // 可更新字段
    const allowedFields = ['name', 'category', 'style', 'description', 'thumbnail', 'tags', 'is_active'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { error } = await client
      .from('templates')
      .update(updateData)
      .eq('id', templateId);

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新模板失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新失败'
    }, { status: 500 });
  }
}

// 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json({ success: false, error: '无效的模板ID' }, { status: 400 });
    }

    const auth = await requireAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const client = getSupabaseClient();

    const { error } = await client
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除模板失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除失败'
    }, { status: 500 });
  }
}
