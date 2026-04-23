// 提示词数据结构定义 - 支持案例展示

export interface PromptExample {
  input: string;           // 输入示例
  output: string;          // 输出示例/效果
  type: 'text' | 'image' | 'video' | 'code'; // 展示类型
  imageUrl?: string;       // 效果图片URL（可选）
  videoUrl?: string;       // 效果视频URL（可选）
}

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  featured?: boolean;
  usage?: number;          // 使用次数
  rating?: number;         // 评分 (1-5)
  example?: PromptExample; // 案例展示
  tips?: string[];         // 使用技巧
  relatedPrompts?: string[]; // 相关提示词ID
}

// 提示词分类
export interface PromptCategory {
  name: string;
  icon: string;
  count: number;
}

// 获取提示词分类
export function getPromptCategories(): PromptCategory[] {
  // 动态导入避免循环依赖
  const categories: Record<string, PromptCategory> = {
    '全部': { name: '全部', icon: '💡', count: 0 },
    '视频生成': { name: '视频生成', icon: '🎬', count: 0 },
    '图像生成': { name: '图像生成', icon: '🖼️', count: 0 },
    '文本创作': { name: '文本创作', icon: '✍️', count: 0 },
    '代码开发': { name: '代码开发', icon: '💻', count: 0 },
    '营销文案': { name: '营销文案', icon: '📢', count: 0 },
    '数据分析': { name: '数据分析', icon: '📊', count: 0 },
    '翻译润色': { name: '翻译润色', icon: '🌐', count: 0 },
    '教育学习': { name: '教育学习', icon: '📚', count: 0 },
    '商业策划': { name: '商业策划', icon: '💼', count: 0 },
    '生活助手': { name: '生活助手', icon: '🏠', count: 0 },
  };

  // 返回时再计算count
  return Object.values(categories);
}
