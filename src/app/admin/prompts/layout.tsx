import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '提示词库管理 - OneClaw管理后台',
  description: '管理提示词模板',
};

export default function AdminPromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
