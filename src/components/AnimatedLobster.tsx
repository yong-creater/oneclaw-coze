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
      style={{ width: size, height: size * 0.75 }}
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
      
      {/* 龙虾 SVG - 更像真实龙虾的形象 */}
      <svg viewBox="0 0 100 75" className="w-full h-full lobster-main">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="clawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        
        <g className="lobster-whole">
          {/* 大钳子 - 左边 */}
          <g className="claw-left">
            <path d="M18 28 Q12 18, 8 12 Q6 8, 8 6 Q12 4, 16 8 Q14 12, 12 16 Q14 14, 18 18 Q20 22, 18 28" 
              fill="url(#clawGrad)" stroke="#c2410c" strokeWidth="0.5" />
            <path d="M10 10 Q8 8, 10 6 Q13 5, 15 8" fill="url(#clawGrad)" />
            <path d="M14 16 Q16 14, 18 18" stroke="#fdba74" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
          
          {/* 大钳子 - 右边 */}
          <g className="claw-right">
            <path d="M18 47 Q12 57, 8 63 Q6 67, 8 69 Q12 71, 16 67 Q14 63, 12 59 Q14 61, 18 57 Q20 53, 18 47" 
              fill="url(#clawGrad)" stroke="#c2410c" strokeWidth="0.5" />
            <path d="M10 65 Q8 67, 10 69 Q13 70, 15 67" fill="url(#clawGrad)" />
            <path d="M14 59 Q16 61, 18 57" stroke="#fdba74" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
          
          {/* 步足 */}
          <g className="lobster-legs">
            <path d="M25 32 Q22 28, 18 26 Q14 24, 10 23" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M25 43 Q22 47, 18 49 Q14 51, 10 52" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M30 30 Q26 24, 22 20 Q18 16, 14 14" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M30 45 Q26 51, 22 55 Q18 59, 14 61" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M36 29 Q32 22, 28 17 Q24 12, 20 9" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M36 46 Q32 53, 28 58 Q24 63, 20 66" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
          
          {/* 身体 - 粗壮的分节 */}
          <g className="lobster-body">
            {/* 头胸部 */}
            <ellipse cx="40" cy="37.5" rx="12" ry="15" fill="url(#bodyGrad)" />
            <ellipse cx="40" cy="33" rx="6" ry="4" fill="url(#shine)" opacity="0.3" />
            
            {/* 腹部分节 */}
            <ellipse cx="52" cy="37.5" rx="9" ry="12" fill="url(#bodyGrad)" />
            <ellipse cx="52" cy="34" rx="4.5" ry="3" fill="url(#shine)" opacity="0.25" />
            
            <ellipse cx="62" cy="37.5" rx="7.5" ry="10" fill="url(#bodyGrad)" />
            <ellipse cx="62" cy="34" rx="3.5" ry="2.5" fill="url(#shine)" opacity="0.25" />
            
            <ellipse cx="70" cy="37.5" rx="6" ry="8" fill="url(#bodyGrad)" />
            
            <ellipse cx="76" cy="37.5" rx="4.5" ry="6" fill="url(#bodyGrad)" />
          </g>
          
          {/* 尾部扇形 */}
          <g className="lobster-tail">
            <path d="M80 37.5 Q90 30, 95 25 Q92 37.5, 95 50 Q90 45, 80 37.5" fill="url(#tailGrad)" />
            <path d="M82 37.5 Q88 33, 92 30" stroke="#991b1b" strokeWidth="0.8" fill="none" />
            <path d="M82 37.5 Q88 42, 92 45" stroke="#991b1b" strokeWidth="0.8" fill="none" />
            <path d="M82 37.5 Q88 37.5, 93 37.5" stroke="#991b1b" strokeWidth="0.8" fill="none" />
          </g>
          
          {/* 眼睛 - 短触须 */}
          <g className="lobster-eyes">
            {/* 眼柄 */}
            <line x1="42" y1="26" x2="44" y2="20" stroke="#7f1d1d" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="42" y1="49" x2="44" y2="55" stroke="#7f1d1d" strokeWidth="1.8" strokeLinecap="round" />
            
            {/* 眼球 */}
            <circle cx="44" cy="19" r="3.5" fill="#1f2937" className="eye-pupil" />
            <circle cx="45.5" cy="17.5" r="1.2" fill="#fff" />
            <ellipse cx="44" cy="19" rx="4" ry="0" fill="url(#bodyGrad)" className="eyelid" />
            
            <circle cx="44" cy="56" r="3.5" fill="#1f2937" className="eye-pupil" />
            <circle cx="45.5" cy="57.5" r="1.2" fill="#fff" />
            <ellipse cx="44" cy="56" rx="4" ry="0" fill="url(#bodyGrad)" className="eyelid" />
          </g>
          
          {/* 短触角 */}
          <g className="lobster-antenna">
            <path d="M36 26 Q38 22, 40 20 Q42 18, 44 17" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-short-top" />
            <path d="M36 49 Q38 53, 40 55 Q42 57, 44 58" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-short-bottom" />
          </g>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
