import type { Metadata, Viewport } from 'next';
import { Inspector } from 'react-dev-inspector';
import { Providers } from '@/components/common/Providers';
import './globals.css';

const getDomain = () => {
  const raw = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'oneclaw.shop';
  return raw.replace(/^https?:\/\//, '');
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a1a1a',
};

const domain = getDomain();
const siteUrl = `https://${domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OneClaw - 实用AI工具',
    template: '%s | OneClaw',
  },
  description: '实用AI工具，让AI真正提升你的效率',
  keywords: ['AI工具', '实用工具', '简历优化'],
  authors: [{ name: 'OneClaw' }],
  creator: 'OneClaw',
  applicationName: 'OneClaw',
  icons: {
    icon: '/favicon.png?v=2',
    shortcut: '/favicon.png?v=2',
  },
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
        <meta name="baidu-site-verification" content="codeva-Guh6a5UTE1" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {isDev && <Inspector />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
