import { Metadata } from 'next';
import HomePage from '@/components/site/pages/HomePage';

export const metadata: Metadata = {
  title: 'AI 内容创作平台',
  description: 'OneClaw 是一个 AI 内容创作平台，可快速生成商品图、小红书封面、AI 写真等高质量内容。',
};

export default function HomeRoute() {
  return <HomePage />;
}
