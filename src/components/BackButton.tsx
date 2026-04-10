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

  // 组件加载时保存返回状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const backFrom = sessionStorage.getItem('backFrom');
      if (backFrom) {
        try {
          // 尝试解析为 JSON 格式
          const state = JSON.parse(backFrom);
          if (state && state.path) {
            setSavedBackState(state);
          } else {
            // 旧格式：纯路径字符串
            setSavedBackState({ path: backFrom });
          }
        } catch {
          // 无法解析为 JSON，当作路径字符串处理
          setSavedBackState({ path: backFrom });
        }
      }
    }
  }, []);

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      const backState = savedBackState;
      if (backState) {
        sessionStorage.removeItem('backFrom');
        
        // 构建返回 URL，附加分页参数
        let url = backState.path;
        
        // 如果有分页参数，添加到 URL
        const params = new URLSearchParams();
        if (backState.page && backState.page > 1) {
          params.set('page', backState.page.toString());
        }
        if (backState.category && backState.category !== 'all') {
          params.set('category', backState.category);
        }
        if (backState.search) {
          params.set('search', backState.search);
        }
        
        const queryString = params.toString();
        if (queryString) {
          url = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
        }
        
        router.push(url);
        return;
      }
      
      // 如果没有保存的状态，尝试浏览器返回
      if (window.history.length > 1) {
        router.back();
      } else {
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
