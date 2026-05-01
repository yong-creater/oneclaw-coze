import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户工作台 - OneClaw',
  description: '管理您的收藏、浏览历史和生成记录。OneClaw一站式AI工具导航平台。',
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
