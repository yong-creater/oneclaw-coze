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
      style={{ width: size, height: size * 0.7 }}
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
      
      {/* 龙虾 SVG */}
      <svg viewBox="0 0 120 80" className="w-full h-full lobster-main">
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
        </defs>
        
        <g className="lobster-whole">
          {/* 尾部 */}
          <g className="lobster-tail">
            <path d="M8 40 Q2 35, 0 28 Q5 32, 10 36" fill="url(#bodyGrad)" />
            <path d="M8 40 Q1 40, 0 40" fill="url(#bodyGrad)" />
            <path d="M8 40 Q2 45, 0 52 Q5 48, 10 44" fill="url(#bodyGrad)" />
            <ellipse cx="15" cy="40" rx="8" ry="7" fill="url(#bodyGrad)" />
            <ellipse cx="15" cy="38" rx="4" ry="2" fill="url(#shine)" opacity="0.5" />
          </g>
          
          {/* 腹部 */}
          <g className="lobster-abdomen">
            <ellipse cx="28" cy="40" rx="9" ry="8" fill="url(#bodyGrad)" />
            <ellipse cx="28" cy="37" rx="4" ry="2" fill="url(#shine)" opacity="0.4" />
            <ellipse cx="42" cy="40" rx="9" ry="9" fill="url(#bodyGrad)" />
            <ellipse cx="42" cy="37" rx="4" ry="2" fill="url(#shine)" opacity="0.4" />
            <ellipse cx="55" cy="40" rx="8" ry="8" fill="url(#bodyGrad)" />
            <ellipse cx="55" cy="37" rx="3.5" ry="2" fill="url(#shine)" opacity="0.4" />
            <ellipse cx="66" cy="40" rx="7" ry="7" fill="url(#bodyGrad)" />
            <ellipse cx="66" cy="37" rx="3" ry="1.5" fill="url(#shine)" opacity="0.4" />
            <ellipse cx="75" cy="40" rx="6" ry="6" fill="url(#bodyGrad)" />
            <ellipse cx="82" cy="40" rx="5" ry="5" fill="url(#bodyGrad)" />
          </g>
          
          {/* 头胸部 */}
          <g className="lobster-head">
            <path d="M85 28 Q95 30, 100 35 Q105 40, 100 45 Q95 50, 85 52 Q80 52, 78 48 Q76 40, 78 32 Q80 28, 85 28" fill="url(#bodyGrad)" />
            <path d="M85 30 Q92 32, 96 36 Q98 38, 96 40 Q92 35, 85 33" fill="url(#shine)" opacity="0.3" />
            <path d="M100 40 Q108 38, 115 40 Q108 42, 100 40" fill="url(#bodyGrad)" stroke="#991b1b" strokeWidth="0.5" />
            
            {/* 眼睛 */}
            <g className="lobster-eyes">
              <line x1="92" y1="35" x2="96" y2="28" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="97" cy="27" r="3" fill="#1f2937" className="eye-pupil" />
              <circle cx="98" cy="26" r="1" fill="#fff" />
              <ellipse cx="97" cy="27" rx="3.5" ry="0" fill="url(#bodyGrad)" className="eyelid" />
              
              <line x1="92" y1="45" x2="96" y2="52" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="97" cy="53" r="3" fill="#1f2937" className="eye-pupil" />
              <circle cx="98" cy="54" r="1" fill="#fff" />
              <ellipse cx="97" cy="53" rx="3.5" ry="0" fill="url(#bodyGrad)" className="eyelid" />
            </g>
            
            {/* 触角 */}
            <g className="lobster-antenna">
              <path d="M98 33 Q105 25, 112 18 Q118 12, 122 8" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-top" />
              <path d="M98 47 Q105 55, 112 62 Q118 68, 122 72" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-bottom" />
              <path d="M96 36 Q100 32, 104 30" stroke="#7f1d1d" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M96 44 Q100 48, 104 50" stroke="#7f1d1d" strokeWidth="1" fill="none" strokeLinecap="round" />
            </g>
          </g>
          
          {/* 步足 */}
          <g className="lobster-legs">
            <path d="M75 34 Q70 28, 62 24" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M75 46 Q70 52, 62 56" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 33 Q66 26, 58 22" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 47 Q66 54, 58 58" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M68 32 Q62 24, 54 20" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M68 48 Q62 56, 54 60" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M65 31 Q58 22, 50 18" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M65 49 Q58 58, 50 62" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M62 30 Q56 22, 48 18" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M62 50 Q56 58, 48 62" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
          
          {/* 大钳子 */}
          <g className="lobster-claws">
            <g className="claw-top">
              <path d="M80 30 Q72 22, 62 18 Q54 15, 48 12" stroke="url(#clawGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M48 12 Q42 8, 36 10 Q32 12, 35 16 Q40 14, 48 12" fill="url(#clawGrad)" />
              <path d="M48 12 Q44 16, 38 20 Q34 22, 36 18 Q42 16, 48 12" fill="url(#clawGrad)" />
            </g>
            
            <g className="claw-bottom">
              <path d="M80 50 Q72 58, 62 62 Q54 65, 48 68" stroke="url(#clawGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M48 68 Q42 72, 36 70 Q32 68, 35 64 Q40 66, 48 68" fill="url(#clawGrad)" />
              <path d="M48 68 Q44 64, 38 60 Q34 58, 36 62 Q42 64, 48 68" fill="url(#clawGrad)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
