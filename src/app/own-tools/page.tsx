'use client';

import Link from 'next/link';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { cn } from '@/lib/utils';
import {
  FileText, BookOpen, Image as ImageIcon, Globe, Star,
  ArrowRight, Sparkles, Wand2
} from 'lucide-react';

const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能优化简历，提升求职竞争力',
    icon: FileText,
    badge: '热门',
    gradient: 'from-orange-500 via-orange-400 to-amber-400',
    hoverGradient: 'hover:from-orange-600 hover:via-orange-500 hover:to-amber-500',
    shadowColor: 'shadow-orange-500/20',
    shadowHover: 'hover:shadow-orange-500/30',
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: 'AI辅助小说创作，激发无限灵感',
    icon: BookOpen,
    badge: '新功能',
    gradient: 'from-violet-500 via-purple-500 to-indigo-400',
    hoverGradient: 'hover:from-violet-600 hover:via-purple-600 hover:to-indigo-500',
    shadowColor: 'shadow-violet-500/20',
    shadowHover: 'hover:shadow-violet-500/30',
  },
  {
    id: 'overseas',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页，高转化可适配多平台',
    icon: Globe,
    badge: null,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-400',
    hoverGradient: 'hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-500',
    shadowColor: 'shadow-cyan-500/20',
    shadowHover: 'hover:shadow-cyan-500/30',
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '上传照片智能抠图，一键生成合规证件照',
    icon: ImageIcon,
    badge: '新功能',
    gradient: 'from-emerald-500 via-green-500 to-teal-400',
    hoverGradient: 'hover:from-emerald-600 hover:via-green-600 hover:to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    shadowHover: 'hover:shadow-emerald-500/30',
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
        <div className="max-w-6xl mx-auto px-6 py-10">
          
          {/* 页面标题 - 居左对齐 */}
          <div className="mb-10 animate-fade-in-up">
            <div className="flex items-center gap-4">
              {/* 图标 */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Star className="w-7 h-7 text-white" />
                </div>
              </div>
              
              {/* 文字 */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    自建工具
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  精心打造，助您效率倍增
                </p>
              </div>
            </div>
          </div>

          {/* 工具卡片网格 - 2x2布局 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {OWN_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              const href = tool.id === 'overseas' ? '/productpage' : `/${tool.id}`;

              return (
                <Link 
                  key={tool.id} 
                  href={href}
                  className={cn(
                    "group block animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                >
                  <div className={cn(
                    "relative h-[260px] rounded-2xl overflow-hidden",
                    "bg-gradient-to-br",
                    tool.gradient,
                    tool.hoverGradient,
                    "shadow-lg",
                    tool.shadowColor,
                    tool.shadowHover,
                    "transition-all duration-300",
                    "hover:scale-[1.02] hover:-translate-y-1"
                  )}>
                    {/* 装饰光斑 */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                    
                    {/* 内容层 */}
                    <div className="relative h-full p-7 flex flex-col justify-between">
                      {/* 顶部区域 */}
                      <div className="flex items-start justify-between">
                        {/* 图标容器 */}
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* Badge - 统一样式 */}
                        {tool.badge && (
                          <div className="px-3.5 py-1.5 bg-white rounded-full shadow-md">
                            <span className={cn(
                              "text-xs font-semibold",
                              tool.badge === '热门' ? "text-orange-500" : "text-violet-500"
                            )}>
                              {tool.badge}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 底部区域 */}
                      <div className="space-y-4">
                        {/* 标题 */}
                        <div>
                          <h3 className="text-2xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                            {tool.name}
                          </h3>
                          <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
                            {tool.desc}
                          </p>
                        </div>
                        
                        {/* 行动按钮 */}
                        <div className="flex items-center gap-2 text-white/90">
                          <span className="text-sm font-medium">立即体验</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 底部说明 */}
          <div className="mt-10 text-center animate-fade-in-up stagger-5">
            <p className="text-xs text-muted-foreground/60">
              更多自建工具开发中 · 敬请期待
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
