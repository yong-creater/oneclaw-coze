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
        // 尝试解析 JSON 获取路径
        let path = backFrom;
        try {
          const state = JSON.parse(backFrom);
          path = state.path || backFrom;
        } catch {
          // 保持原值
        }
        
        // 确保 path 是有效的
        if (path && typeof path === 'string' && path.startsWith('/')) {
          // 如果目标是首页，保留 sessionStorage 让首页读取 tab
          // 否则直接清除
          if (path !== '/') {
            sessionStorage.removeItem('backFrom');
          }
          
          router.push(path);
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
