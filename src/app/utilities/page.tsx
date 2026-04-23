import Link from 'next/link';
import { FileText, ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata = {
  title: '工具 - OneClaw',
  description: '精选实用AI工具',
};

export default function UtilitiesPage() {
  const tools = [
    {
      id: 'resume',
      name: '简历优化',
      description: 'AI智能优化简历，STAR法则撰写，JD精准匹配',
      icon: FileText,
      path: '/resume',
      category: '职业',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </Link>
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-3">实用工具</h1>
          <p className="text-[var(--muted-foreground)]">
            精选实用工具，提升工作效率
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.id} href={tool.path}>
                <div className="group border border-[var(--border)] rounded-lg p-6 hover:border-[var(--foreground)] transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--secondary)] rounded-md flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-[var(--muted-foreground)]">{tool.category}</span>
                  </div>
                  <h3 className="font-medium mb-2 group-hover:underline">{tool.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                    <span>开始使用</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
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
