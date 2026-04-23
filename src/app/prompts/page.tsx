'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Copy, Check, Loader2, Heart, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Prompt {
  id: number;
  title: string;
  prompt: string;
  description: string;
  category: string;
  tags: string[];
  usage_count: number;
  likes_count: number;
  is_featured: boolean;
  author: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: number, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = prompts.filter(prompt =>
    !searchQuery ||
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 按分类分组
  const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];
  const groupedPrompts = filteredPrompts.reduce((acc, prompt) => {
    const cat = prompt.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] sticky top-0 bg-[var(--background)]/95 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </Link>
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="搜索提示词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-[var(--secondary)] border-0 rounded-lg"
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">AI提示词</h1>
          <p className="text-[var(--muted-foreground)]">精选提示词库，让AI输出更精准</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex flex-wrap h-auto">
              <TabsTrigger value="all">全部</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPrompts.map(prompt => (
                  <Card key={prompt.id} className="hover:border-[var(--foreground)] transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{prompt.title}</h3>
                          {prompt.is_featured && (
                            <Zap className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(prompt.id, prompt.prompt)}>
                          {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                        {prompt.description || '暂无描述'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--secondary)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {prompt.likes_count || 0}
                          </span>
                          <span>使用 {prompt.usage_count || 0} 次</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {categories.map(cat => (
              <TabsContent key={cat} value={cat}>
                <div className="grid gap-4 md:grid-cols-2">
                  {groupedPrompts[cat]?.map(prompt => (
                    <Card key={prompt.id} className="hover:border-[var(--foreground)] transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{prompt.title}</h3>
                          <Button size="sm" variant="ghost" onClick={() => handleCopy(prompt.id, prompt.prompt)}>
                            {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                          {prompt.description || '暂无描述'}
                        </p>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          使用 {prompt.usage_count || 0} 次
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2024 OneClaw
          </div>
        </div>
      </footer>
    </div>
  );
}
