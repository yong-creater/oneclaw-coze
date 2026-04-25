'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { cn } from '@/lib/utils';
import {
  FileText, BookOpen, Image as ImageIcon, Globe, Star,
  ArrowRight, Sparkles
} from 'lucide-react';

const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能优化简历，提升求职竞争力',
    icon: FileText,
    badge: '热门',
    bgColor: 'from-orange-400 to-orange-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-500'
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: 'AI辅助小说创作，激发无限灵感',
    icon: BookOpen,
    badge: '新功能',
    bgColor: 'from-purple-400 to-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-500'
  },
  {
    id: 'overseas',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页，高转化详情页可适配不同电商平台',
    icon: Globe,
    badge: null,
    bgColor: 'from-blue-400 to-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500'
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '上传照片智能抠图，一键生成合规证件照',
    icon: ImageIcon,
    badge: '新功能',
    bgColor: 'from-emerald-400 to-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500'
  },
];

export default function OwnToolsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 mb-4">
              <Star className="w-7 h-7 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              自建工具
            </h1>
            <p className="text-muted-foreground">
              精心打造的 AI 工具，助您提升工作效率
            </p>
          </div>

          {/* 工具卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {OWN_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const href = tool.id === 'overseas' ? '/productpage' : `/${tool.id}`;

              return (
                <Link key={tool.id} href={href}>
                  <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {/* 预览区 */}
                    <div className={cn(
                      "h-40 flex items-center justify-center relative overflow-hidden",
                      `bg-gradient-to-br ${tool.bgColor}`
                    )}>
                      {/* 装饰圆形 */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
                      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-white/10" />

                      {/* 工具图标 */}
                      <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110",
                        tool.iconBg
                      )}>
                        <Icon className={cn("w-10 h-10", tool.iconColor)} />
                      </div>

                      {/* Badge */}
                      {tool.badge && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 text-xs font-medium text-slate-700 rounded-full">
                          {tool.badge}
                        </div>
                      )}

                      {/* 箭头指示 */}
                      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* 说明区 */}
                    <div className="p-5 bg-white dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tool.desc}
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>立即使用</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 底部提示 */}
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>更多工具正在开发中，敬请期待</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
