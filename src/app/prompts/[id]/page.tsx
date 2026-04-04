'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, Sparkles, User, Calendar, Eye } from 'lucide-react';
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

const CATEGORY_ICONS: Record<string, string> = {
  '视频生成': '🎬',
  'AI绘画': '🎨',
  '文案写作': '✍️',
  '代码编程': '💻',
  '数字人': '👤',
  '音频生成': '🎵',
  '图像处理': '🖼️',
  '数据分析': '📊',
  '营销文案': '📢',
  '学习助手': '📚',
  '其他': '📝',
};

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      const id = params?.id;
      if (!id) return;
      
      try {
        const res = await fetch(`/api/prompts/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setPrompt(data.data);
        } else {
          router.push('/prompts');
        }
      } catch (error) {
        console.error('获取提示词失败:', error);
        router.push('/prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [params, router]);

  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
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
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-xl">
              {CATEGORY_ICONS[prompt.category] || '📝'}
            </div>
            <Badge variant="outline">{prompt.category}</Badge>
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
              <Eye className="w-4 h-4" />
              {prompt.uses || 0} 次使用
            </span>
          </div>
        </div>

        {/* 标签 */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {prompt.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {tag}
              </Badge>
            ))}
          </div>
        )}

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
                    <p className="text-sm text-slate-500 dark:text-slate-400">关联工具</p>
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
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                提示词内容
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
              💡 使用技巧
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• 点击「复制」按钮将提示词复制到剪贴板</li>
              <li>• 在对应的AI工具中粘贴使用</li>
              <li>• 可以根据具体需求修改提示词细节</li>
              <li>• 好的提示词越具体，生成效果越好</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AnimatedLobster size={24} />
            <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            AI提示词库 · 助力创作者高效产出
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
