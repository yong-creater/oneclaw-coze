import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI应用管理 - OneClaw管理后台',
  description: '管理AI工具应用',
};

export default function AdminToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
