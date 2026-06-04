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

// POST /api/user-works - 保存到作品库（支持批量图片）
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '请先登录后保存作品' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { generation_id, images, prompt, ratio, model, source } = body;

    // 支持两种格式: images 数组 或 单个 image_url
    const imageUrls: string[] = images || (body.image_url ? [body.image_url] : []);

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: '保存失败，请稍后重试' }, { status: 400 });
    }

    // 批量插入所有图片
    const inserts = imageUrls.map((imageUrl: string) => ({
      user_id: userId,
      generation_id: generation_id || null,
      image_url: imageUrl,
      prompt: prompt || null,
      ratio: ratio || null,
      model: model || 'GPT Image 2',
      source: source || 'create_page',
    }));

    // 去重：检查是否已保存过
    if (generation_id) {
      const { data: existing } = await supabase
        .from('user_works')
        .select('image_url')
        .eq('user_id', userId)
        .eq('generation_id', generation_id);

      if (existing && existing.length > 0) {
        const savedUrls = new Set(existing.map((e: { image_url: string }) => e.image_url));
        const newInserts = inserts.filter((ins: { image_url: string }) => !savedUrls.has(ins.image_url));
        if (newInserts.length === 0) {
          return NextResponse.json({ success: true, already_saved: true });
        }
        // Only insert new ones
        const { data, error } = await supabase
          .from('user_works')
          .insert(newInserts)
          .select();
        if (error) {
          console.error('Save to works error:', error);
          return NextResponse.json({ error: '保存失败，请稍后重试' }, { status: 500 });
        }
        return NextResponse.json({ success: true, works: data, already_saved: true });
      }
    }

    const { data, error } = await supabase
      .from('user_works')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Save to works error:', error);
      return NextResponse.json({ error: '保存失败，请稍后重试' }, { status: 500 });
    }

    return NextResponse.json({ success: true, works: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '保存失败，请稍后重试' }, { status: 500 });
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
