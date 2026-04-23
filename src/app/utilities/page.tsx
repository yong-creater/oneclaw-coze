import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, ArrowRight, Zap } from 'lucide-react';
import BackToHome from '@/components/common/BackToHome';

export const metadata: Metadata = {
  title: '实用工具 - OneClaw',
  description: '精选实用AI工具，提升工作和生活效率',
};

export default function UtilitiesPage() {
  const utilities = [
    {
      id: 'resume',
      name: '简历优化',
      description: 'AI智能优化简历，STAR法则撰写，JD精准匹配，提升面试机会',
      icon: FileText,
      path: '/resume',
      category: '职业发展',
      badge: '热门',
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <BackToHome />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              实用工具
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            精选实用AI工具，提升工作和生活效率
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {utilities.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.id} href={tool.path}>
                <Card className="hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${tool.gradient}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{tool.name}</h3>
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

        {/* 更多工具提示 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-500">
            <Zap className="w-4 h-4" />
            更多工具开发中...
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>OneClaw - 让AI工具更实用</p>
        </div>
      </footer>
    </div>
  );
}
