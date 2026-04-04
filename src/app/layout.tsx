import type { Metadata, Viewport } from 'next';
import { Inspector } from 'react-dev-inspector';
import Script from 'next/script';
import { Providers } from '@/components/Providers';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ef4444',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://oneclaw.shop'),
  icons: {
    icon: '/lobster-logo.png',
    shortcut: '/lobster-logo.png',
    apple: '/lobster-logo.png',
  },
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
  authors: [{ name: 'OneClaw', url: 'https://oneclaw.shop' }],
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
    url: 'https://oneclaw.shop',
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
    canonical: 'https://oneclaw.shop',
  },
  category: 'technology',
  classification: 'AI Tools Directory',
  other: {
    'applicable-device': 'pc,mobile',
    'mobile-agent': 'pc,mobile',
  },
};

// JSON-LD 结构化数据
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OneClaw',
  alternateName: '钳爪AI工具导航',
  description: '全品类AI工具导航站，精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程等14大分类',
  url: 'https://oneclaw.shop',
  inLanguage: 'zh-CN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://oneclaw.shop/?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OneClaw',
  alternateName: '钳爪',
  url: 'https://oneclaw.shop',
  logo: 'https://oneclaw.shop/lobster-logo.png',
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
      url: 'https://oneclaw.shop/tools/1',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '可灵AI',
      description: '快手推出的AI视频生成工具，支持最长2分钟视频',
      url: 'https://oneclaw.shop/tools/2',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '即梦AI',
      description: '字节跳动一站式AI视频、图片、数字人创作工具',
      url: 'https://oneclaw.shop/tools/3',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Runway',
      description: '专业级AI视频生成和编辑平台',
      url: 'https://oneclaw.shop/tools/4',
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'HeyGen',
      description: '专业AI数字人视频生成平台',
      url: 'https://oneclaw.shop/tools/5',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 百度站长验证 - 请替换为您自己的验证码 */}
        <meta name="baidu-site-verification" content="oneclaw-baidu-verify" />
        
        {/* 百度自动推送 */}
        <script
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
        
        {/* 百度统计 - 请替换为您自己的统计代码 */}
        <Script
          id="baidu-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?YOUR_BAIDU_ANALYTICS_ID";
                var s = document.getElementsByTagName("script")[0]; 
                s.parentNode.insertBefore(hm, s);
              })();
            `,
          }}
        />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
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
