'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Star, ThumbsUp, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  description: string;
  free_type: string;
  is_featured: boolean;
  feature_tags: string[];
  official_url: string;
  promotion_url: string;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  max_duration: string;
  free_quota_desc: string;
  view_count: number;
  category?: { name: string; slug: string };
}

const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700',
  '免费额度': 'bg-blue-100 text-blue-700',
  '限时免费': 'bg-amber-100 text-amber-700',
  '付费工具': 'bg-red-100 text-red-700',
};

export default function ToolDetailPage() {
  const params = useParams();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTool(params.id as string);
    }
  }, [params.id]);

  const fetchTool = async (id: string) => {
    try {
      const res = await fetch(`/api/tools/${id}`);
      const data = await res.json();
      if (data.success) {
        setTool(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (tool?.official_url) {
      navigator.clipboard.writeText(tool.official_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: tool?.name,
        text: tool?.highlight,
        url: window.location.href,
      });
    }
  };

  const visitUrl = tool?.promotion_url || tool?.official_url || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Skeleton className="w-20 h-4" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Skeleton className="w-16 h-16 rounded-xl mb-4" />
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-32 h-4" />
        </main>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">工具未找到</h1>
          <p className="text-[var(--muted-foreground)] mb-4">该工具可能已下架</p>
          <Link href="/tools">
            <Button variant="outline">返回工具列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/tools" className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回工具列表</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Tool Info */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-[var(--secondary)] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {tool.logo ? (
                <img src={tool.logo} alt={tool.name} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-2xl font-bold">{tool.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold">{tool.name}</h1>
                {tool.is_featured && (
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded text-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>精选</span>
                  </div>
                )}
              </div>
              <p className="text-[var(--muted-foreground)] mb-2">
                {tool.producer} · {tool.category?.name}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-1 rounded ${FREE_TYPE_COLORS[tool.free_type] || 'bg-[var(--secondary)]'}`}>
                  {tool.free_type}
                </span>
                {tool.feature_tags?.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-[var(--secondary)] text-[var(--muted-foreground)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-lg mb-6">{tool.highlight}</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <a href={visitUrl} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2">
                <ExternalLink className="w-4 h-4" />
                访问官网
              </Button>
            </a>
            <Button variant="outline" className="gap-2" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制链接'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              分享
            </Button>
          </div>
        </div>

        {/* Description */}
        {tool.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">详细介绍</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">
              {tool.description}
            </p>
          </div>
        )}

        {/* Advantages */}
        {tool.advantages && tool.advantages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">优势特点</h2>
            <ul className="space-y-2">
              {tool.advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[var(--muted-foreground)]">{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Limitations */}
        {tool.limitations && tool.limitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">局限性</h2>
            <ul className="space-y-2">
              {tool.limitations.map((lim, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[var(--muted-foreground)]">{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Usage Info */}
        {(tool.free_quota_desc || tool.max_duration || tool.commercial_license) && (
          <div className="border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">使用信息</h2>
            <div className="space-y-3">
              {tool.free_quota_desc && (
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">免费额度：</span>
                  <span className="text-sm">{tool.free_quota_desc}</span>
                </div>
              )}
              {tool.max_duration && (
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">最大时长：</span>
                  <span className="text-sm">{tool.max_duration}</span>
                </div>
              )}
              {tool.commercial_license && (
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">商用授权：</span>
                  <span className="text-sm">{tool.commercial_license}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 text-sm text-[var(--muted-foreground)]">
          浏览 {tool.view_count} 次
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2024 OneClaw
          </div>
        </div>
      </footer>
    </div>
  );
}
