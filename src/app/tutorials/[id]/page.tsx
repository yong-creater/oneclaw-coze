import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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
  '入门': 'bg-green-100 text-green-700',
  '初级': 'bg-green-100 text-green-700',
  '进阶': 'bg-blue-100 text-blue-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-orange-100 text-orange-700',
};

// 简单的 Markdown 转 HTML 函数
function renderMarkdown(content: string): string {
  if (!content) return '';
  
  let html = content;
  
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-slate-900">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-slate-900 border-b pb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-slate-900">$1</h1>');
  
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // 列表项
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1 list-decimal">$2</li>');
  
  // 段落
  html = html.split('\n\n').map(block => {
    if (block.trim() && !block.startsWith('<')) {
      if (block.match(/^- /m) || block.match(/^\d+\. /m)) {
        return `<ul class="my-3 space-y-1">${block}</ul>`;
      }
      return `<p class="mb-4 leading-relaxed text-slate-700">${block}</p>`;
    }
    return block;
  }).join('\n');
  
  // 换行
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

export default async function TutorialDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  try {
    const client = getSupabaseClient();
    const { data: tutorial, error } = await client
      .from('tutorials')
      .select('*')
      .eq('id', parseInt(id))
      .eq('status', 'published')
      .single();
    
    if (error || !tutorial) {
      notFound();
    }
    
    // 增加浏览量（异步执行，不阻塞渲染）
    client
      .from('tutorials')
      .update({ views: (tutorial.views || 0) + 1 })
      .eq('id', tutorial.id)
      .then(() => {});
    
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/tutorials" className="flex items-center gap-2 text-slate-600 hover:text-orange-500">
              <span>← 返回列表</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* 标题区 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-sm px-2 py-1 rounded border border-slate-200">
                {tutorial.category}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${DIFFICULTY_COLORS[tutorial.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                {tutorial.difficulty}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {tutorial.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
              {tutorial.author && (
                <span>👤 {tutorial.author}</span>
              )}
              <span>📅 {new Date(tutorial.created_at).toLocaleDateString()}</span>
              <span>👁 {tutorial.views} 浏览</span>
              <span>👍 {tutorial.likes} 点赞</span>
            </div>
          </div>

          {/* 教程内容 */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(tutorial.content) }}
            />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('获取教程失败:', error);
    notFound();
  }
}
