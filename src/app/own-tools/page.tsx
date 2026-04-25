'use client';

import Link from 'next/link';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { cn } from '@/lib/utils';
import {
  FileText, BookOpen, Image as ImageIcon, Globe, Star,
  ArrowRight, Sparkles, Zap
} from 'lucide-react';

const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能优化简历，提升求职竞争力',
    icon: FileText,
    badge: '热门',
    gradient: 'from-orange-400 via-orange-500 to-amber-500',
    iconBg: 'bg-white/20 backdrop-blur',
    tag: '效率提升'
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: 'AI辅助小说创作，激发无限灵感',
    icon: BookOpen,
    badge: '新功能',
    gradient: 'from-purple-400 via-violet-500 to-indigo-500',
    iconBg: 'bg-white/20 backdrop-blur',
    tag: '创意写作'
  },
  {
    id: 'overseas',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页，高转化可适配多平台',
    icon: Globe,
    badge: null,
    gradient: 'from-blue-400 via-cyan-500 to-teal-500',
    iconBg: 'bg-white/20 backdrop-blur',
    tag: '电商必备'
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '上传照片智能抠图，一键生成合规证件照',
    icon: ImageIcon,
    badge: '新功能',
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
    iconBg: 'bg-white/20 backdrop-blur',
    tag: '便捷生活'
  },
];

export default function OwnToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 标题区域 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  自建工具
                </h1>
                <p className="text-sm text-muted-foreground">
                  精心打造，助您效率倍增
                </p>
              </div>
            </div>
          </div>

          {/* 工具卡片 - 大卡片风格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {OWN_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const href = tool.id === 'overseas' ? '/productpage' : `/${tool.id}`;

              return (
                <Link key={tool.id} href={href}>
                  <div className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-transparent hover:shadow-2xl transition-all duration-500 cursor-pointer h-[280px]">
                    {/* 渐变背景 */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br",
                      tool.gradient
                    )} />

                    {/* 装饰元素 */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    {/* 内容 */}
                    <div className="relative h-full p-8 flex flex-col justify-between">
                      {/* 顶部 */}
                      <div className="flex items-start justify-between">
                        {/* 大图标 */}
                        <div className={cn(
                          "w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl",
                          tool.iconBg
                        )}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>

                        {/* Badge */}
                        {tool.badge && (
                          <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-800 rounded-full shadow-lg">
                            {tool.badge}
                          </div>
                        )}
                      </div>

                      {/* 底部 */}
                      <div className="space-y-3">
                        {/* 标签 */}
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-xs font-medium text-white rounded-full">
                            {tool.tag}
                          </span>
                        </div>

                        {/* 标题和描述 */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform">
                            {tool.name}
                          </h3>
                          <p className="text-white/80 text-sm leading-relaxed">
                            {tool.desc}
                          </p>
                        </div>

                        {/* 使用按钮 */}
                        <div className="flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                          <span>立即体验</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 更多工具提示 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-full">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">更多精品工具开发中...</span>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
