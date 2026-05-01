import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '模板中心 - OneClaw',
  description: '精选AI创作模板，涵盖小红书、简历、小说、海报等多种场景，一键生成高质量内容。OneClaw一站式AI工具导航平台。',
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
