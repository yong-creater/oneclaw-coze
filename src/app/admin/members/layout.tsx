import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会员管理 - OneClaw管理后台',
  description: '管理会员信息',
};

export default function AdminMembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
