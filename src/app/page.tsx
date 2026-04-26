'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search, Bot, ArrowRight, Sparkles, Zap,
  Video, Image as ImageIcon, MessageSquare, FileText, 
  Code2, Mic, Users, Music, BookOpen, Wand2
} from 'lucide-react';

// 快捷分类
const CATEGORIES = [
  { icon: Video, label: '视频生成', color: 'from-violet-500 to-purple-500' },
  { icon: Users, label: '数字人', color: 'from-blue-500 to-cyan-500' },
  { icon: ImageIcon, label: 'AI绘画', color: 'from-pink-500 to-rose-500' },
  { icon: MessageSquare, label: 'AI聊天', color: 'from-emerald-500 to-teal-500' },
  { icon: FileText, label: 'AI写作', color: 'from-amber-500 to-orange-500' },
  { icon: Code2, label: 'AI编程', color: 'from-blue-600 to-indigo-600' },
  { icon: Mic, label: 'AI配音', color: 'from-red-500 to-pink-500' },
  { icon: Music, label: 'AI音频', color: 'from-purple-500 to-fuchsia-500' },
];

// 自建工具
const OWN_TOOLS = [
  { name: '简历优化', desc: 'AI智能分析并优化', href: '/resume', icon: Sparkles, color: 'from-blue-500 to-indigo-500' },
  { name: '小说创作', desc: '激发灵感写作', href: '/novel', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { name: '出海详情页', desc: '跨境电商必备', href: '/productpage', icon: Wand2, color: 'from-amber-500 to-orange-500' },
  { name: 'AI证件照', desc: '一键智能抠图', href: '/photo-id', icon: ImageIcon, color: 'from-emerald-500 to-teal-500' },
];

// 统计数据
const STATS = [
  { value: '238+', label: '精选工具' },
  { value: '12', label: '分类领域' },
  { value: '50K+', label: '用户选择' },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  // 搜索处理
  const handleSearch = async () => {
    if (!input.trim() || isSearching) return;
    
    setIsSearching(true);
    const query = input.trim();
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
    
    await new Promise(r => setTimeout(r, 200));
    router.push(redirectUrl);
  };

  // 快捷分类点击
  const handleCategoryClick = (label: string) => {
    router.push(`/ai-tools?category=${encodeURIComponent(label)}`);
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        {/* 主内容区 */}
        <div className="min-h-screen flex flex-col">
          {/* Hero 区域 */}
          <div className="flex-1 flex items-center justify-center px-8 py-16">
            <div className="w-full max-w-2xl space-y-10">
              
              {/* Logo区域 - 精致设计 */}
              <div className="text-center space-y-6 animate-fade-in-up">
                {/* Logo 图标 */}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  {/* 装饰光晕 */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl -z-10" />
                </div>
                
                {/* 标题 */}
                <div className="space-y-3">
                  <h1 className="text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      OneClaw
                    </span>
                  </h1>
                  <p className="text-lg text-zinc-500 dark:text-zinc-400">
                    全品类AI工具导航 · 精选238款优质工具
                  </p>
                </div>

                {/* 统计数据 */}
                <div className="flex items-center justify-center gap-8 pt-2">
                  {STATS.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 搜索框 - 精致设计 */}
              <div className="animate-fade-in-up stagger-1">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <div className="relative flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-2xl p-2 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-800/50">
                    <div className="pl-4">
                      <Search className="w-5 h-5 text-zinc-400" />
                    </div>
                    <Input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="搜索AI工具、视频、绘画..."
                      className="flex-1 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-400"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={!input.trim() || isSearching}
                      className="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 rounded-xl font-medium transition-all duration-200"
                    >
                      <Zap className="w-4 h-4 mr-1.5" />
                      搜索
                    </Button>
                  </div>
                </div>
              </div>

              {/* 快捷分类 - 精致胶囊 */}
              <div className="space-y-4 animate-fade-in-up stagger-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">
                  快捷访问
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategoryClick(cat.label)}
                      className={cn(
                        "group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                        "hover:border-transparent hover:shadow-lg"
                      )}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </span>
                      {/* Hover 渐变背景 */}
                      <div className={cn(
                        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                        "bg-gradient-to-r", cat.color
                      )} />
                      {/* 白色文字覆盖 */}
                      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                        <cat.icon className="w-3.5 h-3.5 mr-1.5" />
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自建工具 - 精致卡片网格 */}
              <div className="space-y-4 animate-fade-in-up stagger-3">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">
                  自建工具
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {OWN_TOOLS.map((tool, i) => (
                    <a
                      key={tool.name}
                      href={tool.href}
                      className="group relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-800/50 hover:-translate-y-1"
                    >
                      {/* 渐变装饰 */}
                      <div className={cn(
                        "absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40",
                        "bg-gradient-to-br", tool.color
                      )} />
                      
                      <div className="relative flex items-start gap-3">
                        {/* 图标 */}
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                          "bg-gradient-to-br", tool.color
                        )}>
                          <tool.icon className="w-5 h-5 text-white" />
                        </div>
                        
                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-200">
                            {tool.name}
                          </span>
                          <span className="text-xs text-zinc-500 mt-0.5 block">
                            {tool.desc}
                          </span>
                        </div>
                        
                        {/* 箭头 */}
                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent" />
          
          {/* 底部信息 */}
          <div className="py-6 text-center">
            <p className="text-xs text-zinc-400">
              © 2024 OneClaw · AI工具导航专家
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
