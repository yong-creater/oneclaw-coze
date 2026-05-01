import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI工具榜单 - OneClaw',
  description: '查看AI工具热门榜单、新品榜单、免费榜单，助您发现优质AI工具。OneClaw一站式AI工具导航平台。',
};

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
