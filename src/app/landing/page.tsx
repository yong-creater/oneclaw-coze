import Link from 'next/link';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock,
  Users,
  ChevronRight,
  ExternalLink,
  Play
} from 'lucide-react';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取统计数据
async function getStats() {
  const supabase = getSupabaseClient();
  
  const [toolsCount, categoriesCount, rankingsCount] = await Promise.all([
    supabase.from('tools').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('monthly_rankings').select('id', { count: 'exact', head: true }).eq('data_status', 'valid'),
  ]);
  
  return {
    tools: toolsCount.count || 0,
    categories: categoriesCount.count || 0,
    rankings: rankingsCount.count || 0,
  };
}

// 获取精选工具
async function getFeaturedTools() {
  const supabase = getSupabaseClient();
  
  const { data } = await supabase
    .from('tools')
    .select('id, name, logo, highlight, free_type, categories(name, slug)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(8);
    
  return data || [];
}

export default async function LandingPage() {
  const [stats, featuredTools] = await Promise.all([getStats(), getFeaturedTools()]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white text-xl">🦞</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>
            
            {/* 导航 */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/?tab=rankings" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
                排行榜
              </Link>
              <Link href="/?tab=tools" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
                AI应用
              </Link>
              <Link href="/?tab=prompts" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
                提示词
              </Link>
              <Link href="/?tab=skills" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
                技能
              </Link>
              <Link href="/?tab=tutorials" className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
                教程
              </Link>
            </nav>
            
            {/* CTA */}
            <Link 
              href="/?tab=tools"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all"
            >
              探索AI工具
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/30 dark:bg-red-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>精选 {stats.tools}+ 优质 AI 工具</span>
            </div>
            
            {/* 主标题 */}
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              发现最优质的
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> AI 工具</span>
            </h1>
            
            {/* 副标题 */}
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              OneClaw 收录全球优质 AI 工具，涵盖视频生成、数字人、AI 绘画、AI 写作等全品类，
              帮助你快速找到最适合自己的 AI 解决方案。
            </p>
            
            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/?tab=tools"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-orange-500/25"
              >
                <Bot className="w-5 h-5" />
                开始探索
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/?tab=rankings"
                className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-lg text-slate-700 dark:text-slate-200 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                查看榜单
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.tools}+</div>
              <div className="text-slate-600 dark:text-slate-400">精选工具</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.categories}</div>
              <div className="text-slate-600 dark:text-slate-400">工具分类</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.rankings}+</div>
              <div className="text-slate-600 dark:text-slate-400">榜单数据</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">每日</div>
              <div className="text-slate-600 dark:text-slate-400">持续更新</div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特点 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              为什么选择 OneClaw
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              我们致力于为你提供最全面、最实用的 AI 工具导航服务
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">精选内容</h3>
              <p className="text-slate-600 dark:text-slate-400">
                人工审核精选，确保每个工具都是经过验证的优质产品
              </p>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">实时更新</h3>
              <p className="text-slate-600 dark:text-slate-400">
                追踪 AI 领域最新动态，及时更新工具信息和榜单数据
              </p>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">节省时间</h3>
              <p className="text-slate-600 dark:text-slate-400">
                无需在海量工具中大海捞针，快速找到最适合你的解决方案
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 精选工具 */}
      {featuredTools.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">热门工具</h2>
                <p className="text-slate-600 dark:text-slate-400">当前最受欢迎的 AI 工具推荐</p>
              </div>
              <Link 
                href="/?tab=tools"
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                查看更多
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredTools.slice(0, 8).map(tool => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-12 h-12 rounded-xl object-contain bg-slate-100 dark:bg-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tool.categories?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {tool.highlight}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 微信公众号 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 左侧内容 */}
              <div className="flex-1 text-white">
                <h2 className="text-3xl font-bold mb-4">关注微信公众号</h2>
                <p className="text-lg text-orange-100 mb-6">
                  扫码关注「OneClaw」，第一时间获取 AI 工具资讯、
                  最新榜单解读和使用教程。
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                    <span>每日推送精选 AI 工具</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span>独家榜单和行业分析</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4" />
                    </div>
                    <span>免费使用教程和技巧</span>
                  </li>
                </ul>
              </div>
              
              {/* 右侧二维码 */}
              <div className="flex-shrink-0">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                    {/* 二维码占位 */}
                    <div className="text-center">
                      <div className="w-40 h-40 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                        <img 
                          src="/qrcode-placeholder.svg" 
                          alt="微信公众号二维码"
                          className="w-36 h-36"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                          <svg className="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 11h8a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2v-8a2 2 0 012-2zm0 1a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-8a1 1 0 00-1-1H3zm11.5-1a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-9 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm7 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
                          </svg>
                          <span className="text-sm">公众号二维码</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-500">
                    微信搜索：OneClaw
                  </p>
                  <p className="text-center text-xs text-slate-400 mt-1">
                    或扫码关注
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好探索 AI 世界了吗？
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            立即开始，发现属于你的 AI 工具
          </p>
          <Link 
            href="/?tab=tools"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold text-lg transition-all"
          >
            立即开始
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white">🦞</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-white">OneClaw</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 OneClaw. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
