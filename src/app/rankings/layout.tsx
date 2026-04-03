import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '榜单中心 - OneClaw',
  description: '查看热门AI工具榜单、免费神器榜单、新品上线榜单，发现最受欢迎的AI工具。OneClaw一站式AI工具导航平台。',
  keywords: ['AI工具榜单', '热门工具', '免费AI工具', '新品推荐', 'OneClaw'],
};

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
