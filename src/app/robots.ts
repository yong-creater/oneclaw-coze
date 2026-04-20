import { MetadataRoute } from 'next';

// 获取完整URL（带协议）- 强制使用 www
const getFullUrl = () => {
  let domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'www.oneclaw.shop';
  // 移除协议前缀
  domain = domain.replace(/^https?:\/\//, '');
  // 强制添加 www 前缀（如果没有）
  if (!domain.startsWith('www.')) {
    domain = 'www.' + domain;
  }
  return `https://${domain}`;
};

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getFullUrl();
  
  return {
    rules: [
      {
        // 所有爬虫通用规则
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          '/admin/',
          '/workspace/',
          '/membership/',
          '/auth/',
        ],
      },
      // Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot-Video',
        allow: '/',
        crawlDelay: 2,
      },
      // 百度
      {
        userAgent: 'Baiduspider',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Baiduspider-image',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'Baiduspider-video',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'Baiduspider-news',
        allow: '/',
        crawlDelay: 1,
      },
      // Bing
      {
        userAgent: 'bingbot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot-media',
        allow: '/',
        crawlDelay: 2,
      },
      // 搜狗
      {
        userAgent: 'Sogou',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Sogou Web Spider',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Sogou Pic Spider',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'Sogou Orion Spider',
        allow: '/',
        crawlDelay: 1,
      },
      // 360搜索
      {
        userAgent: '360Spider',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: '360SE',
        allow: '/',
        crawlDelay: 1,
      },
      // 神马搜索
      {
        userAgent: 'Yisouspider',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Shenma',
        allow: '/',
        crawlDelay: 1,
      },
      // 字节跳动
      {
        userAgent: 'Bytespider',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'ToutiaoSpider',
        allow: '/',
        crawlDelay: 1,
      },
      // Twitter/X
      {
        userAgent: 'Twitterbot',
        allow: '/',
        crawlDelay: 1,
      },
      // Facebook
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
