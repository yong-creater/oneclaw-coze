import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '精选工具管理 - OneClaw管理后台',
  description: '管理精选工具',
};

export default function AdminUtilityToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
