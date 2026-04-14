'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

// 广告类型定义
export interface AdConfig {
  id: string;
  type: 'banner' | 'sidebar' | 'card' | 'inline';
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  ctaText: string;
  badge?: string;
  showClose?: boolean;
}

// 默认广告配置
export const defaultAds: AdConfig[] = [
  {
    id: 'ad-banner-1',
    type: 'banner',
    title: 'Runway Gen-3 Alpha',
    description: '最新AI视频生成模型，支持超写实视频创作，限时优惠中！',
    imageUrl: '',
    linkUrl: 'https://runwayml.com/',
    ctaText: '立即体验',
    badge: '热门',
    showClose: true,
  },
  {
    id: 'ad-sidebar-1',
    type: 'sidebar',
    title: 'Pika Labs',
    description: '最强大的AI视频生成工具，注册送100积分',
    imageUrl: '',
    linkUrl: 'https://pika.art/',
    ctaText: '免费试用',
    badge: '推荐',
  },
  {
    id: 'ad-card-1',
    type: 'card',
    title: 'HeyGen 数字人',
    description: 'AI数字人视频生成，支持多语言口播，营销必备神器',
    imageUrl: '',
    linkUrl: 'https://www.heygen.com/',
    ctaText: '了解详情',
    badge: '新品',
  },
];

// Banner广告组件
export function BannerAd({ config }: { config: AdConfig }) {
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl overflow-hidden shadow-lg">
      {config.showClose && (
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 p-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      )}
      
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-white">
          <div className="flex items-center gap-2 mb-2">
            {config.badge && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                {config.badge}
              </Badge>
            )}
            <span className="text-xs opacity-80">广告</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{config.title}</h3>
          <p className="text-sm opacity-90">{config.description}</p>
        </div>
        
        <Button
          className="bg-white text-purple-600 hover:bg-white/90 gap-2"
          onClick={() => window.open(config.linkUrl, '_blank')}
        >
          {config.ctaText}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// 侧边栏广告组件
export function SidebarAd({ config }: { config: AdConfig }) {
  return (
    <Card className="overflow-hidden border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          {config.badge && (
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              {config.badge}
            </Badge>
          )}
          <span className="text-xs text-gray-400">广告</span>
        </div>
        
        <h4 className="font-bold mb-2 text-gray-900 dark:text-white">{config.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{config.description}</p>
        
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
          onClick={() => window.open(config.linkUrl, '_blank')}
        >
          {config.ctaText}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// 卡片式广告组件（混入工具列表）
export function CardAd({ config }: { config: AdConfig }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-dashed border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {config.badge && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                {config.badge}
              </Badge>
            )}
            <span className="text-xs text-gray-400">广告</span>
          </div>
        </div>
        
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{config.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{config.description}</p>
        
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
          onClick={() => window.open(config.linkUrl, '_blank')}
        >
          {config.ctaText}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// 内联广告组件（用于工具列表中间）
export function InlineAd({ config }: { config: AdConfig }) {
  return (
    <div className="col-span-full">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-1">
        <Card className="bg-white dark:bg-gray-800 border-0">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{config.title}</h4>
                  {config.badge && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs">
                      {config.badge}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-400">广告</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{config.description}</p>
              </div>
            </div>
            
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2 whitespace-nowrap"
              onClick={() => window.open(config.linkUrl, '_blank')}
            >
              {config.ctaText}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 通用广告组件 - 根据类型自动渲染
export function Ad({ config }: { config: AdConfig }) {
  switch (config.type) {
    case 'banner':
      return <BannerAd config={config} />;
    case 'sidebar':
      return <SidebarAd config={config} />;
    case 'card':
      return <CardAd config={config} />;
    case 'inline':
      return <InlineAd config={config} />;
    default:
      return null;
  }
}

// 广告位占位符组件（用于未配置广告时）
export function AdPlaceholder({ type }: { type: 'banner' | 'sidebar' | 'card' | 'inline' }) {
  const placeholderStyles = {
    banner: 'h-24 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600',
    sidebar: 'h-64 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600',
    card: 'h-48 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600',
    inline: 'h-16 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600',
  };

  return (
    <div className={`${placeholderStyles[type]} flex items-center justify-center`}>
      <span className="text-gray-400 dark:text-gray-500 text-sm">广告位招租</span>
    </div>
  );
}
