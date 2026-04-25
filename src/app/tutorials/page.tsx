'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorialsPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到首页并切换到教程 Tab
    router.push('/?tab=tutorials');
  }, [router]);

  return null;
}
