import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '工具详情 - OneClaw',
  description: '查看AI工具详细信息、功能介绍、使用教程和用户评价。OneClaw一站式AI工具导航平台。',
};

export default function ToolsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
