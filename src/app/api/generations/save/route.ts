import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, prompt, ratio, referenceImageUrl } = body;

    // 从 httpOnly cookie 中获取用户 token（前端无法通过 JS 读取 httpOnly cookie）
    const userToken = request.cookies.get('user_token')?.value;

    if (!userToken) {
      return NextResponse.json({ success: false, error: '请先登录' });
    }

    const imageUrls: string[] = images || [];

    if (imageUrls.length === 0) {
      return NextResponse.json({ success: false, error: '没有可保存的作品' });
    }

    const supabase = getSupabaseClient();

    // 验证用户
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('token', userToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session?.user_id) {
      return NextResponse.json({ success: false, error: '登录已过期，请重新登录' });
    }

    // 保存到 user_generations 表
    const { error } = await supabase.from('user_generations').insert({
      user_id: session.user_id,
      tool_id: 'oneclaw-vision',
      tool_name: 'OneClaw Vision',
      tool_type: 'oneclaw-vision',
      title: (prompt || 'AI生成作品').slice(0, 50),
      thumbnail: imageUrls[0] || '',
      input_params: {
        prompt: prompt || '',
        ratio: ratio || '',
        referenceImageUrl: referenceImageUrl || '',
        count: imageUrls.length,
      },
      output_content: { image_urls: imageUrls },
    });

    if (error) {
      console.error('[保存作品] 数据库错误:', error);
      return NextResponse.json({ success: false, error: '保存失败，请稍后重试' });
    }

    return NextResponse.json({ success: true, message: '作品已保存' });
  } catch (err) {
    console.error('[保存作品] 异常:', err);
    return NextResponse.json({ success: false, error: '保存失败，请稍后重试' });
  }
}
