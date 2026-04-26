'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { cn } from '@/lib/utils';
import {
  Sparkles, ArrowRight,
  FileText, BookOpen, Image, Wand2, Zap
} from 'lucide-react';

// 自建工具配置
const TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能分析并优化简历，提升面试机会',
    href: '/resume',
    icon: FileText,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: '洗稿润色、人物DNA、绘画提示词、场景描写',
    href: '/novel',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'productpage',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页，符合亚马逊规范',
    href: '/productpage',
    icon: Wand2,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '智能抠图，一键生成合规证件照',
    href: '/photo-id',
    icon: Image,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export default function OwnToolsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        <div className="px-6 py-8">
          {/* 页面标题 */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              自建工具
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              一站式AI创作工具集，轻松提升工作效率
            </p>
          </div>

          {/* 工具网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-800/50 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* 装饰光晕 */}
                  <div className={cn(
                    "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40",
                    "bg-gradient-to-br", tool.color
                  )} />
                  
                  <div className="relative flex items-start gap-4">
                    {/* 图标 */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                      "bg-gradient-to-br", tool.color,
                      "shadow-lg"
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-200">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* 底部箭头 */}
                  <div className="mt-4 flex items-center justify-end">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br", tool.color,
                      "opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0"
                    )}>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* 更多工具提示 */}
          <div className="mt-12 text-center animate-fade-in-up stagger-4">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                更多工具持续开发中，敬请期待
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
