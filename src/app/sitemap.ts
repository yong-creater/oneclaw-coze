import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aivideotools.com';
  
  // 工具分类
  const categories = [
    '视频生成',
    '视频编辑',
    '数字人',
    '视频增强',
    '3D视频',
    '创意视频',
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // 可以添加分类页面
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
