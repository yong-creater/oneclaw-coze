'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Video, Search, Film, Wand2, Palette, 
  Mic, Users, ChevronRight, Star, X,
  ChevronLeft, Eye, ThumbsUp, TrendingUp
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import { SkeletonGrid } from '@/components/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/SponsorBadge';
import AdBanner from '@/components/AdBanner';
import UserButton from '@/components/UserButton';
import Link from 'next/link';

// ==================== 类型定义 ====================
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  feature_tags: string[];
  official_url: string;
  promotion_url: string | null;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  max_duration: string;
  free_quota_desc: string | null;
  sponsor_type: string | null;
  sponsor_expires_at: string | null;
  categories: { name: string; slug: string };
}

interface RankingItem {
  id: number;
  rank: number;
  tool_id: number | null;
  tool_name: string;
  tool_url: string;
  tool_logo: string;
  monthly_visits: string;
  growth: string;
  growth_rate: string;
  category: string;
  tool_description: string;
}

// ==================== 常量 ====================
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const CATEGORY_ICONS: Record<string, typeof Video> = {
  'video-generation': Wand2,
  'digital-human': Users,
  'video-editing': Film,
  'ai-dubbing': Mic,
  'anime-creation': Palette,
};

const MAIN_TABS = [
  { key: 'rankings', label: '热门榜单', icon: TrendingUp },
  { key: 'tools', label: '工具导航', icon: Video },
] as const;

type MainTab = typeof MAIN_TABS[number]['key'];

// ==================== 工具函数 ====================
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('oneclaw_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('oneclaw_user_id', userId);
  }
  return userId;
};

