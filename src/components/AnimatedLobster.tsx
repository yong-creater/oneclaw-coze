'use client';

import { memo, useState, useCallback } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

const INTERACTION_MESSAGES = [
  { text: '正在帮你找好工具~', emoji: '🔍' },
  { text: '发现了一个宝藏工具！', emoji: '✨' },
  { text: '有什么能帮到你的？', emoji: '🦞' },
  { text: '我正在努力工作中~', emoji: '💪' },
  { text: '这个工具不错哦！', emoji: '👍' },
  { text: '让我帮你搜搜看~', emoji: '🔎' },
  { text: '工具库有117款神器呢', emoji: '🚀' },
  { text: '继续逛逛吧~', emoji: '👋' },
  { text: '我是你的AI工具助手', emoji: '🤖' },
  { text: '点击卡片看详情哦', emoji: '👆' },
];

export const AnimatedLobster = memo(function AnimatedLobster({ 
  size = 48, 
  className = '' 
}: AnimatedLobsterProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(INTERACTION_MESSAGES[0]);
  const [isCaught, setIsCaught] = useState(false);

  const handleClick = useCallback(() => {
    if (isCaught) return;
    
    const randomIndex = Math.floor(Math.random() * INTERACTION_MESSAGES.length);
    setCurrentMessage(INTERACTION_MESSAGES[randomIndex]);
    
    setIsCaught(true);
    setShowBubble(true);
    
    setTimeout(() => {
      setShowBubble(false);
      setTimeout(() => setIsCaught(false), 300);
    }, 2500);
  }, [isCaught]);

  return (
    <div 
      className={`relative inline-block cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      title="点击我互动"
    >
      {/* 消息气泡 */}
      <div 
        className={`absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap 
          bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-lg border border-slate-200 
          dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200
          transition-all duration-300 z-50
          ${showBubble ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
      >
        <span className="mr-1">{currentMessage.emoji}</span>
        {currentMessage.text}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 
          bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 -rotate-45" />
      </div>
      
      {/* SVG龙虾 */}
      <svg viewBox="0 0 120 120" className={`w-full h-full ${isCaught ? 'animate-bounce' : ''}`}>
        <defs>
          <linearGradient id="bodyColor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6347" />
            <stop offset="100%" stopColor="#DC3545" />
          </linearGradient>
          <linearGradient id="clawColor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7F50" />
            <stop offset="100%" stopColor="#E85A3C" />
          </linearGradient>
        </defs>
        
        {/* 笔记本电脑 */}
        <rect x="25" y="70" width="70" height="40" rx="3" fill="#2d2d2d" />
        <rect x="30" y="75" width="60" height="28" rx="2" fill="#1a1a1a" />
        {/* 屏幕内容 */}
        <rect x="35" y="80" width="30" height="2" rx="1" fill="#4ade80" opacity="0.7" />
        <rect x="35" y="85" width="45" height="2" rx="1" fill="#60a5fa" opacity="0.7" />
        <rect x="35" y="90" width="25" height="2" rx="1" fill="#f472b6" opacity="0.7" />
        <rect x="35" y="95" width="40" height="2" rx="1" fill="#fbbf24" opacity="0.7" />
        {/* 键盘 */}
        <rect x="20" y="105" width="80" height="10" rx="2" fill="#2d2d2d" />
        
        {/* 龙虾身体 */}
        <g className="body">
          {/* 尾巴 */}
          <ellipse cx="60" cy="62" rx="18" ry="12" fill="url(#bodyColor)" />
          
          {/* 身体 */}
          <ellipse cx="60" cy="48" rx="25" ry="18" fill="url(#bodyColor)" />
          <ellipse cx="60" cy="35" rx="22" ry="15" fill="url(#bodyColor)" />
          
          {/* 头部 */}
          <ellipse cx="60" cy="22" rx="20" ry="14" fill="url(#bodyColor)" />
          
          {/* 高光 */}
          <ellipse cx="52" cy="18" rx="8" ry="5" fill="#FFB08A" opacity="0.35" />
          
          {/* 触须 */}
          <path d="M45 10 Q38 5 35 2" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="35" cy="2" r="2" fill="#8B4513" />
          <path d="M75 10 Q82 5 85 2" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="85" cy="2" r="2" fill="#8B4513" />
          
          {/* 眼睛 */}
          <circle cx="50" cy="20" r="6" fill="#1a1a1a" />
          <circle cx="48" cy="18" r="2" fill="#7dd3fc" />
          <circle cx="70" cy="20" r="6" fill="#1a1a1a" />
          <circle cx="68" cy="18" r="2" fill="#7dd3fc" />
          
          {/* 腮红 */}
          <ellipse cx="42" cy="28" rx="5" ry="3" fill="#FFB5B5" opacity="0.5" />
          <ellipse cx="78" cy="28" rx="5" ry="3" fill="#FFB5B5" opacity="0.5" />
        </g>
        
        {/* 左钳子 - 敲键盘 */}
        <g style={{ transformOrigin: '25px 40px' }}>
          <ellipse cx="15" cy="38" rx="12" ry="8" fill="url(#clawColor)" />
          <ellipse cx="10" cy="55" rx="10" ry="7" fill="url(#clawColor)">
            <animate attributeName="cy" values="55;52;55;52;55" dur="0.4s" repeatCount="indefinite" />
          </ellipse>
        </g>
        
        {/* 右钳子 - 敲键盘 */}
        <g style={{ transformOrigin: '95px 40px' }}>
          <ellipse cx="105" cy="38" rx="12" ry="8" fill="url(#clawColor)" />
          <ellipse cx="110" cy="55" rx="10" ry="7" fill="url(#clawColor)">
            <animate attributeName="cy" values="55;55;52;55;52" dur="0.4s" repeatCount="indefinite" />
          </ellipse>
        </g>
        
        {/* 敲击光效 */}
        <circle cx="20" cy="108" r="3" fill="#FF6347" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="108" r="3" fill="#FF6347" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.2s" repeatCount="indefinite" begin="0.2s" />
        </circle>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
