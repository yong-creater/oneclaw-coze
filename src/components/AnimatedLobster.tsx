'use client';

import { memo, useState, useCallback, useEffect } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

const INTERACTION_MESSAGES = [
  { text: '别抓我！', emoji: '😱' },
  { text: '放我下来！', emoji: '🦞' },
  { text: '轻点轻点~', emoji: '🥺' },
  { text: '你抓不到我！', emoji: '💨' },
  { text: '好痒好痒！', emoji: '🤣' },
  { text: '哈哈哈~', emoji: '😂' },
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
      
      {/* 可爱龙虾 SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full lobster-main">
        <defs>
          <linearGradient id="bodyColor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="50%" stopColor="#ee5a5a" />
            <stop offset="100%" stopColor="#c92a2a" />
          </linearGradient>
          <linearGradient id="clawColor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffa94d" />
            <stop offset="100%" stopColor="#e8590c" />
          </linearGradient>
          <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* 整体龙虾 */}
        <g className="lobster-whole">
          {/* 尾巴 */}
          <g className="lobster-tail">
            <ellipse cx="20" cy="52" rx="12" ry="10" fill="url(#bodyColor)" />
            <ellipse cx="12" cy="52" rx="6" ry="5" fill="url(#bodyColor)" />
            <path d="M6 48 Q2 50, 6 52 Q2 54, 6 56" fill="url(#bodyColor)" />
          </g>
          
          {/* 身体节段 */}
          <ellipse cx="38" cy="52" rx="14" ry="12" fill="url(#bodyColor)" />
          <ellipse cx="56" cy="50" rx="13" ry="11" fill="url(#bodyColor)" />
          <ellipse cx="72" cy="48" rx="11" ry="10" fill="url(#bodyColor)" />
          
          {/* 身体高光 */}
          <ellipse cx="38" cy="47" rx="8" ry="4" fill="url(#shine)" />
          <ellipse cx="56" cy="45" rx="7" ry="3" fill="url(#shine)" />
          <ellipse cx="72" cy="43" rx="5" ry="2" fill="url(#shine)" />
          
          {/* 头部 */}
          <g className="lobster-head">
            <ellipse cx="85" cy="48" rx="12" ry="14" fill="url(#bodyColor)" />
            <ellipse cx="85" cy="42" rx="6" ry="3" fill="url(#shine)" />
            
            {/* 眼睛 - 可爱的大眼睛 */}
            <g className="lobster-eyes">
              {/* 左眼 */}
              <circle cx="88" cy="40" r="5" fill="#fff" />
              <circle cx="89" cy="40" r="3" fill="#1a1a2e" className="eye-ball" />
              <circle cx="90" cy="39" r="1" fill="#fff" />
              {/* 眼睑 */}
              <ellipse cx="88" cy="40" rx="5.5" ry="0" fill="url(#bodyColor)" className="eyelid" />
              
              {/* 右眼 */}
              <circle cx="88" cy="56" r="5" fill="#fff" />
              <circle cx="89" cy="56" r="3" fill="#1a1a2e" className="eye-ball" />
              <circle cx="90" cy="55" r="1" fill="#fff" />
              {/* 眼睑 */}
              <ellipse cx="88" cy="56" rx="5.5" ry="0" fill="url(#bodyColor)" className="eyelid" />
            </g>
            
            {/* 眼柄 */}
            <line x1="85" y1="44" x2="88" y2="40" stroke="#c92a2a" strokeWidth="2" strokeLinecap="round" />
            <line x1="85" y1="52" x2="88" y2="56" stroke="#c92a2a" strokeWidth="2" strokeLinecap="round" />
            
            {/* 触角 */}
            <g className="lobster-antenna">
              <path d="M88 42 Q94 35, 98 28" stroke="#c92a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" className="antenna-left" />
              <path d="M88 54 Q94 61, 98 68" stroke="#c92a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" className="antenna-right" />
            </g>
          </g>
          
          {/* 步足 */}
          <g className="lobster-legs">
            <path d="M68 42 Q62 35, 55 32" stroke="#c92a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 58 Q66 65, 58 68" stroke="#c92a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M60 40 Q54 32, 46 28" stroke="#c92a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M64 60 Q58 68, 50 72" stroke="#c92a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M52 38 Q46 30, 38 26" stroke="#c92a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M56 62 Q50 70, 42 74" stroke="#c92a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
          
          {/* 大钳子 */}
          <g className="lobster-claws">
            {/* 上钳子 */}
            <g className="claw-upper">
              <path d="M75 38 Q68 28, 58 24 Q52 22, 46 20" stroke="url(#clawColor)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <ellipse cx="46" cy="20" rx="6" ry="5" fill="url(#clawColor)" />
              <ellipse cx="46" cy="20" rx="3" ry="2" fill="#ffec99" opacity="0.5" />
            </g>
            
            {/* 下钳子 */}
            <g className="claw-lower">
              <path d="M75 58 Q68 68, 58 72 Q52 74, 46 76" stroke="url(#clawColor)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <ellipse cx="46" cy="76" rx="6" ry="5" fill="url(#clawColor)" />
              <ellipse cx="46" cy="76" rx="3" ry="2" fill="#ffec99" opacity="0.5" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
