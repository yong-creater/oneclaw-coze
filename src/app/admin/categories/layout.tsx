import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '分类管理 - OneClaw管理后台',
  description: '管理工具分类',
};

export default function AdminCategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
