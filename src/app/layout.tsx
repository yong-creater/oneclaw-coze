import type { Metadata, Viewport } from 'next';
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
    default: 'OneClaw - AI卖货内容生成器 | 一键生成商品详情页',
    template: '%s | OneClaw',
  },
  description:
    'OneClaw(钳爪)AI卖货内容生成器，上传商品图一键生成电商主图、卖点图、场景图、详情页，可直接上架淘宝、京东、拼多多。',
  keywords: [
    'AI卖货图生成',
    '商品详情页生成',
    '电商主图生成',
    'AI电商工具',
    '商品场景图',
    '卖点图生成',
    'AI商品图',
    '电商详情页',
    '淘宝主图',
    '拼多多主图',
    'AI商品拍摄',
    '一键生成详情页',
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
    title: 'OneClaw - AI卖货内容生成器 | 一键生成商品详情页',
    description:
      '上传商品图，一键生成电商主图、卖点图、场景图、详情页，可直接上架淘宝、京东、拼多多。',
    siteName: 'OneClaw',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneClaw - AI卖货内容生成器',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneClaw - AI卖货内容生成器',
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
  alternateName: '钳爪AI卖货内容生成器',
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
  logo: `${siteUrl}/oneclaw-logo.png`,
  description: 'AI卖货内容生成器',
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
  name: 'OneClaw AI卖货内容生成器',
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
