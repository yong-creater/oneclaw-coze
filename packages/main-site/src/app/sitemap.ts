import { MetadataRoute } from 'next';

// 提取域名，移除协议前缀
const getDomain = () => {
  const raw = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'oneclaw.shop';
  return raw.replace(/^https?:\/\//, '');
};

// 获取完整URL（带协议）
const getFullUrl = () => {
  const raw = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'oneclaw.shop';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  return `https://${raw}`;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = getDomain();
  const baseUrl = getFullUrl();
  
  // 工具分类slug
  const categorySlugs = [
    'video-generation',
    'digital-human',
    'video-editing',
    'ai-dubbing',
    'ai-painting',
    'ai-chat',
    'ai-writing',
    'ai-coding',
    'ai-audio',
    'ai-office',
    'ai-marketing',
    'ai-learning',
    'ai-search',
    'ai-translation',
  ];

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tutorials`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workspace`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sbti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/novel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 分类页面
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 工具详情页 - 从数据库获取或使用静态列表
  const topToolIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const toolPages: MetadataRoute.Sitemap = topToolIds.map((id) => ({
    url: `${baseUrl}/tools/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
