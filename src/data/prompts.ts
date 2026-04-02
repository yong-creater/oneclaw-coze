// 提示词数据汇总

export * from './prompts-types';

// 导入各分类提示词（使用默认导出）
import videoPromptsData from './prompts-video';
import imagePromptsData from './prompts-image';
import textPromptsData from './prompts-text';
import codePromptsData from './prompts-code';
import marketingPromptsData from './prompts-marketing';
import dataPromptsData from './prompts-data';
import translatePromptsData from './prompts-translate';
import educationPromptsData from './prompts-education';
import businessPromptsData from './prompts-business';
import lifePromptsData from './prompts-life';

// 合并所有提示词
export const prompts = [
  ...videoPromptsData, 
  ...imagePromptsData,
  ...textPromptsData,
  ...codePromptsData,
  ...marketingPromptsData,
  ...dataPromptsData,
  ...translatePromptsData,
  ...educationPromptsData,
  ...businessPromptsData,
  ...lifePromptsData
];

// 动态生成分类
export const promptCategories = (() => {
  const categories: Record<string, { name: string; icon: string; count: number }> = {
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

  prompts.forEach(p => {
    if (categories[p.category]) {
      categories[p.category].count++;
    }
    categories['全部'].count++;
  });

  return Object.values(categories);
})();
