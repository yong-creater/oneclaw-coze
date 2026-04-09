import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '热门榜单 - OneClaw',
  description: '查看AI工具热门榜单，了解最受欢迎的AI工具排行和热度变化。OneClaw一站式AI工具导航平台。',
  keywords: ['AI工具榜单', '热门工具', 'AI排行', 'AI工具推荐', 'OneClaw'],
};

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
