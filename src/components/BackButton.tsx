'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  defaultText?: string;
  defaultHref?: string;
  className?: string;
}

export default function BackButton({ defaultText = '返回', defaultHref, className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    // 优先使用浏览器原生返回，如果有历史记录的话
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // 如果没有历史记录或需要跳转到特定页面
      const backFrom = sessionStorage.getItem('backFrom');
      if (backFrom) {
        sessionStorage.removeItem('backFrom');
        router.push(backFrom);
      } else {
        router.push(defaultHref || '/');
      }
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
