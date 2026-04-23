'use client';

import { GoogleAdSense } from './GoogleAdSense';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className = '' }: AdBannerProps) {
  return (
    <div className={`my-6 ${className}`}>
      <GoogleAdSense
        slot="YOUR_HOME_BANNER_SLOT"
        format="horizontal"
        style={{ display: 'block', minHeight: '90px', borderRadius: '8px' }}
      />
    </div>
  );
}

export function AdSidebar({ className = '' }: AdBannerProps) {
  return (
    <div className={`my-4 ${className}`}>
      <GoogleAdSense
        slot="YOUR_SIDEBAR_SLOT"
        format="vertical"
        style={{ display: 'block', minHeight: '250px', borderRadius: '8px' }}
      />
    </div>
  );
}

export function AdInline({ className = '' }: AdBannerProps) {
  return (
    <div className={`my-4 ${className}`}>
      <GoogleAdSense
        slot="YOUR_INLINE_SLOT"
        format="auto"
        style={{ display: 'block', minHeight: '90px', borderRadius: '8px' }}
      />
    </div>
  );
}

// 广告占位符（用于未配置广告时显示）
export function AdPlaceholder({ type = 'banner' }: { type?: 'banner' | 'sidebar' | 'inline' }) {
  const heights = {
    banner: 'h-[90px]',
    sidebar: 'h-[250px]',
    inline: 'h-[90px]',
  };

  return (
    <div
      className={`${heights[type]} bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 dark:border-slate-600`}
    >
      广告位
    </div>
  );
}
