import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI商品详情页生成器 - OneClaw',
  description: 'AI一键生成电商商品详情页，专业的文案和排版，提升商品转化率。OneClaw一站式AI工具导航平台。',
};

export default function ProductPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