// 缓存管理器
	const CACHE_DURATION = 5 * 60 * 1000;
	const cache = {
	  get: (key: string) => {
	    if (typeof window === 'undefined') return null;
	    const item = localStorage.getItem(`oneclaw_cache_${key}`);
	    if (!item) return null;
	    try {
	      const { data, timestamp } = JSON.parse(item);
	      if (Date.now() - timestamp > CACHE_DURATION) {
	        localStorage.removeItem(`oneclaw_cache_${key}`);
	        return null;
	      }
	      return data;
	    } catch { return null; }
	  },
	  set: (key: string, data: unknown) => {
	    if (typeof window === 'undefined') return;
	    localStorage.setItem(`oneclaw_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
	  }
	};

	// ==================== 主组件 ====================
export default function HomePage() {
  // 主Tab状态
  const [mainTab, setMainTab] = useState<MainTab>('rankings');

  // ==================== 榜单状态 ====================
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(true);
  const [rankingsMonth, setRankingsMonth] = useState('');

  // ==================== 工具导航状态 ====================
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [toolsPagination, setToolsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 筛选状态
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 用户相关
  const [userId, setUserId] = useState('');

  // ==================== 初始化 ====================
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  useEffect(() => {
    // 并行加载所有数据
    Promise.all([
      fetchCategories(),
      fetchRankings()
    ]);
  }, []);

  // ==================== 榜单相关方法 ====================
  const fetchRankings = async () => {
    // 检查缓存
    const cached = cache.get('rankings');
    if (cached) {
      setRankings(cached.data || []);
      setRankingsMonth(cached.month || '');
      setRankingsLoading(false);
      return;
    }
    
    setRankingsLoading(true);
    try {
      const res = await fetch(`/api/rankings/monthly?limit=50`);
      const data = await res.json();
      
      if (data.success) {
        const rankingsData = data.data || [];
        const month = data.meta?.current_month || '';
        cache.set('rankings', { data: rankingsData, month });
        setRankings(rankingsData);
        setRankingsMonth(month);
      }
    } catch (error) {
      console.error('获取榜单失败:', error);
    } finally {
      setRankingsLoading(false);
    }
  };

  // ==================== 工具相关方法 ====================
  const fetchCategories = async () => {
    const cached = cache.get('categories');
    if (cached) {
      setCategories(cached);
      return;
    }
    
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        cache.set('categories', data.data);
        setCategories(data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchTools = useCallback(async () => {
    const cacheKey = `tools_${activeCategory}_${toolsPagination.page}`;
    const cached = cache.get(cacheKey);
    if (cached && !searchQuery) {
      setTools(cached.data || []);
      setToolsPagination(prev => ({ ...prev, total: cached.total, total_pages: cached.total_pages }));
      setToolsLoading(false);
      return;
    }
    
    setToolsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', toolsPagination.page.toString());
      params.set('limit', '20');
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        const toolsData = data.data;
        setTools(toolsData);
        setToolsPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages
        }));
        if (!searchQuery) {
          cache.set(cacheKey, { data: toolsData, total: data.pagination.total, total_pages: data.pagination.total_pages });
        }
      }
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setToolsLoading(false);
    }
  }, [toolsPagination.page, activeCategory, searchQuery]);

  useEffect(() => {
    if (mainTab === 'tools') fetchTools();
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === 'tools') {
      setToolsPagination(prev => ({ ...prev, page: 1 }));
      fetchTools();
    }
  }, [activeCategory]);

  useEffect(() => {
    if (mainTab === 'tools') {
      const timer = setTimeout(() => {
        setToolsPagination(prev => ({ ...prev, page: 1 }));
        fetchTools();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (mainTab === 'tools') fetchTools();
  }, [toolsPagination.page]);

  // ==================== 清除筛选 ====================
  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={36} />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>

            {/* 主导航Tab */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1">
              {MAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================== 热门榜单 ==================== */}
        {mainTab === 'rankings' && (
          <div>
            {/* 页面标题 */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {rankingsMonth ? `${rankingsMonth.replace('-', '年')}月 AI工具榜单` : 'AI工具热门榜单'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                精选最受欢迎的AI工具，实时追踪热度变化
              </p>
            </div>

            {/* 榜单内容 */}
            {rankingsLoading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                </div>
              </div>
            ) : rankings.length > 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-4 font-medium w-20">排名</th>
                      <th className="px-6 py-4 font-medium">工具</th>
                      <th className="px-6 py-4 font-medium w-32">月访问量</th>
                      <th className="px-6 py-4 font-medium w-24">增长率</th>
                      <th className="px-6 py-4 font-medium w-24">分类</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {rankings.map((item) => (
                      <tr 
                        key={item.id} 
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        onClick={() => {
                          if (item.tool_id) {
                            window.open(`/tools/${item.tool_id}`, '_blank');
                          } else {
                            window.open(item.tool_url, '_blank');
                          }
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            item.rank === 1 ? 'bg-yellow-400 text-white' :
                            item.rank === 2 ? 'bg-slate-300 text-white' :
                            item.rank === 3 ? 'bg-orange-300 text-white' :
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.tool_logo || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.tool_url)}&sz=64`}
                              alt={item.tool_name}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-100 dark:bg-slate-700"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.tool_url)}&sz=64`;
                              }}
                            />
                            <div>
                              <span className="font-medium text-slate-800 dark:text-white hover:text-orange-500 transition-colors">
                                {item.tool_name}
                              </span>
                              {item.tool_description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                  {item.tool_description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {item.monthly_visits || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.growth_rate ? (
                            <span className={`text-sm font-medium ${
                              item.growth_rate.includes('-') ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {item.growth_rate}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {item.category || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">暂无榜单数据</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  请联系管理员导入榜单数据
                </p>
              </div>
            )}

            {/* 更多榜单链接 */}
            <div className="mt-6 text-center">
              <Link href="/rankings">
                <Button variant="outline" className="gap-2">
                  查看完整榜单
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ==================== 工具导航 ==================== */}
        {mainTab === 'tools' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-24">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>全部工具</span>
                  </button>
                  {categories.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.slug] || Video;
                    const isActive = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索框 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索AI工具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

            {/* 广告位 */}
            <AdBanner position="home_banner" className="mb-6" />

            {/* 工具数量 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                共 <span className="font-semibold text-slate-900 dark:text-white">{toolsPagination.total}</span> 款工具
              </p>
            </div>

            {/* 工具列表 */}
            {toolsLoading ? (
              <SkeletonGrid count={8} />
            ) : tools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools.map(tool => (
                    <a
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={() => {
                        // 异步记录浏览历史
                        if (userId) {
                          fetch('/api/history', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId, tool_id: tool.id })
                          }).catch(console.error);
                        }
                      }}
                    >
                      <Card
                        className="h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all"
                      >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={tool.logo}
                              alt={tool.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${tool.name[0]}</text></svg>`;
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool.name}</h3>
                              {isSponsorActive(tool.sponsor_type, tool.sponsor_expires_at) && (
                                <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                              )}
                              {tool.is_featured && !tool.sponsor_type && (
                                <Star className="w-3 h-3 text-orange-500 fill-orange-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{tool.highlight}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${FREE_TYPE_COLORS[tool.free_type]}`}>
                                {tool.free_type}
                              </span>
                              {tool.feature_tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </a>
                  ))}
                </div>

                {/* 分页 */}
                {toolsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toolsPagination.page === 1}
                      onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">
                      {toolsPagination.page} / {toolsPagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toolsPagination.page === toolsPagination.total_pages}
                      onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h3>
                <p className="text-sm text-slate-500 mb-4">尝试调整筛选条件</p>
                <Button variant="outline" onClick={clearFilters}>清除筛选</Button>
              </div>
            )}
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AnimatedLobster size={24} />
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
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
