import { Metadata } from 'next';
import PromptPage from '@/components/site/pages/PromptPage';

export const metadata: Metadata = {
  title: 'AI 灵感库',
  description: 'OneClaw AI 灵感库，浏览海量 AI 创作灵感与提示词模板。',
};

export default function InspirationRoute() {
  return <PromptPage />;
}
