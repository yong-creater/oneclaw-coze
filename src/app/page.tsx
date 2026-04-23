'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, ArrowRight, Zap, Info } from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

const utilities = [
  {
    id: 'resume',
    name: '简历优化',
    description: 'AI智能优化简历，STAR法则撰写，JD精准匹配',
    icon: FileText,
    path: '/resume',
    gradient: 'from-orange-500 to-amber-500',
    badge: '热门',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AnimatedLobster size={36} />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              OneClaw
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/utilities">
              <Button variant="ghost" size="sm">
                <Sparkles className="w-4 h-4 mr-1" />
                实用工具
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                <Info className="w-4 h-4 mr-1" />
                关于
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              实用AI工具
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            精选实用工具，让AI真正提升你的效率
          </p>
        </div>
      </section>

      {/* Utilities Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {utilities.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.id} href={tool.path}>
                  <Card className="hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${tool.gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-xl">{tool.name}</h3>
                            {tool.badge && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs">
                                {tool.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                            {tool.description}
                          </p>
                          <div className="flex items-center text-orange-500 text-sm font-medium">
                            立即使用 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* More Coming Soon */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-500">
              <Zap className="w-4 h-4" />
              更多工具开发中...
            </div>
          </div>
        </div>
      </section>

      {/* About Link */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/about">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-slate-50 dark:bg-slate-800/50 border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  了解更多关于 OneClaw
                </p>
                <p className="text-sm text-slate-400 mt-1">oneclaw.shop</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-500">
          <p>OneClaw - 让AI工具更实用</p>
          <p className="mt-2">© 2024 OneClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
