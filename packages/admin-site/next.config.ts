import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 允许加载外部图片
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  
  // 实验性功能
  experimental: {
    // 允许上传大文件
    largePageDataBytes: 2 * 1024 * 1024,
  },
};

export default nextConfig;
