'use client';

import { memo, useState } from 'react';
import Image from 'next/image';

interface LobsterLoadingProps {
  size?: number;
  variant?: 'spin' | 'bounce' | 'wave' | 'dance' | 'pulse' | 'clamp';
  text?: string;
  className?: string;
}

// 主组件 - 根据不同 variant 显示不同动画
export const LobsterLoading = memo(function LobsterLoading({ 
  size = 64, 
  variant = 'bounce',
  text,
  className = '' 
}: LobsterLoadingProps) {
  const [imageError, setImageError] = useState(false);
  
  const animationClass = {
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    wave: 'animate-typing',
    dance: 'animate-typing',
    pulse: 'animate-typing',
    clamp: 'animate-typing',
  }[variant];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={animationClass} style={{ width: size, height: size }}>
        {!imageError ? (
          <Image
            src="/oneclaw-logo.png?v=10"
            alt="OneClaw 龙虾"
            width={size}
            height={size}
            className="object-contain"
            style={{ filter: 'saturate(1.3) brightness(1.1) sepia(0.1)' }}
            priority
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center"
            style={{ filter: 'saturate(1.3) brightness(1.1)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
              OC
            </span>
          </div>
        )}
      </div>
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

// 全屏 Loading 组件
export const FullPageLoading = memo(function FullPageLoading({ 
  text = '加载中...' 
}: { 
  text?: string;
}) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LobsterLoading size={80} variant="bounce" text={text} />
    </div>
  );
});

export default LobsterLoading;
