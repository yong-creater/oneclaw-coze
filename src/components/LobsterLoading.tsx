'use client';

import { memo } from 'react';

interface LobsterLoadingProps {
  size?: number;
  variant?: 'spin' | 'bounce' | 'wave' | 'dance' | 'pulse' | 'clamp';
  text?: string;
  className?: string;
}

// 可爱卡通龙虾 SVG 基础组件
const LobsterSVG = memo(function LobsterSVG({ 
  size, 
  className = '' 
}: { 
  size: number; 
  className?: string;
}) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      className={className}
      style={{ width: size, height: size }}
    >
      <defs>
        {/* 身体渐变 - 橙红色 */}
        <linearGradient id="loadingBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B4A" />
          <stop offset="50%" stopColor="#E85A3C" />
          <stop offset="100%" stopColor="#C94A2E" />
        </linearGradient>
        
        {/* 钳子渐变 - 橙色 */}
        <linearGradient id="loadingClawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="100%" stopColor="#E86A3C" />
        </linearGradient>
        
        {/* 高光渐变 */}
        <linearGradient id="loadingHighlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB08A" />
          <stop offset="100%" stopColor="#FF6B4A" />
        </linearGradient>
      </defs>
      
      {/* 主体 - 圆润椭圆形 */}
      <g className="lobster-body">
        {/* 身体主体 */}
        <ellipse cx="32" cy="34" rx="20" ry="18" fill="url(#loadingBodyGradient)" />
        
        {/* 身体高光 */}
        <ellipse cx="28" cy="28" rx="10" ry="6" fill="url(#loadingHighlightGradient)" opacity="0.5" />
        
        {/* 腹部纹理 */}
        <path d="M18 36 Q32 38 46 36" stroke="#C94A2E" strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M20 40 Q32 42 44 40" stroke="#C94A2E" strokeWidth="1" fill="none" opacity="0.3" />
      </g>
      
      {/* 左钳子 */}
      <g className="loading-claw-left">
        <ellipse cx="10" cy="28" rx="8" ry="6" fill="url(#loadingClawGradient)" />
        <ellipse cx="7" cy="26" rx="3" ry="2" fill="#FFB08A" opacity="0.4" />
      </g>
      
      {/* 右钳子 */}
      <g className="loading-claw-right">
        <ellipse cx="54" cy="28" rx="8" ry="6" fill="url(#loadingClawGradient)" />
        <ellipse cx="57" cy="26" rx="3" ry="2" fill="#FFB08A" opacity="0.4" />
      </g>
      
      {/* 小短腿 */}
      <g className="loading-legs">
        <rect x="20" y="50" width="5" height="8" rx="2" fill="url(#loadingClawGradient)" />
        <rect x="28" y="52" width="5" height="8" rx="2" fill="url(#loadingClawGradient)" />
        <rect x="36" y="52" width="5" height="8" rx="2" fill="url(#loadingClawGradient)" />
        <rect x="44" y="50" width="5" height="8" rx="2" fill="url(#loadingClawGradient)" />
      </g>
      
      {/* 触须 */}
      <g className="loading-antennas">
        {/* 左触须 */}
        <path d="M24 16 Q20 8 16 4" stroke="#FF8C5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="4" r="2" fill="#FF8C5A" />
        
        {/* 右触须 */}
        <path d="M40 16 Q44 8 48 4" stroke="#FF8C5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="48" cy="4" r="2" fill="#FF8C5A" />
      </g>
      
      {/* 眼睛 */}
      <g className="loading-eyes">
        {/* 左眼 */}
        <circle cx="24" cy="28" r="6" fill="#1a1a2e" />
        <circle cx="22" cy="26" r="2" fill="#7dd3fc" />
        <circle cx="26" cy="30" r="1.5" fill="white" opacity="0.6" />
        
        {/* 右眼 */}
        <circle cx="40" cy="28" r="6" fill="#1a1a2e" />
        <circle cx="38" cy="26" r="2" fill="#7dd3fc" />
        <circle cx="42" cy="30" r="1.5" fill="white" opacity="0.6" />
      </g>
      
      {/* 腮红 */}
      <g className="loading-blush">
        <ellipse cx="16" cy="36" rx="4" ry="2" fill="#FFB5B5" opacity="0.5" />
        <ellipse cx="48" cy="36" rx="4" ry="2" fill="#FFB5B5" opacity="0.5" />
      </g>
      
      {/* 嘴巴 - 微笑 */}
      <path d="M28 42 Q32 46 36 42" stroke="#C94A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
});

// 主组件 - 根据不同 variant 显示不同动画
export const LobsterLoading = memo(function LobsterLoading({ 
  size = 64, 
  variant = 'bounce',
  text,
  className = '' 
}: LobsterLoadingProps) {
  const animationClass = {
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    wave: 'animate-wave',
    dance: 'animate-dance',
    pulse: 'animate-pulse',
    clamp: 'animate-clamp',
  }[variant];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={animationClass}>
        <LobsterSVG size={size} />
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

// 内联 Loading 组件
export const InlineLoading = memo(function InlineLoading({ 
  size = 32,
  text 
}: { 
  size?: number;
  text?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <LobsterLoading size={size} variant="spin" />
      {text && <span className="text-sm text-slate-500">{text}</span>}
    </div>
  );
});

export default LobsterLoading;
