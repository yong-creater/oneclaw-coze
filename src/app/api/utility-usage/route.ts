import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 记录工具使用
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { tool_slug, user_id, session_id, action_type, input_summary, output_summary, duration_ms } = body;

    if (!tool_slug || !action_type) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const { error } = await supabase
      .from('utility_usage_stats')
      .insert({
        tool_slug,
        user_id: user_id || null,
        session_id: session_id || null,
        action_type,
        input_summary: input_summary || null,
        output_summary: output_summary || null,
        duration_ms: duration_ms || null
      });

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: '记录失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
