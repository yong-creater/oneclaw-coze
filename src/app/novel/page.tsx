'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NovelRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 跳转到首页并激活小说创作 Tab
    router.replace('/?tab=novel');
  }, [router]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600">正在跳转...</p>
      </div>
    </div>
  );
}
