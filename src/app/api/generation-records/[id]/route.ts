import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyUserToken } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

async function getUserId(request: NextRequest): Promise<string | null> {
  const tokenCookie = request.cookies.get('user_token');
  if (!tokenCookie?.value) return null;
  try {
    const user = await verifyUserToken(tokenCookie.value);
    return user?.user_id || null;
  } catch {
    return null;
  }
}

// DELETE /api/generation-records/[id] - 删除单条生成记录
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(_request);
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: '请提供记录ID' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('generation_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete generation record error:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
