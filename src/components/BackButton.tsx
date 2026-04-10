'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  defaultText?: string;
  defaultHref?: string;
  className?: string;
}

export default function BackButton({ defaultText = '返回', defaultHref, className = '' }: BackButtonProps) {
  const router = useRouter();
  const [savedPath, setSavedPath] = useState<string | null>(null);

  // 组件加载时读取返回路径
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const backFrom = sessionStorage.getItem('backFrom');
      if (backFrom) {
        try {
          // 尝试解析 JSON
          const state = JSON.parse(backFrom);
          if (state && state.path) {
            setSavedPath(state.path);
          } else if (typeof backFrom === 'string' && backFrom.startsWith('/')) {
            setSavedPath(backFrom);
          }
        } catch {
          // 如果解析失败，直接使用字符串
          if (backFrom.startsWith('/')) {
            setSavedPath(backFrom);
          }
        }
      }
    }
  }, []);

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      // 优先使用已保存的路径
      let path = savedPath;
      
      // 如果没有保存的路径，尝试直接从 sessionStorage 读取
      if (!path) {
        const backFrom = sessionStorage.getItem('backFrom');
        if (backFrom) {
          try {
            const state = JSON.parse(backFrom);
            path = state && state.path ? state.path : backFrom;
          } catch {
            path = backFrom;
          }
        }
      }
      
      // 清除 sessionStorage
      sessionStorage.removeItem('backFrom');
      
      // 如果有有效的路径，跳转到该路径
      if (path && path.startsWith('/')) {
        router.push(path);
      } else {
        // 否则返回首页
        router.push(defaultHref || '/');
      }
    } else {
      router.push(defaultHref || '/');
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className={`flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors ${className}`}
    >
      <span>←</span>
      <span>{defaultText}</span>
    </button>
  );
}
