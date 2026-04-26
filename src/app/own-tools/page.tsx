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
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: '洗稿润色、人物DNA、绘画提示词、场景描写',
    href: '/novel',
    icon: BookOpen,
  },
  {
    id: 'productpage',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页，符合亚马逊规范',
    href: '/productpage',
    icon: BarChart3,
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '智能抠图，一键生成合规证件照',
    href: '/photo-id',
    icon: Image,
  },
];

export default function OwnToolsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
      >
        <div className="px-6 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">自建工具</h1>
            <p className="text-sm text-muted-foreground mt-1">
              一站式AI创作工具集
            </p>
          </div>

          {/* 工具网格 - 苹果风格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="group p-6 rounded-xl bg-secondary hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* 图标 */}
                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.desc}
                      </p>
                    </div>
                    
                    {/* 箭头 */}
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* 底部说明 */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              更多工具持续开发中，敬请期待
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
