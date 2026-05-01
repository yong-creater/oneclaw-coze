'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

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
  const handleClick = () => {
    if (href !== '/') {
      window.location.href = href;
    }
  };

  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Icon - SaaS style */}
      <div 
        className="relative rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Zap 
          className="text-white" 
          style={{ width: size * 0.55, height: size * 0.55 }}
          strokeWidth={2.5}
        />
      </div>
      
      {/* 文字 Logo */}
      {showText && (
        <span className="font-semibold tracking-tight text-slate-800 dark:text-white" style={{ fontSize: size * 0.55 }}>
          OneClaw
        </span>
      )}
    </Link>
  );
}

// 用于工具页面的简化 Logo（不带链接）
export function ToolPageLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div 
        className="relative rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Zap 
          className="text-white" 
          style={{ width: size * 0.55, height: size * 0.55 }}
          strokeWidth={2.5}
        />
      </div>
      
      <span className="font-semibold tracking-tight text-slate-800 dark:text-white" style={{ fontSize: size * 0.55 }}>
        OneClaw
      </span>
    </div>
  );
}

export default SiteLogo;
