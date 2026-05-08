import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI写真生成器 - OneClaw',
  description: 'AI一键生成艺术写真，支持多种风格模板，轻松打造专属艺术照片。OneClaw一站式AI工具导航平台。',
};

export default function AiPhotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
