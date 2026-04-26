'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

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
  '特效制作': '✨',
  '音乐生成': '🎶',
  '图片处理': '🖼️',
  '写作助手': '✍️',
};

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string | null;
  uses: number;
  created_at: string;
  tools?: {
    id: number;
    name: string;
    logo: string;
  };
}

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchPrompt = async () => {
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
  }, [id, router]);

  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast.success('复制成功！');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!prompt) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <BackToHome label="提示词详情" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 标题区 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center text-xl">
              {CATEGORY_ICONS[prompt.category] || '📝'}
            </div>
            <span className="text-sm px-2 py-1 rounded border border-slate-200">
              {prompt.category}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            {prompt.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
            {prompt.author && (
              <span>👤 {prompt.author}</span>
            )}
            <span>📅 {new Date(prompt.created_at).toLocaleDateString()}</span>
            <span>👁 {prompt.uses || 0} 次使用</span>
          </div>
        </div>

        {/* 标签 */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {prompt.tags.map((tag: string, index: number) => (
              <span key={index} className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 关联工具 */}
        {prompt.tools && (
          <Link href={`/tools/${prompt.tools.id}`} className="block bg-white rounded-lg p-4 mb-6 border border-slate-200 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={prompt.tools.logo} 
                  alt={prompt.tools.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm text-slate-500">关联工具</p>
                  <p className="font-medium text-slate-900">{prompt.tools.name}</p>
                </div>
              </div>
              <span className="text-sm px-4 py-2 rounded border border-slate-200 bg-slate-50">
                查看工具 →
              </span>
            </div>
          </Link>
        )}

        {/* Prompt内容 */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <span className="text-orange-500">✨</span>
              提示词内容
            </h2>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  一键复制
                </>
              )}
            </button>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
              {prompt.content}
            </pre>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <h3 className="font-bold text-lg text-slate-900 mb-3">
            💡 使用技巧
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• 点击「一键复制」按钮将提示词复制到剪贴板</li>
            <li>• 在对应的AI工具中粘贴使用</li>
            <li>• 可以根据具体需求修改提示词细节</li>
            <li>• 好的提示词越具体，生成效果越好</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        {/* 公众号推广 */}
        <WechatPromo />
        
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/favicon.svg" 
                alt="OneClaw" 
                width={28} 
                height={28}
                className="object-contain"
              />
              <span className="font-bold text-slate-900">OneClaw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于OneClaw</Link>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
