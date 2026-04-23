'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';

// 广告位类型
type AdPosition = 'home_banner' | 'home_inline' | 'tool_detail';

interface Ad {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  position: AdPosition;
  is_active: boolean;
}

interface AdBannerProps {
  position: AdPosition;
  className?: string;
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAds();
  }, [position]);

  const fetchAds = async () => {
    try {
      const res = await fetch(`/api/ads?position=${position}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAds(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || closed || ads.length === 0) return null;

  const ad = ads[currentIndex];
  if (!ad) return null;

  return (
    <div className={className}>
      <Card className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
        <button
          onClick={() => setClosed(true)}
          className="absolute top-2 right-2 p-1 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {ad.image_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400">
                    广告
                  </Badge>
                  <span className="text-xs text-slate-500">{ad.title}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {ad.description}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </a>
      </Card>
    </div>
  );
}

interface HomeBannerProps {
  className?: string;
}

export function HomeBanner({ className = '' }: HomeBannerProps) {
  return <AdBanner position="home_banner" className={className} />;
}

interface HomeInlineAdProps {
  className?: string;
}

export function HomeInlineAd({ className = '' }: HomeInlineAdProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch(`/api/ads?position=home_inline&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAds(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inline ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || ads.length === 0) return null;

  const ad = ads[0];

  return (
    <div className={className}>
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
        <Card className="overflow-hidden hover:shadow-md transition-shadow bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                Ad
              </Badge>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {ad.title}
              </span>
              <ExternalLink className="w-4 h-4 text-emerald-500 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </a>
    </div>
  );
}
