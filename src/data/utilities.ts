// 实用工具配置

export interface Utility {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: string;
  isNew?: boolean;
  badge?: string;
}

export const utilities: Utility[] = [
  {
    id: 'resume',
    name: '简历优化',
    description: 'AI智能优化简历，STAR法则撰写，提升面试机会',
    icon: 'FileText',
    path: '/resume',
    category: '职业发展',
    badge: '热门',
  },
];

export const utilityCategories = [
  { id: 'career', name: '职业发展', icon: 'Briefcase' },
];