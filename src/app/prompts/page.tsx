'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string | null;
  uses: number;
  is_featured: boolean;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = ['全部', '视频创作', '图像生成', '场景描述', '对话优化'];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== '全部') params.set('category', selectedCategory);

      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
      }
    } catch (error) {
      console.error('获取提示词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const filteredPrompts = searchQuery
    ? prompts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : prompts;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
              <Sparkles className="w-7 h-7 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              提示词库
            </h1>
            <p className="text-muted-foreground">
              精选高质量提示词，助你高效创作
            </p>
          </div>

          {/* 搜索和分类 */}
          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* 提示词列表 */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5">
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPrompts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredPrompts.map(prompt => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{prompt.title}</h3>
                        {prompt.is_featured && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            精选
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline">{prompt.category}</Badge>
                    </div>

                    {expandedPrompt === prompt.id ? (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-mono whitespace-pre-wrap">{prompt.content}</p>
                        {prompt.tags?.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {prompt.tags.map((tag, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {prompt.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        使用 {prompt.uses} 次
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                        >
                          {expandedPrompt === prompt.id ? '收起' : '预览'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPrompt(prompt.content, prompt.id)}
                        >
                          {copiedId === prompt.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              复制
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">暂无提示词</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
