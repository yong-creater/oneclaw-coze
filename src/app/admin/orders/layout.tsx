import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '订单管理 - OneClaw管理后台',
  description: '管理订单信息',
};

export default function AdminOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
