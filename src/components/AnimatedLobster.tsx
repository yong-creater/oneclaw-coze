'use client';

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

const INTERACTION_MESSAGES = [
  { text: '看什么看！', emoji: '😎' },
  { text: '别挡道', emoji: '🤙' },
  { text: '懂行！', emoji: '👍' },
  { text: '有眼光', emoji: '😎' },
  { text: '继续逛吧', emoji: '😏' },
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
    }, 2000);
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
      
      {/* 酷帅龙虾图片 */}
      <Image
        src="/lobster-logo.png"
        alt="OneClaw 龙虾"
        width={size}
        height={size}
        className={`w-full h-full object-contain transition-all duration-200 ${isCaught ? 'rotate-12' : ''}`}
        priority
      />
    </div>
  );
});

export default AnimatedLobster;
