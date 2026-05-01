'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/common/SiteLogo';

interface BackToHomeProps {
  label?: string;
  className?: string;
  showLogo?: boolean;
}

export default function BackToHome({ label = 'AI 工具详情', className = '', showLogo = false }: BackToHomeProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {showLogo ? (
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <SiteLogo size={28} showText />
        </Link>
      ) : (
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-orange-500">
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>
      )}
      <span className="text-slate-300 dark:text-slate-600 mx-2">/</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
