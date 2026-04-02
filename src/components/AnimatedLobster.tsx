'use client';

import { memo, useState, useCallback } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

const INTERACTION_MESSAGES = [
  { text: '别抓我！', emoji: '😱' },
  { text: '放我下来！', emoji: '🦞' },
  { text: '轻点轻点~', emoji: '🥺' },
  { text: '你抓不到我！', emoji: '💨' },
  { text: '好痒！', emoji: '🤣' },
];

export const AnimatedLobster = memo(function AnimatedLobster({ 
  size = 48, 
  className = '' 
}: AnimatedLobsterProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(INTERACTION_MESSAGES[0]);
  const [isCaught, setIsCaught] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = useCallback(() => {
    if (isCaught) return;
    
    const randomIndex = Math.floor(Math.random() * INTERACTION_MESSAGES.length);
    setCurrentMessage(INTERACTION_MESSAGES[randomIndex]);
    
    setIsCaught(true);
    setShowBubble(true);
    
    setTimeout(() => {
      setShowBubble(false);
      setTimeout(() => setIsCaught(false), 300);
    }, 2000);
  }, [isCaught]);

  return (
    <div 
      className={`relative inline-block cursor-pointer lobster-wrap ${className} ${isCaught ? 'lobster-caught' : ''} ${isHovering ? 'lobster-hovering' : ''}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title="点击我互动"
    >
      {/* 消息气泡 */}
      <div 
        className={`absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap 
          bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full shadow-md border border-slate-200 
          dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200
          transition-all duration-300 z-50
          ${showBubble ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
      >
        <span className="mr-0.5">{currentMessage.emoji}</span>
        {currentMessage.text}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 
          bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 -rotate-45" />
      </div>
      
      {/* 可爱卡通龙虾 SVG */}
      <svg viewBox="0 0 64 64" className="w-full h-full lobster-main">
        <defs>
          {/* 身体渐变 - 橙红色 */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B4A" />
            <stop offset="50%" stopColor="#E85A3C" />
            <stop offset="100%" stopColor="#C94A2E" />
          </linearGradient>
          
          {/* 钳子渐变 - 橙色 */}
          <linearGradient id="clawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C5A" />
            <stop offset="100%" stopColor="#E86A3C" />
          </linearGradient>
          
          {/* 高光渐变 */}
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB08A" />
            <stop offset="100%" stopColor="#FF6B4A" />
          </linearGradient>
        </defs>
        
        {/* 主体 - 圆润椭圆形 */}
        <g className="lobster-body">
          {/* 身体主体 */}
          <ellipse cx="32" cy="34" rx="20" ry="18" fill="url(#bodyGradient)" />
          
          {/* 身体高光 */}
          <ellipse cx="28" cy="28" rx="10" ry="6" fill="url(#highlightGradient)" opacity="0.5" />
          
          {/* 腹部纹理 */}
          <path d="M18 36 Q32 38 46 36" stroke="#C94A2E" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M20 40 Q32 42 44 40" stroke="#C94A2E" strokeWidth="1" fill="none" opacity="0.3" />
        </g>
        
        {/* 左钳子 */}
        <g className="claw-left">
          <ellipse cx="10" cy="28" rx="8" ry="6" fill="url(#clawGradient)" />
          <ellipse cx="7" cy="26" rx="3" ry="2" fill="#FFB08A" opacity="0.4" />
        </g>
        
        {/* 右钳子 */}
        <g className="claw-right">
          <ellipse cx="54" cy="28" rx="8" ry="6" fill="url(#clawGradient)" />
          <ellipse cx="57" cy="26" rx="3" ry="2" fill="#FFB08A" opacity="0.4" />
        </g>
        
        {/* 小短腿 */}
        <g className="legs">
          <rect x="20" y="50" width="5" height="8" rx="2" fill="url(#clawGradient)" />
          <rect x="28" y="52" width="5" height="8" rx="2" fill="url(#clawGradient)" />
          <rect x="36" y="52" width="5" height="8" rx="2" fill="url(#clawGradient)" />
          <rect x="44" y="50" width="5" height="8" rx="2" fill="url(#clawGradient)" />
        </g>
        
        {/* 触须 */}
        <g className="antennas">
          {/* 左触须 */}
          <path d="M24 16 Q20 8 16 4" stroke="#FF8C5A" strokeWidth="2.5" fill="none" strokeLinecap="round" className="antenna-left" />
          <circle cx="16" cy="4" r="2" fill="#FF8C5A" />
          
          {/* 右触须 */}
          <path d="M40 16 Q44 8 48 4" stroke="#FF8C5A" strokeWidth="2.5" fill="none" strokeLinecap="round" className="antenna-right" />
          <circle cx="48" cy="4" r="2" fill="#FF8C5A" />
        </g>
        
        {/* 眼睛 */}
        <g className="eyes">
          {/* 左眼 */}
          <circle cx="24" cy="28" r="6" fill="#1a1a2e" className="eye-left" />
          <circle cx="22" cy="26" r="2" fill="#7dd3fc" />
          <circle cx="26" cy="30" r="1.5" fill="white" opacity="0.6" />
          
          {/* 右眼 */}
          <circle cx="40" cy="28" r="6" fill="#1a1a2e" className="eye-right" />
          <circle cx="38" cy="26" r="2" fill="#7dd3fc" />
          <circle cx="42" cy="30" r="1.5" fill="white" opacity="0.6" />
        </g>
        
        {/* 腮红 */}
        <g className="blush">
          <ellipse cx="16" cy="36" rx="4" ry="2" fill="#FFB5B5" opacity="0.5" />
          <ellipse cx="48" cy="36" rx="4" ry="2" fill="#FFB5B5" opacity="0.5" />
        </g>
        
        {/* 嘴巴 - 微笑 */}
        <path d="M28 42 Q32 46 36 42" stroke="#C94A2E" strokeWidth="2" fill="none" strokeLinecap="round" className="mouth" />
      </svg>
    </div>
  );
});

export default AnimatedLobster;
