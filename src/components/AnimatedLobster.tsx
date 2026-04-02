'use client';

import { memo } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

// 动画龙虾组件
export const AnimatedLobster = memo(function AnimatedLobster({ 
  size = 48, 
  className = '' 
}: AnimatedLobsterProps) {
  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 气泡效果 */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="lobster-bubble" style={{ left: '20%', animationDelay: '0s' }} />
        <div className="lobster-bubble" style={{ left: '50%', animationDelay: '0.5s' }} />
        <div className="lobster-bubble" style={{ left: '80%', animationDelay: '1s' }} />
      </div>
      
      {/* 龙虾主体 */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full lobster-swim"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))' }}
      >
        <defs>
          {/* 身体渐变 */}
          <linearGradient id="lobsterBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          
          {/* 钳子渐变 */}
          <linearGradient id="lobsterClaw" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          
          {/* 高光渐变 */}
          <linearGradient id="lobsterHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        
        {/* 尾巴 - 摆动动画 */}
        <g className="lobster-tail">
          {/* 尾扇 */}
          <path 
            d="M15 50 Q5 45, 2 35 Q8 40, 15 45 Q8 45, 2 55 Q8 50, 15 55 Q5 55, 2 65 Q5 60, 15 55" 
            fill="url(#lobsterBody)"
            stroke="#991b1b"
            strokeWidth="0.5"
          />
          {/* 尾节 */}
          <ellipse cx="22" cy="50" rx="8" ry="6" fill="url(#lobsterBody)" />
        </g>
        
        {/* 腹部 - 分节 */}
        <g className="lobster-abdomen">
          <ellipse cx="35" cy="50" rx="10" ry="8" fill="url(#lobsterBody)" />
          <ellipse cx="48" cy="50" rx="10" ry="9" fill="url(#lobsterBody)" />
          <ellipse cx="60" cy="50" rx="9" ry="8" fill="url(#lobsterBody)" />
          {/* 腹部纹理 */}
          <path d="M30 46 Q35 44, 40 46" stroke="#991b1b" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M43 45 Q48 43, 53 45" stroke="#991b1b" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M55 46 Q60 44, 65 46" stroke="#991b1b" strokeWidth="0.5" fill="none" opacity="0.5" />
        </g>
        
        {/* 头胸部 */}
        <g className="lobster-thorax">
          <ellipse cx="75" cy="50" rx="12" ry="14" fill="url(#lobsterBody)" />
          {/* 高光 */}
          <ellipse cx="75" cy="45" rx="8" ry="6" fill="url(#lobsterHighlight)" />
          {/* 眼睛 */}
          <g className="lobster-eyes">
            {/* 眼柄 */}
            <line x1="78" y1="42" x2="85" y2="35" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
            <line x1="78" y1="42" x2="72" y2="35" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
            {/* 眼球 */}
            <circle cx="86" cy="34" r="3" fill="#1f2937" />
            <circle cx="71" cy="34" r="3" fill="#1f2937" />
            <circle cx="87" cy="33" r="1" fill="white" />
            <circle cx="72" cy="33" r="1" fill="white" />
          </g>
          {/* 触角 */}
          <g className="lobster-antenna">
            <path d="M82 38 Q90 30, 95 20" stroke="#991b1b" strokeWidth="1.5" fill="none" strokeLinecap="round" className="antenna-wave" />
            <path d="M68 38 Q60 30, 55 20" stroke="#991b1b" strokeWidth="1.5" fill="none" strokeLinecap="round" className="antenna-wave-delayed" />
          </g>
        </g>
        
        {/* 大钳子 - 左 */}
        <g className="lobster-claw-left">
          {/* 钳臂 */}
          <path 
            d="M70 60 Q65 70, 55 75 Q50 78, 45 85" 
            stroke="url(#lobsterClaw)" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
          />
          {/* 钳子 */}
          <g transform="translate(45, 85) rotate(-30)">
            <path 
              d="M0 0 Q-8 -5, -15 0 Q-8 5, 0 0" 
              fill="url(#lobsterClaw)"
              className="claw-snap"
            />
            <path 
              d="M0 0 Q-8 8, -12 15 Q-5 10, 0 0" 
              fill="url(#lobsterClaw)"
              className="claw-snap-delayed"
            />
          </g>
        </g>
        
        {/* 大钳子 - 右 */}
        <g className="lobster-claw-right">
          {/* 钳臂 */}
          <path 
            d="M70 40 Q65 30, 55 25 Q50 22, 45 15" 
            stroke="url(#lobsterClaw)" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
          />
          {/* 钳子 */}
          <g transform="translate(45, 15) rotate(30)">
            <path 
              d="M0 0 Q-8 -5, -15 0 Q-8 5, 0 0" 
              fill="url(#lobsterClaw)"
              className="claw-snap"
            />
            <path 
              d="M0 0 Q-8 8, -12 15 Q-5 10, 0 0" 
              fill="url(#lobsterClaw)"
              className="claw-snap-delayed"
            />
          </g>
        </g>
        
        {/* 步足 */}
        <g className="lobster-legs">
          <path d="M60 55 Q55 62, 48 68" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-walk" />
          <path d="M65 57 Q62 65, 58 72" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-walk-delayed" />
          <path d="M60 45 Q55 38, 48 32" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-walk" />
          <path d="M65 43 Q62 35, 58 28" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-walk-delayed" />
        </g>
      </svg>
    </div>
  );
});

export default AnimatedLobster;
