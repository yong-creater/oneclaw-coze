/**
 * GET /api/admin/stats
 * 获取统计数据
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  // 验证管理员登录（简化版，实际应使用完整认证）
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    
    // 并行获取各项统计
    const [toolsRes, usersRes, skillsRes, tutorialsRes] = await Promise.all([
      client.from('tools').select('id', { count: 'exact', head: true }),
      client.from('users').select('id', { count: 'exact', head: true }),
      client.from('skills').select('id', { count: 'exact', head: true }),
      client.from('tutorials').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tools: toolsRes.count || 0,
        users: usersRes.count || 0,
        skills: skillsRes.count || 0,
        tutorialsRes: tutorialsRes.count || 0,
        pageViews: 0,
        clicks: 0,
      }
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return NextResponse.json({ success: false, error: '获取统计失败' }, { status: 500 });
  }
}
