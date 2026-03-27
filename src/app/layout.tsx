import type { Metadata, Viewport } from 'next';
import { Inspector } from 'react-dev-inspector';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ef4444',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://oneclaw.shop'),
  title: {
    default: 'OneClaw - 精选66+优质AI视频创作工具推荐',
    template: '%s | OneClaw',
  },
  description:
    'OneClaw精心整理66+款优质AI视频创作工具，涵盖AI视频生成(Runway、Pika、Sora)、视频编辑(剪映、Descript)、数字人(HeyGen、D-ID)等类别，助力创作者高效制作视频内容。',
  keywords: [
    'AI视频工具',
    'AI视频生成',
    'AI视频编辑',
    'AI数字人',
    '文生视频',
    '图生视频',
    'Runway',
    'Pika Labs',
    'Sora',
    'HeyGen',
    '剪映',
    'CapCut',
    'AI制作视频',
    '视频剪辑工具',
    'AI配音',
    '智能字幕',
    '视频增强',
    '免费视频工具',
    '视频创作者工具',
    '2024 AI工具',
  ],
  authors: [{ name: 'OneClaw', url: 'https://oneclaw.shop' }],
  creator: 'OneClaw',
  publisher: 'OneClaw',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'OneClaw - 精选66+优质AI视频创作工具推荐',
    description:
      'OneClaw精心整理66+款优质AI视频创作工具，涵盖AI视频生成、视频编辑、数字人、AI字幕、AI配音等类别，助力创作者高效制作视频内容。',
    url: 'https://oneclaw.shop',
    siteName: 'OneClaw',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI视频工具集合 - 精选优质AI视频创作工具',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneClaw - 精选66+优质AI视频创作工具推荐',
    description:
      '精选66+款优质AI视频创作工具，涵盖视频生成、编辑、数字人、字幕、配音等类别。',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://oneclaw.shop',
  },
  category: 'technology',
  classification: 'AI Tools Directory',
  other: {
    'baidu-site-verification': 'your-baidu-verification-code',
  },
};

// JSON-LD 结构化数据
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OneClaw',
  description: '精选优质AI视频创作工具，助力创意视频制作',
  url: 'https://oneclaw.shop',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://oneclaw.shop/?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OneClaw',
  url: 'https://oneclaw.shop',
  logo: 'https://oneclaw.shop/logo.png',
  description: '精选优质AI视频创作工具',
  sameAs: [],
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AI视频工具推荐',
  description: '精选AI视频创作工具列表',
  numberOfItems: 66,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Runway',
      description: '专业的AI视频生成和编辑平台',
      url: 'https://runwayml.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Pika Labs',
      description: '强大的AI视频生成工具',
      url: 'https://pika.art/',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Sora',
      description: 'OpenAI推出的AI视频生成模型',
      url: 'https://openai.com/sora',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Kling 可灵',
      description: '快手推出的AI视频生成模型',
      url: 'https://klingai.kuaishou.com/',
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'HeyGen',
      description: 'AI数字人视频生成平台',
      url: 'https://www.heygen.com/',
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
    <html lang="zh-CN">
      <head>
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
      <body className="antialiased">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
