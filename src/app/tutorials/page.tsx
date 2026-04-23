'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2, Clock, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface Tutorial {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_image: string;
  category: string;
  tags: string[];
  view_count: number;
  author: string;
  created_at: string;
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const res = await fetch('/api/tutorials');
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutorials = tutorials.filter(tutorial =>
    !searchQuery ||
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              placeholder="搜索教程..."
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
          <h1 className="text-2xl font-semibold mb-2">AI教程</h1>
          <p className="text-[var(--muted-foreground)]">学习AI工具使用技巧，快速上手</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)]">暂无教程</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map(tutorial => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.slug}`}>
                <Card className="hover:border-[var(--foreground)] transition-colors h-full">
                  {tutorial.cover_image && (
                    <div className="aspect-video bg-[var(--secondary)] rounded-t-lg overflow-hidden">
                      <img 
                        src={tutorial.cover_image} 
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{tutorial.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                      {tutorial.summary || '暂无简介'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {tutorial.view_count || 0}
                        </span>
                        {tutorial.author && <span>{tutorial.author}</span>}
                      </div>
                      <span>{new Date(tutorial.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
