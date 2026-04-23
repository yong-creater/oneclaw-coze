import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - OneClaw',
  description: 'Simple tools for better work',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </Link>
          <span className="text-xl font-semibold tracking-tight">OneClaw</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight mb-6">About</h1>
          <p className="text-xl text-[var(--muted-foreground)] mb-8">
            Simple tools for better work. We build practical tools that help you get things done.
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-8 mt-12">
          <div>
            <h2 className="text-lg font-medium mb-3">我们的理念</h2>
            <p className="text-[var(--muted-foreground)]">
              我们相信，好的工具应该简单、高效、实用。不需要花哨的功能，不需要复杂的学习曲线 — 只需打开工具，完成任务。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-3">产品</h2>
            <p className="text-[var(--muted-foreground)]">
              目前我们提供简历优化工具，帮助你用AI优化简历，提升面试机会。未来会推出更多实用工具。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-3">联系我们</h2>
            <p className="text-[var(--muted-foreground)]">
              如有任何问题或建议，欢迎联系我们：
            </p>
            <a 
              href="mailto:1017760688@qq.com" 
              className="inline-flex items-center gap-2 mt-3 text-[var(--foreground)] hover:underline"
            >
              <Mail className="w-4 h-4" />
              1017760688@qq.com
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2024 OneClaw
          </div>
        </div>
      </footer>
    </div>
  );
}
