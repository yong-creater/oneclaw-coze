'use client';

import Link from 'next/link';
import Sidebar from '@/components/common/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FileText, BookOpen, Image as ImageIcon, Globe, Sparkles, Star
} from 'lucide-react';

const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    icon: FileText,
    desc: 'AI 智能优化简历，提升求职竞争力',
    href: '/resume',
    badge: '热门',
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    id: 'novel',
    name: '小说创作',
    icon: BookOpen,
    desc: 'AI 辅助小说创作，激发无限灵感',
    href: '/novel',
    badge: '新功能',
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    id: 'overseas',
    name: '出海详情页',
    icon: ImageIcon,
    desc: '一键生成跨境电商产品详情页',
    href: '/productpage',
    badge: null,
    color: 'bg-emerald-500/10 text-emerald-600'
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    icon: Globe,
    desc: '上传照片 · 智能抠图 · 一键生成合规证件照',
    href: '/photo-id',
    badge: '新功能',
    color: 'bg-orange-500/10 text-orange-600'
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                自建工具
              </h1>
            </div>
            <p className="text-muted-foreground">
              精心打造的 AI 工具，助您提升工作效率
            </p>
          </div>

          {/* 工具列表 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {OWN_TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.href}>
                  <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                          tool.color
                        )}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            {tool.badge && (
                              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">
                                {tool.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.desc}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
