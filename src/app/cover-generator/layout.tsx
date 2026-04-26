import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '封面生成器 - OneClaw',
  description: 'AI智能生成各类封面图，支持小红书、公众号、短视频等多种场景。OneClaw一站式AI工具导航平台。',
};

export default function CoverGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
