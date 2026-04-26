import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '商品海报生成器 - OneClaw',
  description: 'AI一键生成电商商品海报，支持多种风格模板，让商品展示更专业。OneClaw一站式AI工具导航平台。',
};

export default function ProductPosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
