'use client';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { FileText, Construction } from 'lucide-react';

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400/20 to-amber-400/20 mb-6">
              <FileText className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              简历优化
            </h1>
            <p className="text-muted-foreground mb-8">
              AI智能优化简历，提升求职竞争力
            </p>

            <div className="bg-card rounded-2xl p-12 border border-border">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <Construction className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  功能开发中
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                  简历优化工具正在紧张开发中，敬请期待...
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
