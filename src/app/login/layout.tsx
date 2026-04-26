import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户登录 - OneClaw',
  description: '登录OneClaw账号，收藏心仪的AI工具，查看使用历史。OneClaw一站式AI工具导航平台。',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
