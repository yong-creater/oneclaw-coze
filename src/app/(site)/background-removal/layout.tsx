import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI智能抠图 - OneClaw',
  description: 'AI一键智能抠图，轻松去除背景，支持多种图片格式。OneClaw一站式AI工具导航平台。',
};

export default function BackgroundRemovalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
