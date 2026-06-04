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

// POST /api/user-works - 保存到作品库
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '请先登录后保存作品' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { generation_id, image_url, prompt, ratio, model, source } = body;

    if (!image_url) {
      return NextResponse.json({ error: '图片地址不能为空' }, { status: 400 });
    }

    // 检查是否已经保存过（同 generation_id + image_url 去重）
    if (generation_id) {
      const { data: existing } = await supabase
        .from('user_works')
        .select('id')
        .eq('user_id', userId)
        .eq('generation_id', generation_id)
        .eq('image_url', image_url)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: true, work: existing, already_saved: true });
      }
    }

    const { data, error } = await supabase
      .from('user_works')
      .insert({
        user_id: userId,
        generation_id: generation_id || null,
        image_url,
        prompt: prompt || null,
        ratio: ratio || null,
        model: model || 'GPT Image 2',
        source: source || 'create_page',
      })
      .select()
      .single();

    if (error) {
      console.error('Save to works error:', error);
      return NextResponse.json({ error: '保存失败，请稍后重试' }, { status: 500 });
    }

    return NextResponse.json({ success: true, work: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// GET /api/user-works - 获取用户作品列表
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
      .from('user_works')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Load works error:', error);
      return NextResponse.json({ error: '获取作品失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, works: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
