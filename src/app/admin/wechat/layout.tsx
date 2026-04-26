import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '微信配置 - OneClaw管理后台',
  description: '配置微信公众号',
};

export default function AdminWechatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
