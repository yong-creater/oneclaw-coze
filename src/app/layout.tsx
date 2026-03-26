import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI视频工具集合 | 精选优质AI视频创作工具',
    template: '%s | AI视频工具集合',
  },
  description:
    '精选优质AI视频创作工具，包括视频生成、视频编辑、数字人、视频增强等多种类型的AI工具，助力创意视频制作。',
  keywords: [
    'AI视频工具',
    '视频生成',
    '视频编辑',
    '数字人',
    'AI制作视频',
    'Runway',
    'Pika',
    'Sora',
    'HeyGen',
    '剪映',
  ],
  authors: [{ name: 'AI视频工具集合' }],
  generator: 'Next.js',
  openGraph: {
    title: 'AI视频工具集合 | 精选优质AI视频创作工具',
    description:
      '精选优质AI视频创作工具，包括视频生成、视频编辑、数字人、视频增强等多种类型的AI工具。',
    siteName: 'AI视频工具集合',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
