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

// GET /api/generation-records - 加载用户的生成历史
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const { data, error } = await supabase
      .from('generation_records')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Load generation records error:', error);
      return NextResponse.json({ error: '加载记录失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, records: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST /api/generation-records - 保存生成记录
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { prompt, images, ratio, model, source, status, reference_image_url } = body;

    if (!prompt || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('generation_records')
      .insert({
        user_id: userId,
        prompt,
        images: JSON.stringify(images),
        ratio: ratio || '1:1',
        model: model || 'GPT Image 2',
        source: source || 'create_page',
        status: status || 'completed',
        reference_image_url: reference_image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Save generation record error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
