import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '小红书爆款生成器 - OneClaw',
  description: 'AI一键生成小红书爆款文案和配图，支持多种风格模板，让你的笔记脱颖而出。OneClaw一站式AI工具导航平台。',
};

export default function XiaohongshuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
