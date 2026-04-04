'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, ThumbsUp, BookOpen, User, Calendar, Share2 } from 'lucide-react';
import { AnimatedLobster } from '@/components/AnimatedLobster';

interface Tutorial {
  id: number;
  title: string;
  content: string;
  tool_id: number | null;
  category: string;
  difficulty: string;
  cover_image: string | null;
  author: string | null;
  status: string;
  views: number;
  likes: number;
  created_at: string;
  tools?: { id: number; name: string; logo: string } | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  '入门': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '进阶': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '高级': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function TutorialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const res = await fetch(`/api/tutorials/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          setTutorial(data.data);
        } else {
          router.push('/tutorials');
        }
      } catch (error) {
        console.error('获取教程失败:', error);
        router.push('/tutorials');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [params.id, router]);

  const handleLike = async () => {
    if (!tutorial || liked) return;
    
    try {
      const res = await fetch('/api/tutorials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tutorial.id, action: 'like' })
      });
      
      if (res.ok) {
        setLiked(true);
        setTutorial(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tutorial?.title,
          url: window.location.href
        });
      } catch (error) {
        console.log('分享取消');
      }
    } else {
      // 复制链接
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

  if (!tutorial) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tutorials" className="flex items-center gap-2 text-slate-600 hover:text-orange-500 dark:text-slate-300">
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
        {/* 封面图 */}
        {tutorial.cover_image && (
          <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6">
            <img 
              src={tutorial.cover_image} 
              alt={tutorial.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 标题区 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline">{tutorial.category}</Badge>
            <span className={`text-xs px-2 py-1 rounded ${DIFFICULTY_COLORS[tutorial.difficulty] || ''}`}>
              {tutorial.difficulty}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {tutorial.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            {tutorial.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {tutorial.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(tutorial.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tutorial.views} 浏览
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {tutorial.likes} 点赞
            </span>
          </div>
        </div>

        {/* 关联工具 */}
        {tutorial.tools && (
          <Card className="bg-white dark:bg-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={tutorial.tools.logo} 
                    alt={tutorial.tools.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">关联工具</p>
                    <p className="font-medium text-slate-900 dark:text-white">{tutorial.tools.name}</p>
                  </div>
                </div>
                <Link href={`/tools/${tutorial.tools.id}`}>
                  <Button variant="outline" size="sm">查看工具</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 教程内容 */}
        <Card className="bg-white dark:bg-slate-800 mb-6">
          <CardContent className="p-6">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900"
              dangerouslySetInnerHTML={{ __html: tutorial.content }}
            />
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={liked ? "default" : "outline"}
            onClick={handleLike}
            disabled={liked}
            className={liked ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {liked ? '已点赞' : '点赞'}
          </Button>
          <Button variant="outline" onClick={handleShare}>
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
            AI工具使用教程 · 助力创作者高效产出
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
