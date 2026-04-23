'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2, Eye, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface Case {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_image: string;
  tool_name: string;
  category: string;
  tags: string[];
  view_count: number;
  is_featured: boolean;
  created_at: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      const data = await res.json();
      if (data.success) {
        setCases(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem =>
    !searchQuery ||
    caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.tool_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
              placeholder="搜索案例..."
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
          <h1 className="text-2xl font-semibold mb-2">AI案例</h1>
          <p className="text-[var(--muted-foreground)]">探索AI工具的实际应用案例</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)]">暂无案例</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map(caseItem => (
              <Link key={caseItem.id} href={`/cases/${caseItem.slug}`}>
                <Card className="hover:border-[var(--foreground)] transition-colors h-full">
                  {caseItem.cover_image && (
                    <div className="aspect-video bg-[var(--secondary)] rounded-t-lg overflow-hidden relative">
                      <img 
                        src={caseItem.cover_image} 
                        alt={caseItem.title}
                        className="w-full h-full object-cover"
                      />
                      {caseItem.is_featured && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          精选
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    {caseItem.tool_name && (
                      <span className="text-xs text-[var(--muted-foreground)] mb-1 block">
                        {caseItem.tool_name}
                      </span>
                    )}
                    <h3 className="font-semibold mb-2 line-clamp-2">{caseItem.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                      {caseItem.summary || '暂无简介'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {caseItem.view_count || 0}
                      </span>
                      <span>{caseItem.category}</span>
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
