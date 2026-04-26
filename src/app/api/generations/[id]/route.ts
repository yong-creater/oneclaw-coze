import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用Coze内置的环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// 获取用户ID的辅助函数
function getUserId(request: NextRequest): string | null {
  const tokenCookie = request.cookies.get('user_token');
  if (tokenCookie?.value) {
    try {
      const payload = JSON.parse(Buffer.from(tokenCookie.value.split('.')[1], 'base64').toString());
      return payload.user_id || payload.sub || null;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

// GET - 获取单个生成记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('user_generations')
      .select('*')
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, generation: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE - 删除生成记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from('user_generations')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
