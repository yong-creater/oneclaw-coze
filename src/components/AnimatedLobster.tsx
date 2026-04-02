'use client';

import { memo, useState, useCallback } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

// 交互消息列表
const INTERACTION_MESSAGES = [
  { text: '欢迎来到 OneClaw！', emoji: '🎉' },
  { text: '发现 117 款优质 AI 工具！', emoji: '✨' },
  { text: '点击工具卡片查看详情', emoji: '👆' },
  { text: '试试搜索功能吧', emoji: '🔍' },
  { text: '切换分类找找灵感', emoji: '💡' },
  { text: 'AI 视频工具一网打尽', emoji: '🎬' },
  { text: '感谢你的到来', emoji: '❤️' },
  { text: '今天也要加油哦', emoji: '💪' },
];

// 动画龙虾组件 - 灵动版
export const AnimatedLobster = memo(function AnimatedLobster({ 
  size = 48, 
  className = '' 
}: AnimatedLobsterProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(INTERACTION_MESSAGES[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = useCallback(() => {
    if (isAnimating) return;
    
    // 随机选择一条消息
    const randomIndex = Math.floor(Math.random() * INTERACTION_MESSAGES.length);
    setCurrentMessage(INTERACTION_MESSAGES[randomIndex]);
    
    setIsAnimating(true);
    setShowBubble(true);
    
    // 2.5秒后隐藏气泡
    setTimeout(() => {
      setShowBubble(false);
      setTimeout(() => setIsAnimating(false), 300);
    }, 2500);
  }, [isAnimating]);

  return (
    <div 
      className={`relative inline-block cursor-pointer lobster-container ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      title="点击我互动"
    >
      {/* 消息气泡 - 显示在下方 */}
      <div 
        className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap 
          bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-md border border-slate-200 
          dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200
          transition-all duration-300 z-50
          ${showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 -translate-y-2 pointer-events-none'}`}
      >
        <span className="mr-1">{currentMessage.emoji}</span>
        {currentMessage.text}
        {/* 气泡尖角 - 向上 */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 
          bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700
          -rotate-45" />
      </div>
      
      {/* 龙虾主体 */}
      <svg 
        viewBox="0 0 120 80" 
        className="w-full h-full"
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      >
        <defs>
          {/* 身体主色渐变 */}
          <linearGradient id="bodyMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          
          {/* 身体高光 */}
          <linearGradient id="bodyHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          
          {/* 钳子渐变 */}
          <linearGradient id="clawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          
          {/* 腿部渐变 */}
          <linearGradient id="legGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        
        {/* 整体 - 轻微摇摆 */}
        <g className="lobster-body">
          {/* 尾部 */}
          <g className="lobster-tail">
            <path d="M8 40 Q2 35, 0 28 Q5 32, 10 36" fill="url(#bodyMain)" />
            <path d="M8 40 Q1 40, 0 40" fill="url(#bodyMain)" />
            <path d="M8 40 Q2 45, 0 52 Q5 48, 10 44" fill="url(#bodyMain)" />
            <ellipse cx="15" cy="40" rx="8" ry="7" fill="url(#bodyMain)" />
            <ellipse cx="15" cy="38" rx="4" ry="2" fill="url(#bodyHighlight)" opacity="0.5" />
          </g>
          
          {/* 腹部（6节） */}
          <g>
            <ellipse cx="28" cy="40" rx="9" ry="8" fill="url(#bodyMain)" />
            <ellipse cx="28" cy="37" rx="4" ry="2" fill="url(#bodyHighlight)" opacity="0.4" />
            <ellipse cx="42" cy="40" rx="9" ry="9" fill="url(#bodyMain)" />
            <ellipse cx="42" cy="37" rx="4" ry="2" fill="url(#bodyHighlight)" opacity="0.4" />
            <ellipse cx="55" cy="40" rx="8" ry="8" fill="url(#bodyMain)" />
            <ellipse cx="55" cy="37" rx="3.5" ry="2" fill="url(#bodyHighlight)" opacity="0.4" />
            <ellipse cx="66" cy="40" rx="7" ry="7" fill="url(#bodyMain)" />
            <ellipse cx="66" cy="37" rx="3" ry="1.5" fill="url(#bodyHighlight)" opacity="0.4" />
            <ellipse cx="75" cy="40" rx="6" ry="6" fill="url(#bodyMain)" />
            <ellipse cx="75" cy="37" rx="2.5" ry="1.5" fill="url(#bodyHighlight)" opacity="0.4" />
            <ellipse cx="82" cy="40" rx="5" ry="5" fill="url(#bodyMain)" />
          </g>
          
          {/* 头胸部 */}
          <g>
            <path 
              d="M85 28 Q95 30, 100 35 Q105 40, 100 45 Q95 50, 85 52 Q80 52, 78 48 Q76 40, 78 32 Q80 28, 85 28" 
              fill="url(#bodyMain)" 
            />
            <path 
              d="M85 30 Q92 32, 96 36 Q98 38, 96 40 Q92 35, 85 33" 
              fill="url(#bodyHighlight)" 
              opacity="0.4" 
            />
            <path 
              d="M100 40 Q108 38, 115 40 Q108 42, 100 40" 
              fill="url(#bodyMain)" 
              stroke="#991b1d"
              strokeWidth="0.5"
            />
            
            {/* 眼睛 - 会眨眼 */}
            <g className="lobster-eyes">
              <line x1="92" y1="35" x2="96" y2="28" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="97" cy="27" r="3" fill="#1f2937" className="eye-pupil" />
              <circle cx="98" cy="26" r="1" fill="#fff" />
              <line x1="92" y1="45" x2="96" y2="52" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="97" cy="53" r="3" fill="#1f2937" className="eye-pupil" />
              <circle cx="98" cy="54" r="1" fill="#fff" />
              {/* 眼睑 - 用于眨眼动画 */}
              <ellipse cx="97" cy="27" rx="3.5" ry="0" fill="url(#bodyMain)" className="eyelid" />
              <ellipse cx="97" cy="53" rx="3.5" ry="0" fill="url(#bodyMain)" className="eyelid" />
            </g>
            
            {/* 触角 - 轻微摆动 */}
            <g className="lobster-antennae">
              <path d="M98 33 Q105 25, 112 18 Q118 12, 122 8" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-left" />
              <path d="M98 47 Q105 55, 112 62 Q118 68, 122 72" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-right" />
              <path d="M96 36 Q100 32, 104 30" stroke="#7f1d1d" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M96 44 Q100 48, 104 50" stroke="#7f1d1d" strokeWidth="1" fill="none" strokeLinecap="round" />
            </g>
          </g>
          
          {/* 步足 - 轻微摆动 */}
          <g className="lobster-legs">
            <path d="M75 34 Q70 28, 62 24" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M75 46 Q70 52, 62 56" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 33 Q66 26, 58 22" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 47 Q66 54, 58 58" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M68 32 Q62 24, 54 20" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M68 48 Q62 56, 54 60" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M65 31 Q58 22, 50 18" stroke="url(#legGradient)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M65 49 Q58 58, 50 62" stroke="url(#legGradient)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M62 30 Q56 22, 48 18" stroke="url(#legGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M62 50 Q56 58, 48 62" stroke="url(#legGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
          
          {/* 大钳子 - 开合动画 */}
          <g className="lobster-claws">
            {/* 左钳子 */}
            <g className="claw-left">
              <path d="M80 30 Q72 22, 62 18 Q54 15, 48 12" stroke="url(#clawGradient)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M48 12 Q42 8, 36 10 Q32 12, 35 16 Q40 14, 48 12" fill="url(#clawGradient)" />
              <path d="M48 12 Q44 16, 38 20 Q34 22, 36 18 Q42 16, 48 12" fill="url(#clawGradient)" />
              <circle cx="38" cy="14" r="1.5" fill="#c2410c" />
              <circle cx="40" cy="17" r="1" fill="#c2410c" />
            </g>
            
            {/* 右钳子 */}
            <g className="claw-right">
              <path d="M80 50 Q72 58, 62 62 Q54 65, 48 68" stroke="url(#clawGradient)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M48 68 Q42 72, 36 70 Q32 68, 35 64 Q40 66, 48 68" fill="url(#clawGradient)" />
              <path d="M48 68 Q44 64, 38 60 Q34 58, 36 62 Q42 64, 48 68" fill="url(#clawGradient)" />
              <circle cx="38" cy="66" r="1.5" fill="#c2410c" />
              <circle cx="40" cy="63" r="1" fill="#c2410c" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
