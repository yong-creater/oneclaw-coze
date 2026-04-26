import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Key管理 - OneClaw管理后台',
  description: '管理API密钥',
};

export default function AdminApiKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
