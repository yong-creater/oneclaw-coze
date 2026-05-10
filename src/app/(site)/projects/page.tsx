import { Metadata } from 'next';
import ProjectPage from '@/components/site/pages/ProjectPage';

export const metadata: Metadata = {
  title: '我的作品',
  description: 'OneClaw 我的作品，管理你的 AI 创作内容与生成结果。',
};

export default function ProjectsRoute() {
  return <ProjectPage />;
}
