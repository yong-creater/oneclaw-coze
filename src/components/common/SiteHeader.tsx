'use client';

import { useRouter } from 'next/navigation';
import { SiteLogo } from '@/components/common/SiteLogo';
import LoginButton from '@/components/common/LoginButton';
import { ChevronRight } from 'lucide-react';

export default function SiteHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <SiteLogo size={32} showText />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.push('/product-generator')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 rounded-full transition-colors"
          >
            <span>生成器</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
