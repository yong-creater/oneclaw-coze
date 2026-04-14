import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '数据看板 - OneClaw',
  description: 'AI工具行业数据统计和分析，了解最新趋势和热门工具。OneClaw一站式AI工具导航平台。',
  keywords: ['AI数据', '行业分析', '工具统计', 'OneClaw'],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
