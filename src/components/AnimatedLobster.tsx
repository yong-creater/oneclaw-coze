'use client';

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

// 程序员风格的有趣语录
const INTERACTION_MESSAGES = [
  { text: '我在专心写代码，怎么啦？', emoji: '⌨️' },
  { text: '别吵，这个bug快修完了', emoji: '🐛' },
  { text: '等我提交这个PR', emoji: '📝' },
  { text: '需求又变了？', emoji: '🙄' },
  { text: '代码能跑就行', emoji: '😏' },
  { text: '这不是bug，是feature', emoji: '✨' },
  { text: '在我电脑上是好的啊', emoji: '🤷' },
  { text: '今天一定不加班', emoji: '🫠' },
  { text: '编译中，勿扰...', emoji: '⏳' },
  { text: '你试试重启一下', emoji: '🔄' },
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
      
      {/* 敲键盘的酷龙虾图片 */}
      <Image
        src="/lobster-logo.png"
        alt="OneClaw 龙虾"
        width={size}
        height={size}
        className={`w-full h-full object-contain transition-all duration-200 ${isCaught ? 'animate-bounce' : ''}`}
        priority
      />
    </div>
  );
});

export default AnimatedLobster;
