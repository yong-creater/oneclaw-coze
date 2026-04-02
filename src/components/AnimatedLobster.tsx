'use client';

import { memo, useState, useCallback, useEffect } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

// 交互消息列表
const INTERACTION_MESSAGES = [
  { text: '别抓我！', emoji: '😱' },
  { text: '放我下来！', emoji: '🦞' },
  { text: '我是无辜的！', emoji: '😅' },
  { text: '轻点轻点~', emoji: '🥺' },
  { text: '你抓不到我！', emoji: '💨' },
  { text: '快去看看工具吧！', emoji: '👇' },
  { text: '哎呀被发现了！', emoji: '🙈' },
  { text: '好痒好痒！', emoji: '🤣' },
];

// 动画龙虾组件 - 弯曲版
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

  useEffect(() => {
    if (!isHovering || isCaught) return;
    
    const container = document.querySelector('.lobster-container');
    if (container) {
      const randomMove = () => {
        const x = (Math.random() - 0.5) * 3;
        const y = (Math.random() - 0.5) * 3;
        (container as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      };
      
      const interval = setInterval(randomMove, 400);
      return () => clearInterval(interval);
    }
  }, [isHovering, isCaught]);

  return (
    <div 
      className={`relative inline-block cursor-pointer lobster-container ${className} ${isCaught ? 'lobster-caught' : ''} ${isHovering ? 'lobster-hovering' : ''}`}
      style={{ width: size, height: size * 0.8 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        const container = document.querySelector('.lobster-container');
        if (container) {
          (container as HTMLElement).style.transform = '';
        }
      }}
      title="点击我互动"
    >
      {/* 消息气泡 */}
      <div 
        className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap 
          bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full shadow-md border border-slate-200 
          dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200
          transition-all duration-300 z-50
          ${showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 -translate-y-2 pointer-events-none'}`}
      >
        <span className="mr-0.5">{currentMessage.emoji}</span>
        {currentMessage.text}
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
          bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700
          -rotate-45" />
      </div>
      
      {/* 龙虾主体 - 弯曲姿态 */}
      <svg 
        viewBox="0 0 100 70" 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <linearGradient id="clawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
        </defs>
        
        {/* 整体弯曲的身体 */}
        <g className="lobster-body">
          {/* 尾扇 */}
          <g className="lobster-tail">
            <path d="M5 38 Q0 30, 2 22 Q8 28, 10 35" fill="url(#bodyGrad)" />
            <path d="M5 38 Q-2 38, 0 42" fill="url(#bodyGrad)" />
            <path d="M5 38 Q0 46, 2 54 Q8 48, 10 41" fill="url(#bodyGrad)" />
          </g>
          
          {/* 腹部 - 弯曲的节段 */}
          <path 
            d="M8 35 
               Q15 28, 22 32
               Q30 36, 38 33
               Q46 30, 54 34
               Q62 38, 70 35
               Q75 33, 78 30"
            fill="none"
            stroke="url(#bodyGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* 腹部高光 */}
          <path 
            d="M12 32 
               Q20 26, 28 30
               Q38 34, 48 31
               Q58 28, 68 32"
            fill="none"
            stroke="url(#highlightGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.4"
          />
          
          {/* 头胸部 - 稍微抬起 */}
          <g className="lobster-head">
            <ellipse cx="82" cy="28" rx="10" ry="8" fill="url(#bodyGrad)" />
            <ellipse cx="84" cy="25" rx="4" ry="2" fill="url(#highlightGrad)" opacity="0.4" />
            
            {/* 嘴部 */}
            <path d="M90 28 Q95 26, 98 28 Q95 30, 90 28" fill="url(#bodyGrad)" />
            
            {/* 眼睛 */}
            <g className="lobster-eyes">
              <line x1="85" y1="24" x2="88" y2="16" stroke="#7f1d1d" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="89" cy="15" r="2.5" fill="#1f2937" />
              <circle cx="89.5" cy="14.5" r="0.8" fill="#fff" />
              
              <line x1="85" y1="32" x2="88" y2="40" stroke="#7f1d1d" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="89" cy="41" r="2.5" fill="#1f2937" />
              <circle cx="89.5" cy="41.5" r="0.8" fill="#fff" />
              
              {/* 眼睑 */}
              <ellipse cx="89" cy="15" rx="3" ry="0" fill="url(#bodyGrad)" className="eyelid" />
              <ellipse cx="89" cy="41" rx="3" ry="0" fill="url(#bodyGrad)" className="eyelid" />
            </g>
            
            {/* 触角 */}
            <g className="lobster-antennae">
              <path d="M88 22 Q94 14, 98 8" stroke="#991b1b" strokeWidth="1" fill="none" strokeLinecap="round" className="antenna-left" />
              <path d="M88 34 Q94 42, 98 48" stroke="#991b1b" strokeWidth="1" fill="none" strokeLinecap="round" className="antenna-right" />
            </g>
          </g>
          
          {/* 步足 - 向下弯曲 */}
          <g className="lobster-legs">
            <path d="M72 33 Q68 40, 62 48" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M72 37 Q68 44, 62 52" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M65 32 Q60 38, 54 45" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M65 36 Q60 42, 54 49" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M58 31 Q52 36, 46 42" stroke="#b91c1c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M58 35 Q52 40, 46 46" stroke="#b91c1c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
          
          {/* 大钳子 - 更有活力 */}
          <g className="lobster-claws">
            {/* 上钳子 */}
            <g className="claw-left">
              <path d="M78 26 Q70 18, 60 14 Q52 12, 46 10" stroke="url(#clawGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M46 10 Q42 6, 38 8 Q35 10, 37 13 Q42 11, 46 10" fill="url(#clawGrad)" />
              <path d="M46 10 Q44 13, 40 16 Q37 18, 38 14" fill="url(#clawGrad)" />
            </g>
            
            {/* 下钳子 */}
            <g className="claw-right">
              <path d="M78 36 Q72 46, 64 52 Q58 56, 50 58" stroke="url(#clawGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M50 58 Q46 62, 42 60 Q39 58, 41 54 Q46 56, 50 58" fill="url(#clawGrad)" />
              <path d="M50 58 Q48 54, 44 50 Q41 48, 42 52" fill="url(#clawGrad)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
