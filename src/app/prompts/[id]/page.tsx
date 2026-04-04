import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string | null;
  uses: number;
  created_at: string;
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

export default async function PromptDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  try {
    const client = getSupabaseClient();
    const { data: prompt, error } = await client
      .from('prompts')
      .select('*, tools(id, name, logo)')
      .eq('id', parseInt(id))
      .eq('status', 'published')
      .single();
    
    if (error || !prompt) {
      notFound();
    }
    
    // 增加使用次数（异步执行，不阻塞渲染）
    client
      .from('prompts')
      .update({ uses: (prompt.uses || 0) + 1 })
      .eq('id', prompt.id)
      .then(() => {});
    
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/prompts" className="flex items-center gap-2 text-slate-600 hover:text-orange-500">
              <span>← 返回列表</span>
            </Link>
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
              {prompt.tags.map((tag, index) => (
                <span key={index} className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 关联工具 */}
          {prompt.tools && (
            <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200">
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
                <Link 
                  href={`/tools/${prompt.tools.id}`}
                  className="text-sm px-4 py-2 rounded border border-slate-200 hover:bg-slate-50"
                >
                  查看工具
                </Link>
              </div>
            </div>
          )}

          {/* Prompt内容 */}
          <div className="bg-white rounded-lg p-6 shadow mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <span className="text-orange-500">✨</span>
                提示词内容
              </h2>
              <div className="text-sm px-4 py-2 rounded border border-slate-200 bg-slate-50 text-slate-600">
                📋 请手动复制下方内容
              </div>
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
              <li>• 点击「复制」按钮将提示词复制到剪贴板</li>
              <li>• 在对应的AI工具中粘贴使用</li>
              <li>• 可以根据具体需求修改提示词细节</li>
              <li>• 好的提示词越具体，生成效果越好</li>
            </ul>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('获取提示词失败:', error);
    notFound();
  }
}
