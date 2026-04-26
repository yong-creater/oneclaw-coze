'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Search, Bot, Send, Loader2, ArrowRight,
  Video, Image as ImageIcon, MessageSquare, FileText, 
  Code2, Mic, Users, Music, BookOpen, Sparkles,
  Wand2, Globe, GraduationCap
} from 'lucide-react';

// 快捷分类
const CATEGORIES = [
  { icon: Video, label: '视频生成', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
  { icon: Users, label: '数字人', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10' },
  { icon: ImageIcon, label: 'AI绘画', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10' },
  { icon: MessageSquare, label: 'AI聊天', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
  { icon: FileText, label: 'AI写作', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
  { icon: Code2, label: 'AI编程', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10' },
  { icon: Mic, label: 'AI配音', color: 'from-red-500 to-pink-500', bg: 'bg-red-500/10' },
  { icon: Music, label: 'AI音频', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10' },
];

// 精选工具
const FEATURED = [
  { name: '简历优化', desc: 'AI智能优化', icon: FileText, color: 'from-orange-400 to-amber-500' },
  { name: '小说创作', desc: '激发灵感', icon: BookOpen, color: 'from-purple-400 to-pink-500' },
  { name: '出海详情页', desc: '跨境电商', icon: Globe, color: 'from-blue-400 to-cyan-500' },
  { name: 'AI证件照', desc: '智能抠图', icon: ImageIcon, color: 'from-green-400 to-emerald-500' },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索处理
  const handleSearch = async () => {
    if (!input.trim() || isTyping) return;
    
    setIsTyping(true);
    const query = input.trim();
    
    // 意图分析
    const lowerQuery = query.toLowerCase();
    let redirectUrl = '/ai-tools';
    
    if (lowerQuery.includes('简历')) redirectUrl = '/resume';
    else if (lowerQuery.includes('小说')) redirectUrl = '/novel';
    else if (lowerQuery.includes('出海') || lowerQuery.includes('详情页')) redirectUrl = '/productpage';
    else if (lowerQuery.includes('证件照')) redirectUrl = '/photo-id';
    else if (lowerQuery.includes('教程') || lowerQuery.includes('学习')) redirectUrl = '/tutorials';
    else if (lowerQuery.includes('提示词') || lowerQuery.includes('prompt')) redirectUrl = '/prompts';
    else if (lowerQuery.includes('视频') || lowerQuery.includes('sora')) redirectUrl = '/ai-tools?category=视频生成';
    else if (lowerQuery.includes('数字人')) redirectUrl = '/ai-tools?category=数字人';
    else if (lowerQuery.includes('绘画')) redirectUrl = '/ai-tools?category=AI绘画';
    else if (lowerQuery.includes('聊天')) redirectUrl = '/ai-tools?category=AI聊天';
    else if (lowerQuery.includes('编程') || lowerQuery.includes('代码')) redirectUrl = '/ai-tools?category=AI编程';
    else redirectUrl = `/ai-tools?search=${encodeURIComponent(query)}`;
    
    // 短暂延迟体验
    await new Promise(r => setTimeout(r, 300));
    router.push(redirectUrl);
  };

  // 快捷分类点击
  const handleCategoryClick = (label: string) => {
    router.push(`/ai-tools?category=${encodeURIComponent(label)}`);
  };

  // 精选工具点击
  const handleFeaturedClick = (name: string) => {
    const routes: Record<string, string> = {
      '简历优化': '/resume',
      '小说创作': '/novel',
      '出海详情页': '/productpage',
      'AI证件照': '/photo-id',
    };
    router.push(routes[name] || '/ai-tools');
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        {/* 主内容区 - 居中 */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl space-y-10">
            
            {/* Logo区域 */}
            <div className="text-center space-y-4 animate-fade-in-up">
              {/* 品牌图标 */}
              <div className="inline-flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 rounded-2xl blur-xl opacity-20 animate-pulse-glow" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              {/* 品牌文字 */}
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    OneClaw
                  </span>
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  全品类AI工具导航 · 精选238款优质工具
                </p>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="animate-fade-in-up stagger-1">
              <div className="relative group">
                {/* 搜索框光晕 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center gap-3 bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="搜索AI工具、提示词、教程..."
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                  />
                  <Button 
                    size="sm"
                    onClick={handleSearch}
                    disabled={!input.trim() || isTyping}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-sm"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 快捷分类 */}
            {showCategories && (
              <div className="space-y-4 animate-fade-in-up stagger-2">
                <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">
                  快捷访问
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => handleCategoryClick(cat.label)}
                      className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-105",
                        cat.color
                      )}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 精选工具 */}
            <div className="space-y-4 animate-fade-in-up stagger-3">
              <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">
                自建工具
              </p>
              <div className="grid grid-cols-2 gap-3">
                {FEATURED.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => handleFeaturedClick(tool.name)}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-sm",
                      tool.color
                    )}>
                      <tool.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* 底部提示 */}
            <div className="text-center animate-fade-in stagger-4">
              <p className="text-xs text-muted-foreground/60">
                支持自然语言搜索 · 试试「帮我找个写代码的AI工具」
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
