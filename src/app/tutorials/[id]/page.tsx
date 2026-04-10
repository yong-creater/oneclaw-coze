import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { Eye, User, Calendar } from 'lucide-react';
import TutorialLikeButton from '@/components/TutorialLikeButton';
import BackButton from '@/components/BackButton';

interface Tutorial {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  author: string | null;
  views: number;
  likes: number;
  created_at: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  '入门': 'bg-green-100 text-green-700 border-green-200',
  '初级': 'bg-green-100 text-green-700 border-green-200',
  '进阶': 'bg-blue-100 text-blue-700 border-blue-200',
  '中级': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '高级': 'bg-red-100 text-red-700 border-red-200',
};

// 简单的 Markdown 转 HTML 函数
function renderMarkdown(content: string): string {
  if (!content) return '';
  
  let html = content;
  
  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>');
  
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-slate-900 dark:text-white">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white border-b border-slate-200 pb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">$1</h1>');
  
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-500 hover:text-orange-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-orange-600 dark:text-orange-400">$1</code>');
  
  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 text-slate-700 dark:text-slate-300">• $1</li>');
  
  // 有序列表
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 mb-2 text-slate-700 dark:text-slate-300">$1. $2</li>');
  
  // 段落
  const blocks = html.split('\n\n');
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    
    // 已经是HTML标签
    if (trimmed.startsWith('<')) {
      // 如果是连续的列表项，包裹在ul中
      if (trimmed.includes('<li class="ml-6 mb-2')) {
        return `<ul class="my-4 space-y-1">${trimmed}</ul>`;
      }
      return trimmed;
    }
    
    // 普通段落
    return `<p class="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">${trimmed}</p>`;
  }).join('\n');
  
  // 单个换行转<br>
  html = html.replace(/\n(?!<)/g, '<br/>');
  
  return html;
}

// 获取教程详情
async function getTutorial(id: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .eq('id', parseInt(id))
    .eq('status', 'published')
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return data;
}

export default async function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tutorial = await getTutorial(id);
  
  if (!tutorial) {
    notFound();
  }
  
  // 增加浏览量
  const supabase = getSupabaseClient();
  supabase
    .from('tutorials')
    .update({ views: (tutorial.views || 0) + 1 })
    .eq('id', tutorial.id)
    .then(() => {});
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <BackButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 教程头部信息 */}
        <div className="mb-8">
          {/* 分类和难度标签 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-sm font-medium">
              {tutorial.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${DIFFICULTY_COLORS[tutorial.difficulty] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {tutorial.difficulty}
            </span>
          </div>
          
          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {tutorial.title}
          </h1>
          
          {/* 元信息 */}
          <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap">
            {tutorial.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{tutorial.author}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(tutorial.created_at).toLocaleDateString('zh-CN')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{tutorial.views} 浏览</span>
            </span>
            <TutorialLikeButton tutorialId={tutorial.id} initialLikes={tutorial.likes} />
          </div>
        </div>

        {/* 教程内容 */}
        <article className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <div 
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-orange-500"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(tutorial.content) }}
          />
        </article>
        
        {/* 底部操作区 */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link 
            href="/tutorials"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            查看更多教程
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        {/* 公众号推广 */}
        <div className="max-w-4xl mx-auto px-4 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img 
              src="/wechat-qrcode.jpg" 
              alt="微信公众号" 
              className="w-20 h-20 rounded-lg shadow-sm"
            />
            <div>
              <h3 className="font-bold text-slate-900 mb-1">欢迎关注公众号</h3>
              <p className="text-sm text-slate-500 mb-1">
                获取最新AI工具资讯、技巧与资源
              </p>
              <p className="text-xs text-slate-400">
                回复「AI」送你一份AI工具使用指南
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/oneclaw-logo.png" 
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
