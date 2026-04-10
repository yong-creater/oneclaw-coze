'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  defaultText?: string;
  defaultHref?: string;
  className?: string;
}

interface BackState {
  page?: number;
  category?: string;
  search?: string;
  path: string;
}

export default function BackButton({ defaultText = '返回', defaultHref, className = '' }: BackButtonProps) {
  const router = useRouter();
  const [savedBackState, setSavedBackState] = useState<BackState | null>(null);

  // 组件加载时读取返回状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const backFrom = sessionStorage.getItem('backFrom');
      if (backFrom) {
        try {
          const state = JSON.parse(backFrom);
          if (state && state.path) {
            setSavedBackState(state);
          } else {
            setSavedBackState({ path: backFrom });
          }
        } catch {
          setSavedBackState({ path: backFrom });
        }
      }
    }
  }, []);

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      // 始终优先使用 sessionStorage 中保存的返回状态
      let backState = savedBackState;
      
      // 如果状态为空，尝试直接读取 sessionStorage
      if (!backState) {
        const backFrom = sessionStorage.getItem('backFrom');
        if (backFrom) {
          try {
            const state = JSON.parse(backFrom);
            backState = state && state.path ? state : { path: backFrom };
          } catch {
            backState = { path: backFrom };
          }
        }
      }
      
      if (backState && backState.path) {
        sessionStorage.removeItem('backFrom');
        
        // 构建返回 URL
        let url = backState.path;
        
        // 解析已有的查询参数
        const urlObj = new URL(url, 'http://localhost');
        const existingParams = urlObj.searchParams;
        
        // 只有当 path 中没有这些参数时，才从 state 中添加
        // 这样可以避免重复添加参数
        if (backState.page && backState.page > 1 && !existingParams.has('page')) {
          urlObj.searchParams.set('page', backState.page.toString());
        }
        if (backState.category && backState.category !== 'all' && !existingParams.has('category')) {
          urlObj.searchParams.set('category', backState.category);
        }
        if (backState.search && !existingParams.has('search')) {
          urlObj.searchParams.set('search', backState.search);
        }
        
        router.push(urlObj.pathname + urlObj.search);
        return;
      }
      
      // 如果没有保存的状态，返回首页
      router.push(defaultHref || '/');
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
