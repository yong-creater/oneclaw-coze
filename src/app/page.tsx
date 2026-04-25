'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, BookOpen, FileText, Image as ImageIcon, Briefcase,
  GraduationCap, Globe, Wand2, ChevronRight, ArrowRight, Heart
} from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 自建工具列表
const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    icon: FileText,
    desc: 'AI 智能优化简历，提升求职竞争力',
    href: '/tools/resume',
    badge: '热门',
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    id: 'novel',
    name: '小说创作',
    icon: BookOpen,
    desc: 'AI 辅助小说创作，激发无限灵感',
    href: '/tools/novel',
    badge: '新功能',
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    id: 'overseas',
    name: '出海详情页',
    icon: Globe,
    desc: '一键生成跨境电商产品详情页',
    href: '/tools/overseas',
    badge: null,
    color: 'bg-emerald-500/10 text-emerald-600'
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    icon: ImageIcon,
    desc: '上传照片 · 智能抠图 · 一键生成合规证件照',
    href: '/photo-id',
    badge: '新功能',
    color: 'bg-orange-500/10 text-orange-600'
  },
];

// 提示词分类
const PROMPT_CATEGORIES = [
  { name: '视频创作', desc: 'Sora、Runway 等视频生成提示词', count: 120, icon: Sparkles },
  { name: '图像生成', desc: 'Midjourney、DALL-E 提示词', count: 85, icon: ImageIcon },
  { name: '对话优化', desc: 'ChatGPT、Claude 提示词', count: 200, icon: Wand2 },
];

// 教程分类
const TUTORIAL_CATEGORIES = [
  { name: '视频教程', desc: '手把手视频教学', count: 45, icon: BookOpen },
  { name: '图文教程', desc: '详细的图文指南', count: 120, icon: FileText },
  { name: '实战案例', desc: '真实项目案例分析', count: 30, icon: Briefcase },
];

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'tools' | 'prompts' | 'tutorials'>('tools');

  return (
    <div className="min-h-screen bg-background">
      {/* 侧边栏导航 */}
      <Sidebar />

      <main className="lg:pl-[var(--sidebar-width)] transition-all duration-300">
        {/* 顶部工具栏 - 仅移动端显示 */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border lg:hidden">
          <div className="h-14 flex items-center justify-between px-4">
            <span className="text-lg font-bold text-foreground">OneClaw</span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workspace">
                <Heart className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero 区域 */}
          <section className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              发现优质
              <span className="text-primary"> AI 工具</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              自建 AI 工具 + 精选提示词 + 实用教程，一站式 AI 创作平台
            </p>
          </section>

          {/* Tab 切换 */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center bg-muted rounded-xl p-1">
              {[
                { key: 'tools', label: 'AI工具', icon: Sparkles },
                { key: 'prompts', label: '提示词', icon: Wand2 },
                { key: 'tutorials', label: '教程', icon: BookOpen },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key as typeof activeSection)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI 工具 */}
          {activeSection === 'tools' && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">自建 AI 工具</h2>
                <p className="text-muted-foreground">精心打造的实用工具，助力您的创作</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {OWN_TOOLS.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} href={tool.href}>
                      <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                              tool.color
                            )}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{tool.name}</h3>
                                {tool.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {tool.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{tool.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 提示词库 */}
          {activeSection === 'prompts' && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">AI 提示词库</h2>
                <p className="text-muted-foreground">精选优质提示词模板，助力 AI 创作</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROMPT_CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <Link key={i} href="/prompts">
                      <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                        <CardContent className="p-6 text-center">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{cat.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{cat.desc}</p>
                          <span className="text-sm text-primary font-medium">{cat.count} 条提示词</span>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center mt-8">
                <Button asChild size="lg">
                  <Link href="/prompts">
                    查看全部提示词
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </section>
          )}

          {/* 教程库 */}
          {activeSection === 'tutorials' && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">AI 教程中心</h2>
                <p className="text-muted-foreground">从入门到精通，掌握 AI 工具使用技巧</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TUTORIAL_CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <Link key={i} href="/tutorials">
                      <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                        <CardContent className="p-6 text-center">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{cat.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{cat.desc}</p>
                          <span className="text-sm text-primary font-medium">{cat.count} 篇内容</span>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center mt-8">
                <Button asChild size="lg" variant="outline">
                  <Link href="/tutorials">
                    浏览全部教程
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* 底部 */}
        <footer className="border-t border-border mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="font-semibold text-foreground">OneClaw</span>
              <p className="text-sm text-muted-foreground">
                自建 AI 工具 + 精选提示词 + 实用教程
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/about" className="hover:text-foreground transition-colors">关于我们</Link>
                <Link href="/contact" className="hover:text-foreground transition-colors">联系我们</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
