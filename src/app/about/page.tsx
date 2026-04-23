import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Mail, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - OneClaw',
  description: '关于 OneClaw - 精选AI工具导航',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-8">关于 OneClaw</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">关于我们</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              OneClaw 是一个精选 AI 工具导航平台，致力于帮助用户发现和选择最适合的 AI 工具。我们精选主流 AI 工具，提供客观的介绍和使用信息，让用户能够快速找到满足需求的解决方案。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">我们的服务</h2>
            <div className="grid gap-4">
              <div className="border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-medium mb-2">精选工具</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  收录主流 AI 工具，包括图像生成、视频制作、写作助手、办公工具等分类，方便快速查找。
                </p>
              </div>
              <div className="border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-medium mb-2">简历优化</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  使用 AI 技术优化简历内容，提升面试机会。支持 STAR 法则重写、关键词匹配等。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">联系我们</h2>
            <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
              <Mail className="w-5 h-5" />
              <a href="mailto:1017760688@qq.com" className="hover:text-[var(--foreground)]">
                1017760688@qq.com
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">法律信息</h2>
            <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <p>
                <a 
                  href="https://beian.miit.gov.cn/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
                >
                  京ICP备XXXXXXXX号-1
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p>© 2024 OneClaw. All rights reserved.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2024 OneClaw
          </div>
        </div>
      </footer>
    </div>
  );
}
