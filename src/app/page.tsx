'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Sparkles, BookOpen, Lightbulb, Star, ArrowRight, Search, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Tool {
  id: number;
  name: string;
  logo: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  category?: { name: string; slug: string };
}

interface Skill {
  id: number;
  title: string;
  description: string;
  category?: { name: string };
}

interface Tutorial {
  id: number;
  title: string;
  slug: string;
  summary: string;
  view_count: number;
}

interface Prompt {
  id: number;
  title: string;
  description: string;
  usage_count: number;
}

const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '付费工具': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function HomePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [toolsRes, skillsRes, tutorialsRes, promptsRes] = await Promise.all([
        fetch('/api/tools?featured=true&limit=8'),
        fetch('/api/skills?featured=true&limit=4'),
        fetch('/api/tutorials?featured=true&limit=4'),
        fetch('/api/prompts?featured=true&limit=6'),
      ]);
      const [toolsData, skillsData, tutorialsData, promptsData] = await Promise.all([
        toolsRes.json(),
        skillsRes.json(),
        tutorialsRes.json(),
        promptsRes.json(),
      ]);
      if (toolsData.success) setTools(toolsData.data);
      if (skillsData.success) setSkills(skillsData.data);
      if (tutorialsData.success) setTutorials(tutorialsData.data);
      if (promptsData.success) setPrompts(promptsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--foreground)] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-[var(--background)]" />
            </div>
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/tools" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              AI应用
            </Link>
            <Link href="/skills" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              技能
            </Link>
            <Link href="/tutorials" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              教程
            </Link>
            <Link href="/prompts" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              提示词
            </Link>
            <Link href="/cases" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              案例
            </Link>
            <Link href="/resume" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              简历优化
            </Link>
            <Link href="/about" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              关于
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              发现最好的 AI 工具
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              精选AI应用、技能、教程和提示词，帮你找到最合适的效率工具
            </p>
            
            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <Input
                type="text"
                placeholder="搜索AI工具、技能、教程..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-[var(--secondary)] border-0 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link href="/tools">
              <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer text-center">
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">AI应用</span>
              </div>
            </Link>
            <Link href="/skills">
              <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer text-center">
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">技能</span>
              </div>
            </Link>
            <Link href="/tutorials">
              <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer text-center">
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">教程</span>
              </div>
            </Link>
            <Link href="/prompts">
              <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer text-center">
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">提示词</span>
              </div>
            </Link>
            <Link href="/cases">
              <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer text-center">
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">案例</span>
              </div>
            </Link>
            <Link href="/resume">
              <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">简历优化</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">精选AI应用</h2>
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-[var(--border)] rounded-xl p-4 animate-pulse">
                  <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg mb-3" />
                  <div className="h-4 bg-[var(--secondary)] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[var(--secondary)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tools.slice(0, 8).map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {tool.logo ? (
                          <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-lg font-semibold">{tool.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{tool.name}</h3>
                        {tool.is_featured && (
                          <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs">精选</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">
                      {tool.highlight || '暂无描述'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${FREE_TYPE_COLORS[tool.free_type] || 'bg-[var(--secondary)]'}`}>
                      {tool.free_type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Skills */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">精选技能</h2>
            <Link href="/skills">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.slice(0, 4).map((skill) => (
              <Link key={skill.id} href="/skills">
                <div className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer h-full">
                  <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center mb-3">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{skill.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                    {skill.description || '暂无描述'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">最新教程</h2>
            <Link href="/tutorials">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tutorials.slice(0, 4).map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.slug}`}>
                <div className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer h-full">
                  <div className="w-full aspect-video bg-[var(--secondary)] rounded-lg mb-3" />
                  <h3 className="font-medium text-sm line-clamp-2">{tutorial.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    浏览 {tutorial.view_count || 0} 次
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Prompts */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">热门提示词</h2>
            <Link href="/prompts">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prompts.slice(0, 6).map((prompt) => (
              <Link key={prompt.id} href="/prompts">
                <div className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer h-full">
                  <h3 className="font-medium text-sm mb-1">{prompt.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-2">
                    {prompt.description || '暂无描述'}
                  </p>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    使用 {prompt.usage_count || 0} 次
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <span>© 2024 OneClaw</span>
              <span className="hidden md:inline">·</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">
                京ICP备XXXXXXXX号-1
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-[var(--foreground)]">关于</Link>
              <Link href="/prompts" className="hover:text-[var(--foreground)]">提示词</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
