import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI小说创作 - OneClaw',
  description: 'AI辅助小说创作，支持章节生成、人物设定、情节发展等多种功能，激发创作灵感。OneClaw一站式AI工具导航平台。',
};

export default function NovelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
