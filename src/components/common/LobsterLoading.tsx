'use client';

import { memo } from 'react';
import { Zap } from 'lucide-react';

interface LobsterLoadingProps {
  size?: number;
  variant?: 'spin' | 'bounce' | 'wave' | 'dance' | 'pulse' | 'clamp';
  text?: string;
  className?: string;
}

export const LobsterLoading = memo(function LobsterLoading({ 
  size = 64, 
  variant = 'bounce',
  text,
  className = '' 
}: LobsterLoadingProps) {
  const animationClass = {
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    wave: 'animate-pulse',
    dance: 'animate-pulse',
    pulse: 'animate-pulse',
    clamp: 'animate-pulse',
  }[variant];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={animationClass} style={{ width: size, height: size }}>
        <div 
          className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm"
        >
          <Zap 
            className="text-white" 
            style={{ width: size * 0.55, height: size * 0.55 }}
            strokeWidth={2.5}
          />
        </div>
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
