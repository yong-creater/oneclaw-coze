import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '标签管理 - OneClaw管理后台',
  description: '管理工具标签',
};

export default function AdminTagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
