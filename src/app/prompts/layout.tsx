import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt模板库 - OneClaw',
  description: '精选AI提示词模板，涵盖写作、绘画、编程等多种场景，帮助您高效使用AI工具。OneClaw一站式AI工具导航平台。',
  keywords: ['Prompt模板', 'AI提示词', '提示词库', 'AI写作', 'AI绘画', 'OneClaw'],
};

export default function PromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
