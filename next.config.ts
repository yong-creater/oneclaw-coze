import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'), // Uncomment and add 'import path from "path"' if needed
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  
  // 百度验证文件必须返回纯文本
  async headers() {
    return [
      {
        source: '/baidu_verify_codeva-Guh6a5UTE1.html',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Coze CDN
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'code.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'skillhub.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.coze.cn',
        pathname: '/**',
      },
      // Google Favicon API (排行榜工具图标)
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: 'google.com',
        pathname: '/s2/favicons/**',
      },
      // AI 工具官网
      {
        protocol: 'https',
        hostname: 'chat.openai.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'claude.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kimi.moonshot.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.midjourney.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sora.com',
        pathname: '/**',
      },
      // 通用图床和 CDN
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        pathname: '/**',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // 其他工具图标域名
      {
        protocol: 'https',
        hostname: 'otter.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aka.doubaocdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.baidu.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
