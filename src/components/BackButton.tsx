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
        // 尝试解析 JSON 获取完整状态
        let path = backFrom;
        let page: number | undefined;
        let category: string | undefined;
        let search: string | undefined;
        let tab: string | undefined;
        
        try {
          const state = JSON.parse(backFrom);
          if (state) {
            path = state.path || backFrom;
            page = state.page;
            category = state.category;
            search = state.search;
            tab = state.tab;
          }
        } catch {
          // 保持原值
        }
        
        // 确保 path 是有效的
        if (path && typeof path === 'string' && path.startsWith('/')) {
          // 构建返回 URL，附加分页和筛选参数
          const params = new URLSearchParams();
          if (page && page > 1) params.set('page', page.toString());
          if (category && category !== 'all') params.set('category', category);
          if (search) params.set('search', search);
          
          const queryString = params.toString();
          const returnUrl = queryString ? `${path}?${queryString}` : path;
          
          // 如果目标是首页，保留 sessionStorage 让首页读取 tab
          if (path !== '/') {
            sessionStorage.removeItem('backFrom');
          }
          
          router.push(returnUrl);
          return;
        }
      }
    }
    
    // 如果没有保存的路径，返回首页
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
