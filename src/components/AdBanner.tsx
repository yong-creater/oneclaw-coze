'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';

// 广告位类型
type AdPosition = 'home_banner' | 'sidebar' | 'tool_detail' | 'category_top';

interface Advertisement {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  priority: number;
  clicks: number;
  impressions: number;
}

interface AdBannerProps {
  position: AdPosition;
  className?: string;
  showClose?: boolean;
}

// 广告横幅组件
export function AdBanner({ 
  position, 
  className = '',
  showClose = true 
}: AdBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [closed, setClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取广告
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/ads?position=${position}`);
        const data = await res.json();
        if (data.success) {
          setAds(data.data);
        }
      } catch (error) {
        console.error('获取广告失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [position]);

  // 记录点击
  const handleClick = useCallback(async (adId: number, linkUrl: string) => {
    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId })
      });
    } catch (error) {
      console.error('记录点击失败:', error);
    }
    window.open(linkUrl, '_blank');
  }, []);

  // 自动轮播
  useEffect(() => {
    if (ads.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [ads.length]);

  // 加载中或无广告
  if (loading || closed || ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  if (!currentAd) return null;

  // 首页横幅广告
  if (position === 'home_banner') {
    return (
      <div className={`relative ${className}`}>
        <div 
          className="relative rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => handleClick(currentAd.id, currentAd.link_url)}
        >
          <img
            src={currentAd.image_url}
            alt={currentAd.title}
            className="w-full h-32 md:h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs mb-2">
              广告
            </Badge>
            <h3 className="text-white font-bold text-lg">{currentAd.title}</h3>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-2">
            {ads.length > 1 && (
              <div className="flex gap-1">
                {ads.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
            {showClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setClosed(true);
                }}
                className="p-1 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 侧边栏广告
  if (position === 'sidebar') {
    return (
      <Card className={`bg-white dark:bg-slate-800 overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div 
            className="relative cursor-pointer group"
            onClick={() => handleClick(currentAd.id, currentAd.link_url)}
          >
            <img
              src={currentAd.image_url}
              alt={currentAd.title}
              className="w-full h-auto"
            />
            <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 text-slate-500 text-xs">
              广告
            </Badge>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 工具详情页广告
  if (position === 'tool_detail') {
    return (
      <Card className={`bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 ${className}`}>
        <CardContent className="p-4">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => handleClick(currentAd.id, currentAd.link_url)}
          >
            <img
              src={currentAd.image_url}
              alt={currentAd.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs mb-1">广告</Badge>
              <h4 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                {currentAd.title}
              </h4>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 分类顶部广告
  if (position === 'category_top') {
    return (
      <div 
        className={`relative rounded-lg overflow-hidden cursor-pointer ${className}`}
        onClick={() => handleClick(currentAd.id, currentAd.link_url)}
      >
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          className="w-full h-20 object-cover"
        />
        <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 text-slate-500 text-xs">
          广告
        </Badge>
      </div>
    );
  }

  return null;
}

export default AdBanner;
