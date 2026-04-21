'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToHomeProps {
  label?: string;
  className?: string;
}

export default function BackToHome({ label = 'AI 工具导航', className = '' }: BackToHomeProps) {
  return (
    <div className={className}>
      <Link href="/">
        <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-orange-500">
          <Home className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </Link>
      <span className="text-slate-300 dark:text-slate-600 mx-2">/</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
