'use client';

import { useEffect } from 'react';

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
      } catch {
        // 忽略广告加载错误
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
