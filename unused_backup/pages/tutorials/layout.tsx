import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '教程库 - OneClaw',
  description: 'AI工具使用教程，从入门到精通，掌握各类AI工具的使用技巧。OneClaw一站式AI工具导航平台。',
};

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
