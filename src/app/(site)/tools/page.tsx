import { Metadata } from 'next';
import ToolsPage from '@/components/site/pages/ToolsPage';

export const metadata: Metadata = {
  title: 'AI 创作工具',
  description: 'OneClaw AI 创作工具，快速生成商品图、小红书封面、AI 写真等高质量内容。',
};

export default function ToolsRoute() {
  return <ToolsPage />;
}
