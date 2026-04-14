import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OneClaw 管理后台',
  description: 'OneClaw AI工具导航 - 管理后台',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
