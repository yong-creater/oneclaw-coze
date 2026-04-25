'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PromptsPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到首页并切换到提示词 Tab
    router.push('/?tab=prompts');
  }, [router]);

  return null;
}
