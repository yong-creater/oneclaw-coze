'use client';

import { useEffect } from 'react';

// Google AdSense 配置
// 请将下面的 'YOUR_PUBLISHER_ID' 替换为你从 Google AdSense 获取的实际 ID
const GOOGLE_ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '';

interface GoogleAdSenseProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  style?: React.CSSProperties;
}

export function GoogleAdSense({ 
  slot, 
  format = 'auto',
  style = { display: 'block', minHeight: '90px' }
}: GoogleAdSenseProps) {
  useEffect(() => {
    if (GOOGLE_ADSENSE_ID && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [slot]);

  if (!GOOGLE_ADSENSE_ID) {
    return null;
  }

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={GOOGLE_ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format={format}
    />
  );
}

// 在 layout.tsx 的 <head> 中调用此函数来加载广告脚本
export function GoogleAdSenseScript() {
  useEffect(() => {
    if (GOOGLE_ADSENSE_ID && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_ID}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
