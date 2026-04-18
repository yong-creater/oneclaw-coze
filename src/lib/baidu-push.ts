// 百度主动推送服务

const API_URL = process.env.BAIDU_PUSH_API_URL;

interface PushResult {
  success: boolean;
  message: string;
  data?: {
    success_count: number;
    remain: number;
    not_same_site: number;
    not_valid: number;
  };
}

/**
 * 推送 URL 到百度搜索
 * @param urls 要推送的 URL 数组
 */
export async function pushToBaidu(urls: string[]): Promise<PushResult> {
  if (!API_URL || API_URL.includes('YOUR_TOKEN_HERE')) {
    console.log('[百度推送] API 未配置，跳过推送');
    return {
      success: false,
      message: 'API 未配置'
    };
  }

  try {
    const response = await fetch('/api/seo/baidu-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    const result = await response.json();
    console.log('[百度推送] 推送结果:', result);
    return result;
  } catch (error) {
    console.error('[百度推送] 推送失败:', error);
    return {
      success: false,
      message: '推送请求失败'
    };
  }
}

/**
 * 推送工具详情页到百度
 */
export async function pushToolPage(toolId: number, toolSlug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneclaw.shop';
  const urls = [
    `${siteUrl}/tools/${toolId}`,
    toolSlug ? `${siteUrl}/tools/${toolSlug}` : null,
  ].filter(Boolean) as string[];

  return pushToBaidu(urls);
}

/**
 * 推送首页
 */
export async function pushHomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneclaw.shop';
  return pushToBaidu([siteUrl]);
}
