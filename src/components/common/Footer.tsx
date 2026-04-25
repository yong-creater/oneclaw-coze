'use client';

import Link from 'next/link';
import AnimatedLobster from './AnimatedLobster';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 ${className}`}>
      {/* 顶部装饰渐变 */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <AnimatedLobster size={18} />
            </div>
            <span className="font-bold text-white">OneClaw</span>
          </Link>

          {/* 联系与备案 */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <a href="mailto:1017760688@qq.com" className="text-slate-400 hover:text-orange-400 transition-colors">
              1017760688@qq.com
            </a>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="text-slate-500">渝ICP备2026004291号-2</span>
          </div>

          {/* 版权 */}
          <span className="text-sm text-slate-500">
            © {new Date().getFullYear()} OneClaw
          </span>
        </div>
      </div>

      {/* 底部装饰渐变 */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
    </footer>
  );
}
