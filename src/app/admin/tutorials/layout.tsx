import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '教程库管理 - OneClaw管理后台',
  description: '管理使用教程',
};

export default function AdminTutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
