import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 获取单条使用记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  const supabase = getSupabaseClient();

  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('utility_usage_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取使用记录详情异常:', error);
    return NextResponse.json({ error: '服务器异常' }, { status: 500 });
  }
}

// 删除使用记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  const supabase = getSupabaseClient();

  try {
    const { id } = await params;

    const { error } = await supabase
      .from('utility_usage_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除使用记录失败:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除使用记录异常:', error);
    return NextResponse.json({ error: '服务器异常' }, { status: 500 });
  }
}
