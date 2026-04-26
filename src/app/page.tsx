'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search, Bot, ArrowRight,
  Video, Image as ImageIcon, MessageSquare, FileText, 
  Code2, Mic, Users, Music, Sparkles, BookOpen
} from 'lucide-react';

// 快捷分类
const CATEGORIES = [
  { icon: Video, label: '视频生成' },
  { icon: Users, label: '数字人' },
  { icon: ImageIcon, label: 'AI绘画' },
  { icon: MessageSquare, label: 'AI聊天' },
  { icon: FileText, label: 'AI写作' },
  { icon: Code2, label: 'AI编程' },
  { icon: Mic, label: 'AI配音' },
  { icon: Music, label: 'AI音频' },
];

// 自建工具
const OWN_TOOLS = [
  { name: '简历优化', desc: 'AI智能优化', href: '/resume', icon: Sparkles },
  { name: '小说创作', desc: '激发灵感', href: '/novel', icon: BookOpen },
  { name: '出海详情页', desc: '跨境电商', href: '/productpage', icon: FileText },
  { name: 'AI证件照', desc: '智能抠图', href: '/photo-id', icon: ImageIcon },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
      >
        {/* 主内容区 - 苹果风格居中 */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-lg space-y-10">
            
            {/* Logo区域 - 简洁有力 */}
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
                  <Bot className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  OneClaw
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  全品类AI工具导航 · 精选238款优质工具
                </p>
              </div>
            </div>

            {/* 搜索框 - 简洁设计 */}
            <div className="animate-fade-in-up stagger-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="搜索AI工具..."
                    className="h-11 pl-10 pr-4"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={!input.trim() || isSearching}
                  className="h-11 px-5"
                >
                  搜索
                </Button>
              </div>
            </div>

            {/* 快捷分类 */}
            <div className="space-y-4 animate-fade-in-up stagger-2">
              <p className="text-xs text-muted-foreground text-center uppercase tracking-wider font-medium">
                快捷访问
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => handleCategoryClick(cat.label)}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent text-sm transition-colors"
                  >
                    <cat.icon className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 自建工具 - 简洁网格 */}
            <div className="space-y-4 animate-fade-in-up stagger-3">
              <p className="text-xs text-muted-foreground text-center uppercase tracking-wider font-medium">
                自建工具
              </p>
              <div className="grid grid-cols-2 gap-2">
                {OWN_TOOLS.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.href}
                    className="group p-4 rounded-xl bg-secondary hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block group-hover:text-primary transition-colors">
                          {tool.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tool.desc}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
