'use client';

import Link from 'next/link';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { cn } from '@/lib/utils';
import {
  FileText, BookOpen, Image as ImageIcon, Globe, Star,
  ArrowRight
} from 'lucide-react';

const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能优化简历，提升求职竞争力',
    icon: FileText,
    badge: null,
    href: '/resume',
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: 'AI辅助小说创作，激发无限灵感',
    icon: BookOpen,
    badge: 'New',
    href: '/novel',
  },
  {
    id: 'overseas',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页',
    icon: Globe,
    badge: null,
    href: '/productpage',
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '上传照片智能抠图，生成合规证件照',
    icon: ImageIcon,
    badge: 'New',
    href: '/photo-id',
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
        <div className="max-w-5xl mx-auto px-8 py-12">
          
          {/* 页面标题 - 简洁风格 */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
                <Star className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  自建工具
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  精心打造，助您效率倍增
                </p>
              </div>
            </div>
          </div>

          {/* 工具网格 - 简洁卡片风格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OWN_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  className={cn(
                    "group animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                >
                  <div className="card-minimal p-6 h-full">
                    <div className="flex items-start gap-5">
                      {/* 图标 */}
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                          {tool.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-foreground text-background rounded">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      
                      {/* 箭头 */}
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 底部说明 */}
          <div className="mt-12 text-center animate-fade-in-up stagger-5">
            <p className="text-sm text-muted-foreground">
              更多工具开发中
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
