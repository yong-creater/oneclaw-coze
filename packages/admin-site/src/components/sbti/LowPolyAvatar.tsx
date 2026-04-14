'use client';

import { useMemo } from 'react';

// 16种人格的Low Poly配置
const PERSONALITY_CONFIGS = {
  caover: { // 草者 - 头顶青草
    bodyColor: '#22C55E',
    accentColor: '#86EFAC',
    element: '🌿',
    shapes: [
      { type: 'grass', count: 5 }
    ]
  },
  sunshine: { // 阳光 - 太阳光环
    bodyColor: '#F59E0B',
    accentColor: '#FCD34D',
    element: '☀️',
    shapes: [
      { type: 'halo', count: 1 }
    ]
  },
  cool: { // 高冷 - 墨镜
    bodyColor: '#6366F1',
    accentColor: '#A5B4FC',
    element: '🕶️',
    shapes: [
      { type: 'sunglasses', count: 1 }
    ]
  },
  rich: { // 财神 - 金元宝
    bodyColor: '#EAB308',
    accentColor: '#FDE047',
    element: '💰',
    shapes: [
      { type: 'gold', count: 2 }
    ]
  },
  foodie: { // 干饭 - 饭碗
    bodyColor: '#EF4444',
    accentColor: '#FCA5A5',
    element: '🍚',
    shapes: [
      { type: 'bowl', count: 1 }
    ]
  },
  sleepy: { // 睡神 - ZZZ
    bodyColor: '#8B5CF6',
    accentColor: '#C4B5FD',
    element: '💤',
    shapes: [
      { type: 'zzz', count: 3 }
    ]
  },
  gaming: { // 上分 - 游戏手柄
    bodyColor: '#EC4899',
    accentColor: '#F9A8D4',
    element: '🎮',
    shapes: [
      { type: 'controller', count: 1 }
    ]
  },
  emo: { // emo - 雨滴
    bodyColor: '#64748B',
    accentColor: '#94A3B8',
    element: '🌧️',
    shapes: [
      { type: 'tear', count: 4 }
    ]
  },
  social: { // 社牛 - 麦克风
    bodyColor: '#14B8A6',
    accentColor: '#5EEAD4',
    element: '🎤',
    shapes: [
      { type: 'mic', count: 1 }
    ]
  },
  anti: { // 反骨 - 反骨手势
    bodyColor: '#A855F7',
    accentColor: '#D8B4FE',
    element: '👎',
    shapes: [
      { type: 'thumb', count: 1 }
    ]
  },
  study: { // 卷王 - 书本
    bodyColor: '#0EA5E9',
    accentColor: '#7DD3FC',
    element: '📚',
    shapes: [
      { type: 'book', count: 2 }
    ]
  },
  fresh: { // fresh - 闪光
    bodyColor: '#10B981',
    accentColor: '#6EE7B7',
    element: '✨',
    shapes: [
      { type: 'sparkle', count: 6 }
    ]
  },
  boring: { // 无聊 - 问号
    bodyColor: '#78716C',
    accentColor: '#A8A29E',
    element: '❓',
    shapes: [
      { type: 'question', count: 2 }
    ]
  },
  drama: { // 戏精 - 面具
    bodyColor: '#F97316',
    accentColor: '#FDBA74',
    element: '🎭',
    shapes: [
      { type: 'mask', count: 1 }
    ]
  },
  toxic: { // 摆烂 - 葛优躺
    bodyColor: '#71717A',
    accentColor: '#A1A1AA',
    element: '🛋️',
    shapes: [
      { type: 'lie', count: 1 }
    ]
  },
  lonely: { // 独行 - 月亮
    bodyColor: '#475569',
    accentColor: '#94A3B8',
    element: '🌙',
    shapes: [
      { type: 'moon', count: 1 }
    ]
  },
};

interface LowPolyAvatarProps {
  type: string;
  size?: number;
}

