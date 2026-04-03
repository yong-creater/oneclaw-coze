import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '工具对比 - OneClaw',
  description: '对比多款AI工具的功能、价格、用户评价等维度，帮您快速找到最适合的AI工具。OneClaw一站式AI工具导航平台。',
  keywords: ['AI工具对比', '工具评测', '对比分析', 'OneClaw'],
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
