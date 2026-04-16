import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Star, ExternalLink } from 'lucide-react';
import BackToHome from '@/components/BackToHome';
import AnimatedLobster from '@/components/AnimatedLobster';

export const metadata: Metadata = {
  title: 'AI工具库',
  description: '精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作等全品类',
};

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

async function getTools(category?: string, search?: string) {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('tools')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  if (category && category !== 'all') {
    query = query.eq('categories.slug', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data: tools, error } = await query;

  if (error) {
    console.error('获取工具失败:', error);
    return [];
  }

  return tools || [];
}

async function getCategories() {
  const supabase = getSupabaseClient();
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('获取分类失败:', error);
    return [];
  }

  return categories || [];
}

export default async function ToolsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [tools, categories] = await Promise.all([
    getTools(params.category, params.search),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <BackToHome />
            <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1">
              <span>返回首页</span>
            </Link>
          </div>
          
          <div className="text-center py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI工具库</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              精选{tools.length}款优质AI工具，覆盖视频生成、数字人、AI绘画等多个领域
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link 
            href="/tools"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !params.category || params.category === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                params.category === cat.slug
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* 工具列表 */}
        {tools.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h2>
            <p className="text-slate-500">试试其他分类或关键词</p>
            <Link 
              href="/tools"
              className="inline-flex items-center gap-2 mt-4 text-orange-500 hover:text-orange-600"
            >
              查看全部工具
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link 
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {tool.logo ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                          <Image
                            src={tool.logo}
                            alt={tool.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {tool.name.charAt(0)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                            {tool.name}
                          </h3>
                          {tool.is_featured && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {tool.highlight || tool.producer}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {tool.categories && (
                            <Badge variant="outline" className="text-xs">
                              {tool.categories.name}
                            </Badge>
                          )}
                          <Badge 
                            variant={tool.free_type === '完全免费' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              tool.free_type === '完全免费' 
                                ? 'bg-green-500 text-white border-green-500' 
                                : ''
                            }`}
                          >
                            {tool.free_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={20} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
              <span className="text-xs text-slate-400 ml-2">AI工具库</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">
                关于OneClaw
              </Link>
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
