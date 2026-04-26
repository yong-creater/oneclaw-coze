'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { cn } from '@/lib/utils';
import {
  Sparkles, ArrowRight,
  FileText, BookOpen, Image, BarChart3
} from 'lucide-react';

// 自建工具配置
const TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能分析并优化简历，提升面试机会',
    href: '/resume',
    icon: FileText,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: '洗稿润色、人物DNA、绘画提示词、场景描写',
    href: '/novel',
    icon: BookOpen,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    id: 'productpage',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页，符合亚马逊规范',
    href: '/productpage',
    icon: BarChart3,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '智能抠图，一键生成合规证件照',
    href: '/photo-id',
    icon: Image,
    color: 'bg-orange-500/10 text-orange-600',
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">自建工具</h1>
            <p className="text-sm text-muted-foreground mt-1">
              一站式AI创作工具集
            </p>
          </div>

          {/* 工具网格 - 2x2 苹果风格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="card-minimal p-6 group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* 图标 */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      tool.color
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.desc}
                      </p>
                    </div>
                    
                    {/* 箭头 */}
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* 底部说明 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              更多工具持续开发中，敬请期待
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
