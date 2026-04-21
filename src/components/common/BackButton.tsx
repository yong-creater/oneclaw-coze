'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  defaultText?: string;
  defaultHref?: string;
  className?: string;
}

export default function BackButton({ defaultText = '返回', defaultHref = '/', className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      const backFrom = sessionStorage.getItem('backFrom');
      
      if (backFrom) {
        let returnUrl = backFrom;
        let isHomePage = false;
        let tab: string | undefined;
        
        // 尝试解析 JSON
        try {
          const state = JSON.parse(backFrom);
          if (state && state.path) {
            returnUrl = state.path;
            isHomePage = state.path === '/';
            tab = state.tab;
            
            // 如果是其他页面，追加分页和筛选参数
            if (!isHomePage) {
              const searchParams = new URLSearchParams();
              const urlObj = new URL(state.path, 'http://localhost');
              
              // 只添加不在原 URL 中的参数
              if (state.page && state.page > 1 && !urlObj.searchParams.has('page')) {
                searchParams.set('page', String(state.page));
              }
              if (state.category && state.category !== 'all' && !urlObj.searchParams.has('category')) {
                searchParams.set('category', state.category);
              }
              if (state.search && !urlObj.searchParams.has('search')) {
                searchParams.set('search', state.search);
              }
              
              const query = searchParams.toString();
              if (query) {
                returnUrl = returnUrl + (returnUrl.includes('?') ? '&' : '?') + query;
              }
            }
          }
        } catch {
          // 解析失败，使用原始值
        }
        
        // 清除 sessionStorage（返回首页时保留，让首页读取 tab）
        if (!isHomePage) {
          sessionStorage.removeItem('backFrom');
        }
        
        // 如果是首页，且有 tab 信息，需要把 tab 保存回去
        // 因为首页加载时会读取 sessionStorage 并清除
        if (isHomePage && tab) {
          sessionStorage.setItem('homeTab', tab);
        }
        
        // 确保返回有效路径
        if (returnUrl && returnUrl.startsWith('/')) {
          router.push(returnUrl);
          return;
        }
      }
    }
    
    // 默认返回首页
    router.push(defaultHref);
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
