'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SiteLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  href?: string;
}

export function SiteLogo({ 
  size = 32, 
  showText = false,
  className = '',
  href = '/'
}: SiteLogoProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (href !== '/') {
      window.location.href = href;
    }
  };

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      {/* Logo 图片 */}
      <div 
        className="relative rounded-lg overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {!imageError ? (
          <img
            src="/oneclaw-logo.png"
            alt="OneClaw"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <span className="text-white font-bold text-xs" style={{ fontSize: size * 0.4 }}>
              OC
            </span>
          </div>
        )}
      </div>
      
      {/* 文字 Logo */}
      {showText && (
        <span className="font-bold text-lg text-slate-800 dark:text-white">
          <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>
        </span>
      )}
    </Link>
  );
}

// 用于工具页面的简化 Logo（不带链接）
export function ToolPageLogo({ size = 32 }: { size?: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div 
        className="relative rounded-lg overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {!imageError ? (
          <img
            src="/oneclaw-logo.png"
            alt="OneClaw"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
              OC
            </span>
          </div>
        )}
      </div>
      
      <span className="font-bold text-lg text-slate-800 dark:text-white">
        <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>
      </span>
    </div>
  );
}

export default SiteLogo;