export default function LowPolyAvatar({ type, size = 120 }: LowPolyAvatarProps) {
  const config = PERSONALITY_CONFIGS[type as keyof typeof PERSONALITY_CONFIGS] || PERSONALITY_CONFIGS.boring;
  
  // 生成Low Poly风格的几何形状
  const shapes = useMemo(() => {
    const result = [];
    
    // 头部 - 低多边形风格
    result.push(
      <polygon
        key="head-1"
        points={`${size * 0.3},${size * 0.35} ${size * 0.5},${size * 0.2} ${size * 0.7},${size * 0.35}`}
        fill={config.accentColor}
        opacity={0.9}
      />,
      <polygon
        key="head-2"
        points={`${size * 0.25},${size * 0.4} ${size * 0.3},${size * 0.35} ${size * 0.35},${size * 0.5}`}
        fill={config.bodyColor}
        opacity={0.85}
      />,
      <polygon
        key="head-3"
        points={`${size * 0.35},${size * 0.5} ${size * 0.5},${size * 0.35} ${size * 0.65},${size * 0.5}`}
        fill={config.bodyColor}
        opacity={0.9}
      />
    );
    
    // 身体
    result.push(
      <polygon
        key="body-1"
        points={`${size * 0.3},${size * 0.55} ${size * 0.5},${size * 0.5} ${size * 0.4},${size * 0.8}`}
        fill={config.bodyColor}
        opacity={0.8}
      />,
      <polygon
        key="body-2"
        points={`${size * 0.5},${size * 0.5} ${size * 0.7},${size * 0.55} ${size * 0.6},${size * 0.8}`}
        fill={config.accentColor}
        opacity={0.85}
      />,
      <polygon
        key="body-3"
        points={`${size * 0.4},${size * 0.8} ${size * 0.6},${size * 0.8} ${size * 0.5},${size * 0.65}`}
        fill={config.bodyColor}
        opacity={0.9}
      />
    );
    
    // 根据人格类型添加特殊元素
    if (type === 'caover') {
      // 草者 - 头顶青草
      result.push(
        <polygon key="grass-1" points={`${size * 0.35},${size * 0.15} ${size * 0.4},${size * 0.05} ${size * 0.42},${size * 0.18}`} fill="#22C55E" />,
        <polygon key="grass-2" points={`${size * 0.45},${size * 0.12} ${size * 0.5},${size * 0.02} ${size * 0.52},${size * 0.15}`} fill="#86EFAC" />,
        <polygon key="grass-3" points={`${size * 0.55},${size * 0.15} ${size * 0.6},${size * 0.05} ${size * 0.62},${size * 0.18}`} fill="#22C55E" />
      );
    } else if (type === 'sunshine') {
      // 阳光 - 光环
      result.push(
        <circle key="halo" cx={size * 0.5} cy={size * 0.15} r={size * 0.12} fill="#FCD34D" opacity={0.6} />,
        <circle key="sun-core" cx={size * 0.5} cy={size * 0.15} r={size * 0.06} fill="#F59E0B" />
      );
    } else if (type === 'sleepy') {
      // 睡神 - ZZZ
      result.push(
        <text key="zzz-1" x={size * 0.7} y={size * 0.25} fill="#C4B5FD" fontSize={size * 0.08} fontWeight="bold">Z</text>,
        <text key="zzz-2" x={size * 0.78} y={size * 0.18} fill="#A78BFA" fontSize={size * 0.1} fontWeight="bold">Z</text>,
        <text key="zzz-3" x={size * 0.88} y={size * 0.1} fill="#8B5CF6" fontSize={size * 0.12} fontWeight="bold">Z</text>
      );
    } else if (type === 'emo') {
      // emo - 雨滴
      for (let i = 0; i < 4; i++) {
        result.push(
          <ellipse key={`tear-${i}`} cx={size * (0.2 + i * 0.15)} cy={size * (0.35 + (i % 2) * 0.1)} rx={size * 0.02} ry={size * 0.04} fill="#94A3B8" opacity={0.7} />
        );
      }
    } else if (type === 'fresh') {
      // fresh - 闪光
      const sparklePositions = [
        [0.15, 0.2], [0.85, 0.25], [0.1, 0.6], [0.9, 0.65], [0.2, 0.85], [0.8, 0.8]
      ];
      sparklePositions.forEach((pos, i) => (
        <text key={`sparkle-${i}`} x={size * pos[0]} y={size * pos[1]} fill="#FCD34D" fontSize={size * 0.06}>✦</text>
      ));
    }
    
    return result;
  }, [type, size, config]);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-lg"
    >
      {/* 背景圆形 */}
      <defs>
        <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.accentColor} />
          <stop offset="100%" stopColor={config.bodyColor} />
        </linearGradient>
      </defs>
      
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size * 0.48}
        fill={`url(#grad-${type})`}
        opacity={0.15}
      />
      
      {/* 几何形状 */}
      {shapes}
      
      {/* 眼睛 */}
      <circle cx={size * 0.38} cy={size * 0.38} r={size * 0.04} fill="#1F2937" />
      <circle cx={size * 0.62} cy={size * 0.38} r={size * 0.04} fill="#1F2937" />
      <circle cx={size * 0.39} cy={size * 0.37} r={size * 0.015} fill="white" />
      <circle cx={size * 0.63} cy={size * 0.37} r={size * 0.015} fill="white" />
      
      {/* 嘴巴 */}
      {type === 'cool' ? (
        // 高冷 - 直线嘴
        <line x1={size * 0.4} y1={size * 0.52} x2={size * 0.6} y2={size * 0.52} stroke="#1F2937" strokeWidth={size * 0.02} strokeLinecap="round" />
      ) : type === 'sunshine' || type === 'social' ? (
        // 阳光/社牛 - 笑脸
        <path d={`M ${size * 0.38} ${size * 0.5} Q ${size * 0.5} ${size * 0.6} ${size * 0.62} ${size * 0.5}`} fill="none" stroke="#1F2937" strokeWidth={size * 0.02} strokeLinecap="round" />
      ) : type === 'emo' || type === 'lonely' ? (
        // emo/独行 - 倒嘴
        <path d={`M ${size * 0.38} ${size * 0.55} Q ${size * 0.5} ${size * 0.48} ${size * 0.62} ${size * 0.55}`} fill="none" stroke="#1F2937" strokeWidth={size * 0.02} strokeLinecap="round" />
      ) : type === 'sleepy' || type === 'toxic' ? (
        // 睡神/摆烂 - 无嘴
        null
      ) : (
        // 默认 - 微笑
        <path d={`M ${size * 0.38} ${size * 0.5} Q ${size * 0.5} ${size * 0.58} ${size * 0.62} ${size * 0.5}`} fill="none" stroke="#1F2937" strokeWidth={size * 0.02} strokeLinecap="round" />
      )}
      
      {/* 特殊装饰 */}
      {config.element && (
        <text
          x={size * 0.5}
          y={size * 0.92}
          textAnchor="middle"
          fontSize={size * 0.12}
        >
          {config.element}
        </text>
      )}
    </svg>
  );
}
