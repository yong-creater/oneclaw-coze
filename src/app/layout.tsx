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
  title: {
    default: 'OneClaw - 一站式 AI 工具与资源导航平台',
    template: '%s | OneClaw',
  },
  description:
    'OneClaw 是一站式 AI 工具与资源导航平台，精心收录数百款优质 AI 工具，涵盖 AI 视频生成、AI 图像创作、AI 写作助手、AI 编程工具、AI 音频处理等多个领域，同时提供丰富的提示词模板和 AI 技能资源，助力用户高效使用各类 AI 产品。',
  keywords: [
    'AI工具导航',
    'AI工具推荐',
    'AI视频生成',
    'AI图像创作',
    'AI写作助手',
    'AI编程工具',
    '提示词模板',
    'AI技能',
    'Runway',
    'Pika',
    'Sora',
    'Midjourney',
    'ChatGPT',
    'Claude',
    'AI数字人',
    'AI配音',
    'AI字幕',
    '免费AI工具',
    '2024 AI工具',
    'AI工具大全',
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
    title: 'OneClaw - 一站式 AI 工具与资源导航平台',
    description:
      'OneClaw 精心收录数百款优质 AI 工具，涵盖 AI 视频、AI 图像、AI 写作、AI 编程等多个领域，同时提供丰富的提示词模板和 AI 技能资源。',
    url: 'https://oneclaw.shop',
    siteName: 'OneClaw',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneClaw - 一站式 AI 工具与资源导航平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneClaw - 一站式 AI 工具与资源导航平台',
    description:
      '精选数百款优质 AI 工具，涵盖视频、图像、写作、编程等多个领域，提供提示词模板和 AI 技能资源。',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://oneclaw.shop',
  },
  category: 'technology',
  classification: 'AI Tools & Resources Directory',
  other: {
    'baidu-site-verification': 'your-baidu-verification-code',
  },
};

// JSON-LD 结构化数据
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OneClaw',
  description: '一站式 AI 工具与资源导航平台，精选优质 AI 工具、提示词模板和 AI 技能资源',
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
  description: '一站式 AI 工具与资源导航平台',
  sameAs: [],
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AI工具推荐',
  description: '精选 AI 工具、提示词和技能资源',
  numberOfItems: 117,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '即梦 AI',
      description: '一站式 AI 视频、图片、数字人创作工具',
      url: 'https://jimeng.jianying.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Runway',
      description: '专业的AI视频生成和编辑平台',
      url: 'https://runwayml.com/',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Pika',
      description: '强大的AI视频生成工具',
      url: 'https://pika.art/',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Sora',
      description: 'OpenAI推出的AI视频生成模型',
      url: 'https://openai.com/sora',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
