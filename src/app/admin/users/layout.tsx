import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户管理 - OneClaw管理后台',
  description: '管理用户信息',
};

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
