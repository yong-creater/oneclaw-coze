import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取会员信息
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少user_id参数' }, { status: 400 });
    }

    const { data: member, error } = await client
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 如果没有会员记录，创建免费会员
    if (!member) {
      const { data: newMember, error: createError } = await client
        .from('members')
        .insert({ user_id: userId, level: 'free' })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: newMember });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('获取会员信息失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 升级会员
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { user_id, level, duration_days } = body;

    if (!user_id || !level || !duration_days) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 计算到期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration_days);

    const { data, error } = await client
      .from('members')
      .upsert({
        user_id,
        level,
        expires_at: expiresAt.toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('升级会员失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
