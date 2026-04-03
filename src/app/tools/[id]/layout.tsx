import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '工具详情 - OneClaw',
  description: '查看AI工具详细信息，包括功能特点、免费额度、用户评分、核心优势等。OneClaw一站式AI工具导航平台。',
  keywords: ['AI工具详情', '工具评测', 'AI工具推荐', 'OneClaw'],
};

export default function ToolDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
