'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ToolLogoProps {
  src?: string | null;
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}

// 预计算颜色映射，确保相同字母得到相同颜色
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

function getColorForName(name: string): string {
  const letter = name.charAt(0).toUpperCase();
  const colorIndex = letter.charCodeAt(0) % COLORS.length;
  return COLORS[colorIndex];
}

export function ToolLogo({ src, name, url, size = 40, className = '' }: ToolLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const fallbackSrc = url 
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=64`
    : null;
  
  const displaySrc = !imageError && src ? src : fallbackSrc;
  const bgColor = getColorForName(name);
  const letter = name.charAt(0).toUpperCase();

  // 确定正确的 image src
  const imageSrc = displaySrc || '';

  // 判断是否是外部图片
  const isExternalImage = imageSrc.startsWith('http');

  return (
    <div 
      className={`relative rounded-lg overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 图片层 */}
      {isExternalImage ? (
        <Image
          src={imageSrc}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain bg-slate-100 dark:bg-slate-700"
          loading="lazy"
          sizes={`${size}px`}
          unoptimized={imageSrc.includes('google.com')} // Google favicon 不需要优化
          onError={() => setImageError(true)}
        />
      ) : imageSrc ? (
        <Image
          src={imageSrc}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain bg-slate-100 dark:bg-slate-700"
          loading="lazy"
          sizes={`${size}px`}
        />
      ) : null}
      
      {/* 备用字母图标（图片加载失败或无图片时显示） */}
      {(!isExternalImage || !imageSrc || imageError) && (
        <div 
          className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm sm:text-base"
          style={{ backgroundColor: bgColor }}
        >
          {letter}
        </div>
      )}
    </div>
  );
}

export default ToolLogo;
