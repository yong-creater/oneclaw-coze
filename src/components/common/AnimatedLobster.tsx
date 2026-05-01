'use client';

import { memo } from 'react';
import { Zap } from 'lucide-react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

export const AnimatedLobster = memo(function AnimatedLobster({ 
  size = 48, 
  className = '' 
}: AnimatedLobsterProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm"
        style={{ width: size, height: size }}
      >
        <Zap 
          className="text-white" 
          style={{ width: size * 0.55, height: size * 0.55 }}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
});

export default AnimatedLobster;
