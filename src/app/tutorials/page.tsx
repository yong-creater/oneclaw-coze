'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ExternalLink, Eye, ThumbsUp } from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  type: string;
  author: string;
  views: number;
  likes: number;
  is_featured: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '入门': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '中级': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  '进阶': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '高级': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const categories = ['全部', '入门教程', '进阶技巧', '案例分享', '最佳实践'];

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== '全部') params.set('category', selectedCategory);

      const res = await fetch(`/api/tutorials?${params}`);
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
      }
    } catch (error) {
      console.error('获取教程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutorials = searchQuery
    ? tutorials.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tutorials;

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
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-4">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI教程中心
            </h1>
            <p className="text-muted-foreground">
              详细的使用教程，帮助你快速上手AI工具
            </p>
          </div>

          {/* 搜索和分类 */}
          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="搜索教程..."
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

          {/* 教程列表 */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5">
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTutorials.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTutorials.map(tutorial => (
                <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
                      {tutorial.is_featured && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          精选
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {tutorial.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {tutorial.likes}
                        </span>
                      </div>
                      <Link href={`/tutorials/${tutorial.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          查看详情
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">暂无教程</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
