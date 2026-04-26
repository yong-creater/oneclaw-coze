import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '广告管理 - OneClaw管理后台',
  description: '管理广告位',
};

export default function AdminAdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
