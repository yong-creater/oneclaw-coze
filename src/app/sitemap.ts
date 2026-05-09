import { MetadataRoute } from 'next';

// 获取完整URL（带协议）- 强制使用 www
const getFullUrl = () => {
  let domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'www.oneclaw.shop';
  // 移除协议前缀
  domain = domain.replace(/^https?:\/\//, '');
  // 强制添加 www 前缀（如果没有）
  if (!domain.startsWith('www.')) {
    domain = 'www.' + domain;
  }
  return `https://${domain}`;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getFullUrl();

  // 核心页面
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/product-generator`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/product-poster`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/xiaohongshu-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ai-photo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/background-removal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/novel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/productpage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

  ];

  return pages;
}
