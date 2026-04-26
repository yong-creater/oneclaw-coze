import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '模板管理 - OneClaw管理后台',
  description: '管理创作模板',
};

export default function AdminTemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
