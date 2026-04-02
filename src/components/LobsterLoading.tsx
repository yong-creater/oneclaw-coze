'use client';

import { memo } from 'react';

interface LobsterLoadingProps {
  size?: number;
  variant?: 'spin' | 'bounce' | 'wave' | 'dance' | 'pulse' | 'clamp';
  text?: string;
  className?: string;
}

// 龙虾 SVG 基础组件
const LobsterSVG = memo(function LobsterSVG({ 
  size, 
  className = '' 
}: { 
  size: number; 
  className?: string;
}) {
  return (
    <svg 
      viewBox="0 0 120 80" 
      className={className}
      style={{ width: size, height: size * 0.67 }}
    >
      <defs>
        <linearGradient id="loadingBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="loadingHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="loadingClaw" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      
      {/* 尾部 */}
      <path d="M8 40 Q2 35, 0 28 Q5 32, 10 36" fill="url(#loadingBody)" />
      <path d="M8 40 Q1 40, 0 40" fill="url(#loadingBody)" />
      <path d="M8 40 Q2 45, 0 52 Q5 48, 10 44" fill="url(#loadingBody)" />
      <ellipse cx="15" cy="40" rx="8" ry="7" fill="url(#loadingBody)" />
      
      {/* 腹部 */}
      <ellipse cx="28" cy="40" rx="9" ry="8" fill="url(#loadingBody)" />
      <ellipse cx="42" cy="40" rx="9" ry="9" fill="url(#loadingBody)" />
      <ellipse cx="55" cy="40" rx="8" ry="8" fill="url(#loadingBody)" />
      <ellipse cx="66" cy="40" rx="7" ry="7" fill="url(#loadingBody)" />
      <ellipse cx="75" cy="40" rx="6" ry="6" fill="url(#loadingBody)" />
      <ellipse cx="82" cy="40" rx="5" ry="5" fill="url(#loadingBody)" />
      
      {/* 头胸部 */}
      <path 
        d="M85 28 Q95 30, 100 35 Q105 40, 100 45 Q95 50, 85 52 Q80 52, 78 48 Q76 40, 78 32 Q80 28, 85 28" 
        fill="url(#loadingBody)" 
      />
      <path 
        d="M100 40 Q108 38, 115 40 Q108 42, 100 40" 
        fill="url(#loadingBody)" 
      />
      
      {/* 眼睛 */}
      <line x1="92" y1="35" x2="96" y2="28" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="97" cy="27" r="3" fill="#1f2937" />
      <circle cx="98" cy="26" r="1" fill="#fff" />
      <line x1="92" y1="45" x2="96" y2="52" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="97" cy="53" r="3" fill="#1f2937" />
      <circle cx="98" cy="54" r="1" fill="#fff" />
      
      {/* 触角 */}
      <path d="M98 33 Q105 25, 112 18 Q118 12, 122 8" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M98 47 Q105 55, 112 62 Q118 68, 122 72" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      
      {/* 步足 */}
      <path d="M75 34 Q70 28, 62 24" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M75 46 Q70 52, 62 56" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M68 32 Q62 24, 54 20" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M68 48 Q62 56, 54 60" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* 钳子 */}
      <g className="loading-claws">
        <path d="M80 30 Q72 22, 62 18 Q54 15, 48 12" stroke="url(#loadingClaw)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M48 12 Q42 8, 36 10 Q32 12, 35 16 Q40 14, 48 12" fill="url(#loadingClaw)" />
        <path d="M48 12 Q44 16, 38 20 Q34 22, 36 18" fill="url(#loadingClaw)" />
        
        <path d="M80 50 Q72 58, 62 62 Q54 65, 48 68" stroke="url(#loadingClaw)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M48 68 Q42 72, 36 70 Q32 68, 35 64 Q40 66, 48 68" fill="url(#loadingClaw)" />
        <path d="M48 68 Q44 64, 38 60 Q34 58, 36 62" fill="url(#loadingClaw)" />
      </g>
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
