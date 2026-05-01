import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI应用商店 - OneClaw',
  description: '浏览全品类AI工具，涵盖视频生成、数字人、AI绘画、AI写作等多种分类。OneClaw一站式AI工具导航平台。',
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
