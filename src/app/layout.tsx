import type { Metadata, Viewport } from 'next';
import { Inspector } from 'react-dev-inspector';
import Script from 'next/script';
import { Providers } from '@/components/common/Providers';
import './globals.css';

// 提取域名，移除协议前缀
const getDomain = () => {
  const raw = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'oneclaw.shop';
  return raw.replace(/^https?:\/\//, '');
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ef4444',
};

const domain = getDomain();
const siteUrl = `https://${domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OneClaw - 全品类AI工具导航 | 精选238款优质AI工具',
    template: '%s | OneClaw AI工具导航',
  },
  description:
    'OneClaw(钳爪)是全品类AI工具导航站，精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程、AI音频、AI办公等14大分类。提供工具对比、评分评价、教程资源，助您快速找到最适合的AI工具。',
  keywords: [
    'AI工具导航',
    'AI工具推荐',
    'AI工具大全',
    'AI视频生成',
    'AI图像创作',
    'AI写作助手',
    'AI编程工具',
    'AI数字人',
    'AI配音',
    'AI音频',
    '提示词模板',
    'Sora',
    'Runway',
    '可灵AI',
    '即梦AI',
    'Midjourney',
    'ChatGPT',
    'Claude',
    '免费AI工具',
    '2025 AI工具',
    'AI工具排行榜',
  ],
  authors: [{ name: 'OneClaw' }],
  creator: 'OneClaw',
  publisher: 'OneClaw',
  applicationName: 'OneClaw',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'OneClaw - 全品类AI工具导航 | 精选238款优质AI工具',
    description:
      '精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程等14大分类。提供工具对比、评分评价、教程资源。',
    siteName: 'OneClaw',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneClaw - 全品类AI工具导航',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneClaw - 全品类AI工具导航',
    description:
      '精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程等14大分类。',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl.includes('www') ? siteUrl : siteUrl.replace('://', '://www.'),
  },
  category: 'technology',
  classification: 'AI Tools Directory',
  other: {
    'applicable-device': 'pc,mobile',
    'mobile-agent': 'pc,mobile',
  },
  icons: {
    icon: '/favicon.png?v=2',
    shortcut: '/favicon.png?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
};

// JSON-LD 结构化数据
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OneClaw',
  alternateName: '钳爪AI工具导航',
  description: '全品类AI工具导航站，精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程等14大分类',
  url: siteUrl,
  inLanguage: 'zh-CN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OneClaw',
  alternateName: '钳爪',
  url: siteUrl,
  logo: `${siteUrl}/oneclaw-logo.png`,
  description: '全品类AI工具导航平台',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: '1017760688@qq.com',
  },
  sameAs: [],
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AI工具推荐 - OneClaw精选',
  description: '精选热门AI工具，涵盖视频生成、数字人、AI绘画、AI写作等',
  numberOfItems: 238,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Sora - OpenAI视频生成',
      description: 'OpenAI推出的革命性AI视频生成工具',
      url: `${siteUrl}/tools/1`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '可灵AI',
      description: '快手推出的AI视频生成工具，支持最长2分钟视频',
      url: `${siteUrl}/tools/2`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '即梦AI',
      description: '字节跳动一站式AI视频、图片、数字人创作工具',
      url: `${siteUrl}/tools/3`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Runway',
      description: '专业级AI视频生成和编辑平台',
      url: `${siteUrl}/tools/4`,
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'HeyGen',
      description: '专业AI数字人视频生成平台',
      url: `${siteUrl}/tools/5`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  const baiduAnalyticsId = process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID || '';
  const baiduSiteVerification = process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION || '';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* 百度站长验证 - 硬编码确保生效 */}
        <meta name="baidu-site-verification" content="codeva-Guh6a5UTE1" />
        
        {/* 360搜索收录 */}
        <meta name="360-site-verification" content="360-site-verification-code" />
        
        {/* 神马搜索收录 */}
        <meta name="shenma-site-verification" content="shenma-site-verification-code" />
        
        {/* 搜狗搜索收录 */}
        <meta name="sogou_site_verification" content="sogou-site-verification-code" />
        
        {/* 字节跳动搜索收录 */}
        <meta name="bytedance-site-verification" content="bytedance-site-verification-code" />
        
        {/* 百度自动推送 */}
        <Script
          id="baidu-push"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var bp = document.createElement('script');
                var curProtocol = window.location.protocol.split(':')[0];
                if (curProtocol === 'https') {
                  bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
                } else {
                  bp.src = 'http://push.zhanzhang.baidu.com/push.js';
                }
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(bp, s);
              })();
            `,
          }}
        />
        
        {/* 百度统计 - 使用 afterInteractive 策略避免 hydration mismatch */}
        {baiduAnalyticsId && (
          <Script
            id="baidu-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement('script');
                hm.src = 'https://hm.baidu.com/hm.js?${baiduAnalyticsId}';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(hm, s);
              })();
            `,
            }}
          />
        )}
        
	        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        
        {/* 结构化数据 */}
        <Script
          id="jsonld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="jsonld-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="jsonld-itemlist"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {isDev && <Inspector />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
