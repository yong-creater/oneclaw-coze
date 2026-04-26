import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SBTI性格测试 - OneClaw',
  description: '发现你的独特个性，AI驱动的SBTI性格测试，生成专属卡通形象。OneClaw一站式AI工具导航平台。',
};

export default function SbtiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
