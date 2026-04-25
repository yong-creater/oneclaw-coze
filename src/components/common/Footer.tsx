'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-slate-200/60 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-semibold text-slate-900">
              One<span className="text-orange-500">Claw</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="mailto:1017760688@qq.com" className="hover:text-orange-500 transition-colors">
              1017760688@qq.com
            </a>
            <span className="text-slate-300">|</span>
            <span>渝ICP备2026004291号-2</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-400">
            © {currentYear} OneClaw. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
