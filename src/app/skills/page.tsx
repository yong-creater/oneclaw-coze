'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Copy, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Skill {
  id: number;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  usage_count: number;
  category?: { name: string; slug: string };
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) {
        setSkills(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: number, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSkills = skills.filter(skill =>
    !searchQuery ||
    skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 按分类分组
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const catName = skill.category?.name || '其他';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

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
              placeholder="搜索技能..."
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
          <h1 className="text-2xl font-semibold mb-2">AI技能</h1>
          <p className="text-[var(--muted-foreground)]">精选AI提示词和技能，提升工作效率</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : (
          <Tabs defaultValue={Object.keys(groupedSkills)[0] || 'all'} className="w-full">
            <TabsList className="mb-6 flex flex-wrap h-auto">
              <TabsTrigger value="all">全部</TabsTrigger>
              {Object.keys(groupedSkills).map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSkills.map(skill => (
                  <Card key={skill.id} className="hover:border-[var(--foreground)] transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{skill.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                        {skill.description || '暂无描述'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {skill.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--secondary)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(skill.id, skill.prompt)}>
                          {copiedId === skill.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {Object.entries(groupedSkills).map(([cat, catSkills]) => (
              <TabsContent key={cat} value={cat}>
                <div className="grid gap-4 md:grid-cols-2">
                  {catSkills.map(skill => (
                    <Card key={skill.id} className="hover:border-[var(--foreground)] transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{skill.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                          {skill.description || '暂无描述'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--muted-foreground)]">
                            使用 {skill.usage_count || 0} 次
                          </span>
                          <Button size="sm" variant="outline" onClick={() => handleCopy(skill.id, skill.prompt)}>
                            {copiedId === skill.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
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
