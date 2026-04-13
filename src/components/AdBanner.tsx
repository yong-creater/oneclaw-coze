'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';

// 广告位类型
type AdPosition = 
  | 'home_banner'      // 首页横幅大图
  | 'home_inline'       // 首页工具卡片间
  | 'tool_detail';      // 工具详情页

interface Advertisement {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url: string;
  position: string;
  priority: number;
  clicks: number;
  impressions: number;
  is_active: boolean;
  is_highlight?: boolean;
  target_category?: string;
}

interface AdBannerProps {
  position: AdPosition;
  className?: string;
  showClose?: boolean;
  toolId?: number; // 用于工具详情页关联
}

// 获取广告数据
async function fetchAds(position: string): Promise<Advertisement[]> {
  try {
    const res = await fetch(`/api/ads?position=${position}&t=${Date.now()}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

// 记录广告点击
async function recordClick(adId: number) {
  try {
    await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: adId })
    });
  } catch (error) {
    console.error('记录点击失败:', error);
  }
}

// 首页横幅广告 (大尺寸Banner)
export function HomeBanner({ 
  className = '',
  showClose = true 
}: { 
  className?: string;
  showClose?: boolean;
}) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [closed, setClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds('home_banner').then(data => {
      setAds(data);
      setLoading(false);
    });
  }, []);

  // 自动轮播
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const handleClick = useCallback((ad: Advertisement) => {
    recordClick(ad.id);
    window.open(ad.link_url, '_blank');
  }, []);

  if (loading || closed || ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  if (!currentAd) return null;

  return (
    <div className={`relative ${className}`}>
      <div 
        className="relative rounded-xl overflow-hidden cursor-pointer group shadow-lg"
        onClick={() => handleClick(currentAd)}
      >
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          className="w-full h-40 md:h-48 object-cover transition-transform group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs mb-2">
            广告
          </Badge>
          <h3 className="text-white font-bold text-lg drop-shadow-md">{currentAd.title}</h3>
          {currentAd.description && (
            <p className="text-white/80 text-sm mt-1 line-clamp-1">{currentAd.description}</p>
          )}
        </div>
        
        {/* 轮播指示器 */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {ads.length > 1 && (
            <div className="flex gap-1.5 mr-2">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                  }`}
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
              className="p-1.5 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 首页内嵌广告 (工具卡片间)
export function HomeInlineAd({ 
  className = '',
  position = 8 // 在第几个位置插入
}: { 
  className?: string;
  position?: number;
}) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds('home_inline').then(data => {
      setAds(data);
      setLoading(false);
    });
  }, []);

  const handleClick = useCallback((ad: Advertisement) => {
    recordClick(ad.id);
    window.open(ad.link_url, '_blank');
  }, []);

  if (loading || ads.length === 0) return null;

  const ad = ads[0]; // 只显示一个

  return (
    <div className={className}>
      <Card 
        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 overflow-hidden cursor-pointer group hover:shadow-md transition-all"
        onClick={() => handleClick(ad)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs mb-1 bg-white/80">广告</Badge>
              <h4 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                {ad.title}
              </h4>
              {ad.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {ad.description}
                </p>
              )}
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 兼容旧接口的默认导出
function AdBanner({ 
  position, 
  className = '',
  showClose = true 
}: AdBannerProps) {
  switch (position) {
    case 'home_banner':
      return <HomeBanner className={className} showClose={showClose} />;
    case 'home_inline':
      return <HomeInlineAd className={className} />;
    case 'tool_detail':
      return <ToolDetailAd className={className} />;
    default:
      return null;
  }
}

export default AdBanner;
