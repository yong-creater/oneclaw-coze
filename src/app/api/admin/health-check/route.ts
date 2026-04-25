import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 链接健康检查API
export async function GET(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('tool_id');

    if (toolId) {
      // 检查单个工具
      const { data: tool } = await client
        .from('tools')
        .select('id, name, official_url, promotion_url')
        .eq('id', toolId)
        .single();

      if (!tool) {
        return NextResponse.json({ success: false, error: '工具不存在' }, { status: 404 });
      }

      const results = await checkUrls([
        { type: 'official', url: tool.official_url },
        ...(tool.promotion_url ? [{ type: 'promotion', url: tool.promotion_url }] : [])
      ]);

      return NextResponse.json({
        success: true,
        data: {
          tool_id: tool.id,
          tool_name: tool.name,
          checks: results
        }
      });
    }

    // 检查所有工具（分批处理）
    const { data: tools, error } = await client
      .from('tools')
      .select('id, name, official_url, promotion_url')
      .eq('is_active', true)
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const results = [];
    for (const tool of tools || []) {
      const checks = await checkUrls([
        { type: 'official', url: tool.official_url },
        ...(tool.promotion_url ? [{ type: 'promotion', url: tool.promotion_url }] : [])
      ]);

      const failedChecks = checks.filter(c => !c.healthy);
      if (failedChecks.length > 0) {
        results.push({
          tool_id: tool.id,
          tool_name: tool.name,
          issues: failedChecks
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_checked: tools?.length || 0,
        issues_found: results.length,
        issues: results
      }
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 检查URL健康状态
async function checkUrls(urls: { type: string; url: string }[]): Promise<{ type: string; url: string; healthy: boolean; status?: number; error?: string }[]> {
  const results = [];

  for (const { type, url } of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);

      results.push({
        type,
        url,
        healthy: response.ok || response.status === 403, // 403可能是防爬，不算失效
        status: response.status
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : '连接失败';
      results.push({
        type,
        url,
        healthy: false,
        error: errMsg
      });
    }
  }

  return results;
}
