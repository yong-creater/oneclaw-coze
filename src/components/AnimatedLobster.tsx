'use client';

import { memo, useState, useCallback } from 'react';

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
      
      {/* SVG龙虾 - 身体静止，钳子敲键盘 */}
      <svg viewBox="0 0 100 100" className={`w-full h-full ${isCaught ? 'animate-bounce' : ''}`}>
        <defs>
          {/* 身体渐变 */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B4A" />
            <stop offset="50%" stopColor="#E85A3C" />
            <stop offset="100%" stopColor="#C94A2E" />
          </linearGradient>
          {/* 钳子渐变 */}
          <linearGradient id="clawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C5A" />
            <stop offset="100%" stopColor="#E86A3C" />
          </linearGradient>
          {/* 键盘渐变 */}
          <linearGradient id="keyboardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
        </defs>
        
        {/* 身体 - 静止不动 */}
        <g className="lobster-body">
          {/* 主体 */}
          <ellipse cx="50" cy="40" rx="22" ry="20" fill="url(#bodyGrad)" />
          {/* 身体高光 */}
          <ellipse cx="44" cy="34" rx="10" ry="6" fill="#FFB08A" opacity="0.4" />
          {/* 腹部纹理 */}
          <path d="M32 44 Q50 46 68 44" stroke="#C94A2E" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M35 50 Q50 52 65 50" stroke="#C94A2E" strokeWidth="1" fill="none" opacity="0.3" />
          
          {/* 尾巴 */}
          <ellipse cx="50" cy="62" rx="12" ry="8" fill="url(#bodyGrad)" />
          <ellipse cx="50" cy="68" rx="8" ry="5" fill="url(#clawGrad)" />
          
          {/* 触须 */}
          <path d="M38 22 Q32 12 28 6" stroke="#FF8C5A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="6" r="2" fill="#FF8C5A" />
          <path d="M62 22 Q68 12 72 6" stroke="#FF8C5A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="72" cy="6" r="2" fill="#FF8C5A" />
          
          {/* 小眼睛 */}
          <circle cx="42" cy="36" r="5" fill="#1a1a2e" />
          <circle cx="40" cy="34" r="1.5" fill="#7dd3fc" />
          <circle cx="58" cy="36" r="5" fill="#1a1a2e" />
          <circle cx="56" cy="34" r="1.5" fill="#7dd3fc" />
          
          {/* 墨镜 */}
          <rect x="36" y="32" width="12" height="8" rx="2" fill="#1a1a2e" />
          <rect x="52" y="32" width="12" height="8" rx="2" fill="#1a1a2e" />
          <rect x="47" y="35" width="6" height="2" fill="#374151" />
          
          {/* 腮红 */}
          <ellipse cx="34" cy="44" rx="4" ry="2" fill="#FFB5B5" opacity="0.5" />
          <ellipse cx="66" cy="44" rx="4" ry="2" fill="#FFB5B5" opacity="0.5" />
        </g>
        
        {/* 小腿 */}
        <g className="legs">
          <rect x="38" y="58" width="4" height="8" rx="2" fill="url(#clawGrad)" />
          <rect x="46" y="60" width="4" height="8" rx="2" fill="url(#clawGrad)" />
          <rect x="54" y="60" width="4" height="8" rx="2" fill="url(#clawGrad)" />
          <rect x="60" y="58" width="4" height="8" rx="2" fill="url(#clawGrad)" />
        </g>
        
        {/* 键盘 */}
        <g className="keyboard">
          <rect x="20" y="78" width="60" height="16" rx="2" fill="url(#keyboardGrad)" />
          {/* 按键行 */}
          <g className="keys" opacity="0.6">
            <rect x="24" y="81" width="6" height="4" rx="0.5" fill="#6b7280" className="key-1" />
            <rect x="32" y="81" width="6" height="4" rx="0.5" fill="#6b7280" className="key-2" />
            <rect x="40" y="81" width="6" height="4" rx="0.5" fill="#6b7280" className="key-3" />
            <rect x="48" y="81" width="6" height="4" rx="0.5" fill="#6b7280" className="key-1" />
            <rect x="56" y="81" width="6" height="4" rx="0.5" fill="#6b7280" className="key-2" />
            <rect x="64" y="81" width="6" height="4" rx="0.5" fill="#6b7280" className="key-3" />
            <rect x="72" y="81" width="4" height="4" rx="0.5" fill="#6b7280" className="key-1" />
          </g>
          <g className="keys" opacity="0.6">
            <rect x="26" y="87" width="5" height="4" rx="0.5" fill="#6b7280" className="key-2" />
            <rect x="33" y="87" width="5" height="4" rx="0.5" fill="#6b7280" className="key-3" />
            <rect x="40" y="87" width="5" height="4" rx="0.5" fill="#6b7280" className="key-1" />
            <rect x="47" y="87" width="12" height="4" rx="0.5" fill="#6b7280" className="key-2" />
            <rect x="61" y="87" width="5" height="4" rx="0.5" fill="#6b7280" className="key-3" />
            <rect x="68" y="87" width="5" height="4" rx="0.5" fill="#6b7280" className="key-1" />
          </g>
        </g>
        
        {/* 左钳子 - 敲键盘动画 */}
        <g className="claw-left" style={{ transformOrigin: '38px 50px' }}>
          <ellipse cx="22" cy="74" rx="8" ry="5" fill="url(#clawGrad)" className="claw-tip">
            <animate 
              attributeName="cy" 
              values="74;72;74;72;74" 
              dur="0.6s" 
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </ellipse>
          <ellipse cx="19" cy="72" rx="3" ry="2" fill="#FFB08A" opacity="0.4" />
        </g>
        
        {/* 右钳子 - 敲键盘动画（错开节奏） */}
        <g className="claw-right" style={{ transformOrigin: '62px 50px' }}>
          <ellipse cx="78" cy="74" rx="8" ry="5" fill="url(#clawGrad)" className="claw-tip">
            <animate 
              attributeName="cy" 
              values="74;74;72;74;72" 
              dur="0.6s" 
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </ellipse>
          <ellipse cx="81" cy="72" rx="3" ry="2" fill="#FFB08A" opacity="0.4" />
        </g>
        
        {/* 敲击光效 */}
        <g className="tap-effects">
          <circle cx="28" cy="83" r="2" fill="#FF6B4A" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="0.3s" repeatCount="indefinite" begin="0s" />
            <animate attributeName="r" values="2;3;2" dur="0.3s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="50" cy="83" r="2" fill="#FF6B4A" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="0.3s" repeatCount="indefinite" begin="0.15s" />
            <animate attributeName="r" values="2;3;2" dur="0.3s" repeatCount="indefinite" begin="0.15s" />
          </circle>
          <circle cx="72" cy="83" r="2" fill="#FF6B4A" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="0.3s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="r" values="2;3;2" dur="0.3s" repeatCount="indefinite" begin="0.3s" />
          </circle>
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
