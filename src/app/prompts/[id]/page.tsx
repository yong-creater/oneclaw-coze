'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, FileText, User, Calendar, Share2 } from 'lucide-react';
import { AnimatedLobster } from '@/components/AnimatedLobster';

interface Prompt {
  id: number;
  title: string;
  content: string;
  tool_id: number | null;
  category: string;
  tags: string[];
  author: string | null;
  status: string;
  uses: number;
  created_at: string;
  tools?: { id: number; name: string; logo: string } | null;
}

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`/api/prompts/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          setPrompt(data.data);
        } else {
          router.push('/prompts');
        }
      } catch (error) {
        console.error('获取Prompt失败:', error);
        router.push('/prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [params.id, router]);

  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      
      // 增加使用次数
      await fetch('/api/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.id })
      });
      
      setPrompt(prev => prev ? { ...prev, uses: prev.uses + 1 } : null);
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt?.title,
          text: prompt?.content.slice(0, 100) + '...',
          url: window.location.href
        });
      } catch (error) {
        console.log('分享取消');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('链接已复制');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!prompt) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/prompts" className="flex items-center gap-2 text-slate-600 hover:text-orange-500 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
              <span>返回列表</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLobster size={28} />
              <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 标题区 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline">{prompt.category}</Badge>
            {prompt.tags?.slice(0, 5).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {prompt.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            {prompt.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {prompt.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(prompt.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Copy className="w-4 h-4" />
              {prompt.uses} 次使用
            </span>
          </div>
        </div>

        {/* 关联工具 */}
        {prompt.tools && (
          <Card className="bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={prompt.tools.logo} 
                    alt={prompt.tools.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">适用工具</p>
                    <p className="font-medium text-slate-900 dark:text-white">{prompt.tools.name}</p>
                  </div>
                </div>
                <Link href={`/tools/${prompt.tools.id}`}>
                  <Button variant="outline" size="sm">查看工具</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompt内容 */}
        <Card className="bg-white dark:bg-slate-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white">Prompt内容</h2>
              <Button
                onClick={handleCopy}
                className={copied ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制使用
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 font-mono leading-relaxed overflow-x-auto">
                {prompt.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* 使用提示 */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800/30 mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">使用提示</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <li>• 点击"复制使用"按钮复制Prompt内容</li>
              <li>• 在对应的AI工具中粘贴使用</li>
              <li>• 根据实际需求调整参数和细节</li>
              <li>• 多次尝试可以获得更好的效果</li>
            </ul>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleCopy}
            size="lg"
            className={copied ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已复制到剪贴板
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                复制Prompt
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AnimatedLobster size={24} />
            <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            AI创作提示词库 · 激发无限创意
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 OneClaw · <a href="mailto:1017760688@qq.com" className="hover:text-orange-500">1017760688@qq.com</a>
            <span className="mx-2">·</span>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
              渝ICP备2026004291号-2
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
