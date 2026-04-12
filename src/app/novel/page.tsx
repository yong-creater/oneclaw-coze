'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NovelPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 重定向到首页并切换到novel tab
    router.replace('/?tab=novel');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-slate-500">加载中...</div>
    </div>
  );
}
