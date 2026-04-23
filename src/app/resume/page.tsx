import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: '简历优化 - OneClaw',
  description: 'AI智能优化简历',
};

export default function ResumePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">简历优化</h1>
          <p className="text-[var(--muted-foreground)]">
            使用AI优化你的简历，提升面试机会
          </p>
        </div>

        {/* Placeholder for the tool */}
        <div className="border border-[var(--border)] rounded-lg p-8 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">
            简历优化功能正在开发中
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            即将上线，敬请期待
          </p>
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
