import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的工作台 - OneClaw',
  description: '管理您的收藏、浏览历史和评分记录。OneClaw一站式AI工具导航平台。',
  keywords: ['我的收藏', '浏览历史', '评分记录', 'AI工具导航', 'OneClaw'],
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
