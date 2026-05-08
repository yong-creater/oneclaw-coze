import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI简历优化 - OneClaw',
  description: 'AI智能优化简历内容，提升求职竞争力。专业简历模板，助您快速获得面试机会。OneClaw一站式AI工具导航平台。',
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
