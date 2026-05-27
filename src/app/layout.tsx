import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Providers } from '@/components/site/common/Providers';
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
  themeColor: '#0f0f10',
};

const domain = getDomain();
const siteUrl = `https://${domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OneClaw - AI 内容创作平台',
    template: '%s | OneClaw',
  },
  description:
    'OneClaw 是一个 AI 视觉创作平台，输入一句话，生成海报、人物、品牌包装、插画等任何视觉内容。',
  keywords: [
    'AI创作平台',
    'AI视觉创作',
    'AI海报设计',
    'AI品牌设计',
    'AI图片生成',
    'AI创作工具',
    'AI插画生成',
    '视觉内容生成',
    'AI设计工具',
    'AI图像生成',
    'AI绘画',
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
    title: 'OneClaw - AI 视觉创作平台',
    description:
      'OneClaw 是一个 AI 视觉创作平台，输入一句话，生成海报、人物、品牌包装、插画等任何视觉内容。',
    siteName: 'OneClaw',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneClaw - AI 内容创作平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneClaw - AI 视觉创作平台',
    description:
      '上传商品图，一键生成电商主图、卖点图、场景图、详情页。',
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
    icon: '/icon',
    shortcut: '/icon',
    apple: '/apple-icon',
  },
};

// JSON-LD 结构化数据
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OneClaw',
  alternateName: 'OneClaw AI 内容创作平台',
  description: '上传商品图，一键生成电商主图、卖点图、场景图、详情页',
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
  logo: `${siteUrl}/favicon.png`,
  description: 'OneClaw AI 内容创作平台',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: '1017760688@qq.com',
  },
  sameAs: [],
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OneClaw AI 内容创作平台',
  applicationCategory: 'BusinessApplication',
  description: '上传商品图，一键生成电商主图、卖点图、场景图、详情页',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  const baiduAnalyticsId = process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID || '';
  const baiduSiteVerification = process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION || '';
  const googleAdSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '';

  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
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
              __html: [
                "var _hmt = _hmt || [];",
                "(function() {",
                "  var hm = document.createElement('script');",
                "  hm.src = 'https://hm.baidu.com/hm.js?" + baiduAnalyticsId + "';",
                "  var s = document.getElementsByTagName('script')[0];",
                "  s.parentNode.insertBefore(hm, s);",
                "})();"
              ].join('\n'),
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
        <Providers>{children}</Providers>

        {/* Google AdSense (暂时禁用，待配置好 ID 后启用)
        {googleAdSenseId && (
          <Script
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdSenseId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        */}
      </body>
    </html>
  );
}
