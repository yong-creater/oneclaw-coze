import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '资源中心 - OneClaw',
  description: 'AI提示词模板库和教程资源中心，提供丰富的Prompt模板和使用教程。OneClaw一站式AI工具导航平台。',
  keywords: ['Prompt模板', 'AI教程', '提示词', 'AI资源', 'OneClaw'],
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
