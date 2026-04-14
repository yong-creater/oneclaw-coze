/**
 * GET /api/admin/health-check
 * 检查工具链接健康状态
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    
    // 获取所有工具的链接
    const { data: tools } = await client
      .from('tools')
      .select('id, name, official_url, promotion_url');
    
    if (!tools) {
      return NextResponse.json({ success: true, data: { total: 0, healthy: 0, failed: 0 } });
    }

    let healthy = 0;
    let failed = 0;

    // 检查链接（异步，不阻塞响应）
    const checkPromises = tools.map(async (tool) => {
      const urls = [tool.official_url, tool.promotion_url].filter(Boolean);
      
      for (const url of urls) {
        try {
          const res = await fetch(url!, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          if (res.ok) healthy++;
          else failed++;
        } catch {
          failed++;
        }
      }
    });

    await Promise.all(checkPromises);

    return NextResponse.json({
      success: true,
      data: {
        total: healthy + failed,
        healthy,
        failed,
      }
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);
    return NextResponse.json({ success: false, error: '检查失败' }, { status: 500 });
  }
}
