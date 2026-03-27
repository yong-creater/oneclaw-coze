'use client';

import { useState, useMemo, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, ChevronRight, ArrowLeft, Copy, Check, Sparkles, BookOpen
} from 'lucide-react';
import { prompts, promptCategories, PromptItem } from '@/data/prompts';

// 提示词卡片组件
const PromptCard = memo(function PromptCard({ 
  prompt, 
  onClick 
}: { 
  prompt: PromptItem; 
  onClick: () => void;
}) {
  return (
    <Card 
      className="hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {promptCategories.find(c => c.name === prompt.category)?.icon || '📝'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {prompt.title}
              </h3>
              {prompt.featured && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-xs flex-shrink-0 hover:from-red-600 hover:to-orange-600 px-2">
                  推荐
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mb-2">
              <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-600">
                {prompt.category}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {prompt.description}
            </p>
            
            <div className="flex items-center justify-between gap-2 mt-3">
              <div className="flex flex-wrap gap-1">
                {prompt.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-0.5 flex-shrink-0 font-medium">
                查看详情
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// 提示词详情弹窗组件
const PromptDetailDialog = memo(function PromptDetailDialog({ 
  prompt, 
  onClose 
}: { 
  prompt: PromptItem | null; 
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (prompt) {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!prompt) return null;
  
  return (
    <Dialog open={!!prompt} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
              {promptCategories.find(c => c.name === prompt.category)?.icon || '📝'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">{prompt.title}</DialogTitle>
                {prompt.featured && (
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500">推荐</Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{prompt.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="border-slate-200 dark:border-slate-600">{prompt.category}</Badge>
                {prompt.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-slate-100 dark:bg-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="relative">
            <div className="absolute right-2 top-2 z-10">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    复制提示词
                  </>
                )}
              </Button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 pt-12 overflow-x-auto">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制到剪贴板
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制提示词
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              className="border-slate-200 dark:border-slate-700"
              onClick={onClose}
            >
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  // 过滤后的提示词
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '全部' || prompt.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // 推荐提示词
  const featuredPrompts = useMemo(() => {
    return prompts.filter(p => p.featured).slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">返回首页</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦞</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
              </div>
            </div>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              AI视频工具箱
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            专业提示词库
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            AI视频创作提示词库
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            精选 {prompts.length} 个专业提示词模板，涵盖视频生成、数字人、配音剪辑等场景，
            助你高效创作优质AI视频内容
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="搜索提示词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-base shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {promptCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {category.icon} {category.name}
              <span className="ml-1.5 text-xs opacity-80">({category.count})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main List */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                找到 <span className="font-semibold text-slate-900 dark:text-white">{filteredPrompts.length}</span> 个提示词
              </p>
            </div>

            {/* Prompt Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onClick={() => setSelectedPrompt(prompt)}
                />
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-slate-500 dark:text-slate-400">
                  没有找到匹配的提示词，试试其他关键词？
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            {/* Featured Prompts */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">推荐提示词</h3>
              </div>
              <div className="space-y-3">
                {featuredPrompts.map((prompt) => (
                  <div 
                    key={prompt.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center text-sm">
                      {promptCategories.find(c => c.name === prompt.category)?.icon || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-slate-900 dark:text-white">{prompt.title}</p>
                      <p className="text-xs text-slate-500">{prompt.category}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-red-100 dark:border-slate-600 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">💡 使用技巧</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  点击提示词卡片查看完整内容
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  使用复制按钮快速获取提示词
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  根据具体需求调整提示词参数
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  多次迭代优化获得最佳效果
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🦞</span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            AI视频创作提示词库 · 助力创作者高效产出
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 OneClaw · <a href="mailto:1017760688@qq.com" className="hover:text-red-500">1017760688@qq.com</a>
          </p>
        </div>
      </footer>

      {/* Detail Dialog */}
      <PromptDetailDialog 
        prompt={selectedPrompt} 
        onClose={() => setSelectedPrompt(null)} 
      />
    </div>
  );
}
