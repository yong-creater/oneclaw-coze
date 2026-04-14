import { MetadataRoute } from 'next';

// 提取域名，移除协议前缀
const getDomain = () => {
  const raw = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'oneclaw.shop';
  return raw.replace(/^https?:\/\//, '');
};

export default function robots(): MetadataRoute.Robots {
  const domain = getDomain();
  const baseUrl = domain;
  
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
