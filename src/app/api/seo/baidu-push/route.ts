import { NextRequest, NextResponse } from 'next/server';

// 百度主动推送 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少 urls 参数' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.BAIDU_PUSH_API_URL;

    if (!apiUrl || apiUrl.includes('YOUR_TOKEN_HERE')) {
      return NextResponse.json(
        {
          success: false,
          error: '百度推送 API 未配置',
          message: '请在 .env.local 中设置 BAIDU_PUSH_API_URL',
          hint: '格式: http://data.zz.baidu.com/urls?site=yourdomain.com&token=YOUR_TOKEN'
        },
        { status: 400 }
      );
    }

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
      message: result.message === 'success' ? '推送成功' : result.message,
      data: {
        success_count: result.success,      // 成功推送的 URL 数量
        remain: result.remain,               // 剩余推送次数
        not_same_site: result.not_same_site, // 不属于本站的 URL 数量
        not_valid: result.not_valid,         // 格式错误等无效 URL 数量
      }
    });

  } catch (error) {
    console.error('百度推送失败:', error);
    return NextResponse.json(
      { success: false, error: '推送请求失败' },
      { status: 500 }
    );
  }
}

// 获取推送额度
export async function GET() {
  const apiUrl = process.env.BAIDU_PUSH_API_URL;

  if (!apiUrl || apiUrl.includes('YOUR_TOKEN_HERE')) {
    return NextResponse.json({
      configured: false,
      message: '百度推送 API 未配置'
    });
  }

  return NextResponse.json({
    configured: true,
    message: '请使用 POST 方法推送 URL'
  });
}
