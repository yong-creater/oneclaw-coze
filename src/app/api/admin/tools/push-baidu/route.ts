import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';

// 批量推送所有工具页面到百度
export async function POST(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const apiUrl = process.env.BAIDU_PUSH_API_URL;

    if (!apiUrl || apiUrl.includes('YOUR_TOKEN_HERE')) {
      return NextResponse.json({
        success: false,
        message: '百度推送 API 未配置',
        hint: '请在 .env.local 中设置 BAIDU_PUSH_API_URL'
      }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneclaw.shop';

    // 生成重要页面的 URL 列表
    const urls = [
      siteUrl,
      `${siteUrl}/tools`,
      `${siteUrl}/rankings`,
      `${siteUrl}/prompts`,
      `${siteUrl}/tutorials`,
      `${siteUrl}/workspace`,
    ];

    // 调用百度主动推送 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: urls.join('\n'),
    });

    const result = await response.json();

    return NextResponse.json({
      success: result.success === 1,
      message: result.message === 'success' ? '批量推送成功' : result.message,
      data: {
        success_count: result.success,
        remain: result.remain,
        not_same_site: result.not_same_site,
        not_valid: result.not_valid,
        pushed_urls: urls,
      }
    });

  } catch (error) {
    console.error('批量推送失败:', error);
    return NextResponse.json({
      success: false,
      message: '批量推送请求失败'
    }, { status: 500 });
  }
}
