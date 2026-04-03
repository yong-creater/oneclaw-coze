'use client';

import { memo, useState, useCallback } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

// 龙虾助手风格的互动语录
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
      
      {/* SVG龙虾 - 和原图一模一样 */}
      <svg viewBox="0 0 200 200" className={`w-full h-full ${isCaught ? 'animate-bounce' : ''}`}>
        <defs>
          {/* 身体渐变 - 鲜亮的红色 */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B4A" />
            <stop offset="50%" stopColor="#E85A3C" />
            <stop offset="100%" stopColor="#C94A2E" />
          </linearGradient>
          {/* 钳子渐变 - 略浅的橙色 */}
          <linearGradient id="clawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C5A" />
            <stop offset="100%" stopColor="#E86A3C" />
          </linearGradient>
          {/* 键盘渐变 */}
          <linearGradient id="keyboardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          {/* 高光渐变 */}
          <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB08A" />
            <stop offset="100%" stopColor="#FF8C5A" />
          </linearGradient>
        </defs>
        
        {/* 身体 - 静止不动 */}
        <g className="lobster-body">
          {/* 尾部 */}
          <ellipse cx="100" cy="155" rx="25" ry="18" fill="url(#bodyGrad)" />
          <ellipse cx="100" cy="168" rx="15" ry="10" fill="url(#clawGrad)" />
          <ellipse cx="100" cy="178" rx="8" ry="6" fill="url(#clawGrad)" />
          
          {/* 身体主体 - 分节 */}
          <ellipse cx="100" cy="130" rx="35" ry="22" fill="url(#bodyGrad)" />
          <ellipse cx="100" cy="110" rx="38" ry="25" fill="url(#bodyGrad)" />
          <ellipse cx="100" cy="90" rx="35" ry="22" fill="url(#bodyGrad)" />
          
          {/* 身体高光 */}
          <ellipse cx="90" cy="85" rx="15" ry="8" fill="#FFB08A" opacity="0.4" />
          <ellipse cx="88" cy="105" rx="12" ry="6" fill="#FFB08A" opacity="0.3" />
          
          {/* 身体纹理线 */}
          <path d="M65 90 Q100 95 135 90" stroke="#C94A2E" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M62 110 Q100 115 138 110" stroke="#C94A2E" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M65 130 Q100 135 135 130" stroke="#C94A2E" strokeWidth="1.5" fill="none" opacity="0.4" />
          
          {/* 头部 */}
          <ellipse cx="100" cy="68" rx="32" ry="24" fill="url(#bodyGrad)" />
          <ellipse cx="92" cy="60" rx="12" ry="7" fill="#FFB08A" opacity="0.35" />
          
          {/* 触须 */}
          <path d="M75 50 Q60 35 55 20" stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="55" cy="20" r="3" fill="#8B4513" />
          <path d="M125 50 Q140 35 145 20" stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="145" cy="20" r="3" fill="#8B4513" />
          
          {/* 眼睛 - 没有墨镜，清晰的黑色大眼睛 */}
          <g className="eyes">
            {/* 左眼 */}
            <circle cx="82" cy="62" r="10" fill="#1a1a2e" />
            <circle cx="79" cy="59" r="3" fill="#7dd3fc" />
            <circle cx="85" cy="65" r="2" fill="white" opacity="0.6" />
            
            {/* 右眼 */}
            <circle cx="118" cy="62" r="10" fill="#1a1a2e" />
            <circle cx="115" cy="59" r="3" fill="#7dd3fc" />
            <circle cx="121" cy="65" r="2" fill="white" opacity="0.6" />
          </g>
          
          {/* 腮红 */}
          <ellipse cx="68" cy="75" rx="8" ry="4" fill="#FFB5B5" opacity="0.5" />
          <ellipse cx="132" cy="75" rx="8" ry="4" fill="#FFB5B5" opacity="0.5" />
          
          {/* 微笑嘴巴 */}
          <path d="M90 82 Q100 90 110 82" stroke="#C94A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
        
        {/* 小腿 */}
        <g className="legs">
          <rect x="70" y="140" width="6" height="15" rx="3" fill="url(#clawGrad)" />
          <rect x="82" y="142" width="6" height="16" rx="3" fill="url(#clawGrad)" />
          <rect x="112" y="142" width="6" height="16" rx="3" fill="url(#clawGrad)" />
          <rect x="124" y="140" width="6" height="15" rx="3" fill="url(#clawGrad)" />
        </g>
        
        {/* 笔记本电脑 */}
        <g className="laptop">
          {/* 屏幕 */}
          <rect x="55" y="115" width="90" height="55" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="2" />
          <rect x="60" y="120" width="80" height="40" rx="2" fill="#111827" />
          
          {/* 屏幕内容 - 简单的代码行 */}
          <rect x="65" y="128" width="40" height="3" rx="1" fill="#4ade80" opacity="0.6" />
          <rect x="65" y="135" width="55" height="3" rx="1" fill="#60a5fa" opacity="0.6" />
          <rect x="65" y="142" width="35" height="3" rx="1" fill="#f472b6" opacity="0.6" />
          <rect x="65" y="149" width="50" height="3" rx="1" fill="#fbbf24" opacity="0.6" />
          
          {/* 键盘底座 */}
          <rect x="50" y="170" width="100" height="12" rx="2" fill="#1f2937" stroke="#374151" strokeWidth="1" />
          
          {/* 键盘按键 */}
          <g className="keys" opacity="0.5">
            <rect x="55" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="65" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="75" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="85" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="95" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="105" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="115" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="125" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
            <rect x="135" y="173" width="8" height="5" rx="0.5" fill="#6b7280" />
          </g>
        </g>
        
        {/* 左钳子 - 敲键盘动画 */}
        <g className="claw-left" style={{ transformOrigin: '50px 100px' }}>
          {/* 钳子手臂 */}
          <ellipse cx="40" cy="95" rx="18" ry="12" fill="url(#clawGrad)" />
          <ellipse cx="35" cy="92" rx="6" ry="4" fill="#FFB08A" opacity="0.4" />
          {/* 钳子头部 */}
          <ellipse cx="35" cy="120" rx="14" ry="10" fill="url(#clawGrad)" className="claw-tip-left">
            <animate 
              attributeName="cy" 
              values="120;115;120;115;120" 
              dur="0.5s" 
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </ellipse>
          <ellipse cx="32" cy="118" rx="5" ry="3" fill="#FFB08A" opacity="0.4" />
        </g>
        
        {/* 右钳子 - 敲键盘动画（错开节奏） */}
        <g className="claw-right" style={{ transformOrigin: '150px 100px' }}>
          {/* 钳子手臂 */}
          <ellipse cx="160" cy="95" rx="18" ry="12" fill="url(#clawGrad)" />
          <ellipse cx="165" cy="92" rx="6" ry="4" fill="#FFB08A" opacity="0.4" />
          {/* 钳子头部 */}
          <ellipse cx="165" cy="120" rx="14" ry="10" fill="url(#clawGrad)" className="claw-tip-right">
            <animate 
              attributeName="cy" 
              values="120;120;115;120;115" 
              dur="0.5s" 
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </ellipse>
          <ellipse cx="168" cy="118" rx="5" ry="3" fill="#FFB08A" opacity="0.4" />
        </g>
        
        {/* 敲击光效 */}
        <g className="tap-effects">
          <circle cx="70" cy="175" r="4" fill="#FF6B4A" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.25s" repeatCount="indefinite" begin="0s" />
            <animate attributeName="r" values="4;6;4" dur="0.25s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="130" cy="175" r="4" fill="#FF6B4A" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.25s" repeatCount="indefinite" begin="0.25s" />
            <animate attributeName="r" values="4;6;4" dur="0.25s" repeatCount="indefinite" begin="0.25s" />
          </circle>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
