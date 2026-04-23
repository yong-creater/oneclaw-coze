'use client';

import Link from 'next/link';
import { FileText, ArrowRight, Info } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/utilities" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              工具
            </Link>
            <Link href="/about" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              关于
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="max-w-2xl">
          <h1 className="text-5xl font-semibold tracking-tight mb-6">
            Simple tools.<br />Better work.
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] mb-12">
            实用工具，让AI真正提升你的效率
          </p>
        </div>

        {/* Tool Card */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Link href="/resume">
            <div className="group border border-[var(--border)] rounded-lg p-6 hover:border-[var(--foreground)] transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-md flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">职业</span>
              </div>
              <h3 className="font-medium mb-2 group-hover:underline">简历优化</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                AI智能优化简历，提升面试机会
              </p>
              <div className="flex items-center gap-1 mt-4 text-sm text-[var(--muted-foreground)]">
                <span>开始使用</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Coming Soon */}
        <div className="mt-20 pt-12 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            更多工具开发中
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
            <span>© 2024 OneClaw</span>
            <Link href="/about" className="flex items-center gap-1 hover:text-[var(--foreground)]">
              <Info className="w-4 h-4" />
              关于
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
