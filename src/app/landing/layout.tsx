import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OneClaw - 发现最优质的 AI 工具',
  description: 'OneClaw 收录全球优质 AI 工具，涵盖视频生成、数字人、AI 绘画、AI 写作等全品类，帮助你快速找到最适合自己的 AI 解决方案。',
  keywords: 'AI工具, AI导航, AI应用, 人工智能, ChatGPT, Midjourney, AI绘画, AI视频生成',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
