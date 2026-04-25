'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * 统一加载状态组件
 * 
 * 使用规范：
 * - 使用 Loader2 图标 + animate-spin
 * - 颜色默认使用 orange-500
 * - 可自定义大小
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2 
      className={`animate-spin text-orange-500 ${sizeClasses[size]} ${className}`} 
    />
  );
}

/**
 * 加载状态容器
 * 
 * 使用规范：
 * - 用于页面加载中显示
 * - 垂直居中
 */
interface LoadingContainerProps {
  text?: string;
  className?: string;
}

export function LoadingContainer({ 
  text = '加载中...', 
  className = '' 
}: LoadingContainerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
      <LoadingSpinner size="lg" />
      {text && (
        <p className="text-sm text-slate-500 mt-4">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
