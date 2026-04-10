'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Flame, TrendingUp, TrendingDown, Minus,
  ExternalLink, Search, ChevronLeft, ChevronRight, Filter,
  Download, Info, ArrowUpDown, ArrowUp, ArrowDown, Globe
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';

// 类型定义
interface MonthlyRanking {
  id: number;
  rank: number;
  rank_change: number;
  tool_id: number | null;
  tool_name: string;
  tool_url: string;
  tool_logo: string;
  tool_logo_backup: string;
  tool_description: string;
  monthly_visits: string;
  monthly_visits_num: number;
  growth: string;
  growth_num: number;
  growth_rate: string;
  growth_rate_num: number;
  global_rank: number;
  category: string;
  tags: string[];
  stats_month: string;
}

interface RankingsResponse {
  success: boolean;
  data: MonthlyRanking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  meta: {
    current_month: string;
    available_months: string[];
    available_categories: string[];
  };
}

// 榜单类型配置
const RANKING_TYPES = [
  { id: 'hot', name: '热门榜单', icon: Flame, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
];

// 格式化月份显示
const formatMonth = (month: string) => {
  const [year, m] = month.split('-');
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return `${year}年${monthNames[parseInt(m) - 1]}`;
};

export default function RankingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<MonthlyRanking[]>([]);
  const [meta, setMeta] = useState<RankingsResponse['meta'] | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, total_pages: 0 });
  
  // 筛选状态
  const [activeTab, setActiveTab] = useState('hot');
  const [currentMonth, setCurrentMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'visits' | 'growth_rate'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // 搜索防抖
  const [searchInput, setSearchInput] = useState('');

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', activeTab);
      params.set('month', currentMonth);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', pagination.page.toString());
      params.set('limit', '50');
      
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const res = await fetch(`/api/rankings/monthly?${params}`);
      const data: RankingsResponse = await res.json();

      if (data.success) {
        setRankings(data.data);
        setMeta(data.meta);
        setPagination(data.pagination);
        if (!currentMonth && data.meta.current_month) {
          setCurrentMonth(data.meta.current_month);
        }
      }
    } catch (error) {
      console.error('获取榜单失败:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentMonth, selectedCategory, searchQuery, sortBy, sortOrder, pagination.page]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 切换 Tab 时重置筛选
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
    // 切换到增长榜单时默认按增长率排序
    if (tab === 'growth') {
      setSortBy('growth_rate');
      setSortOrder('desc');
    } else {
      setSortBy('rank');
      setSortOrder('asc');
    }
  };

  // 切换月份
  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 切换排序
  const handleSort = (column: 'rank' | 'visits' | 'growth_rate') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'rank' ? 'asc' : 'desc');
    }
  };

  // 渲染排名变化
  const renderRankChange = (change: number) => {
    if (change > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400 text-sm font-medium">
          <ArrowUp className="w-3 h-3" />
          {change}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 text-sm font-medium">
          <ArrowDown className="w-3 h-3" />
          {Math.abs(change)}
        </span>
      );
    }
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  // 渲染增长率
  const renderGrowthRate = (rate: string, num: number) => {
    if (!rate) return '-';
    const isPositive = num >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '+' : ''}{rate}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={36} />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI工具榜单</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* 月份选择器 */}
              {meta?.available_months && meta.available_months.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const idx = meta.available_months.indexOf(currentMonth);
                      if (idx < meta.available_months.length - 1) {
                        handleMonthChange(meta.available_months[idx + 1]);
                      }
                    }}
                    disabled={!currentMonth || meta.available_months.indexOf(currentMonth) >= meta.available_months.length - 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <select
                    value={currentMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {meta.available_months.map(month => (
                      <option key={month} value={month}>{formatMonth(month)}</option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const idx = meta.available_months.indexOf(currentMonth);
                      if (idx > 0) {
                        handleMonthChange(meta.available_months[idx - 1]);
                      }
                    }}
                    disabled={!currentMonth || meta.available_months.indexOf(currentMonth) <= 0}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Link href="/">
                <Button variant="outline" size="sm">返回首页</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 工具栏 */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* 榜单类型切换 */}
          <div className="flex items-center gap-2">
            {RANKING_TYPES.map(type => {
              const Icon = type.icon;
              const isActive = activeTab === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTabChange(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `${type.color} border border-current`
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                </button>
              );
            })}
          </div>

          {/* 搜索框 */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="搜索工具名称..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 h-10"
              />
            </div>
            
            {/* 导出按钮 */}
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              导出
            </Button>
            
            {/* 帮助 */}
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* 左侧边栏 - 分类筛选 */}
          <aside className="w-48 flex-shrink-0 hidden lg:block">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-24">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  分类
                </h3>
              </div>
              <nav className="p-2">
                <button
                  onClick={() => { setSelectedCategory('all'); setPagination(prev => ({ ...prev, page: 1 })); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>全部</span>
                </button>
                {meta?.available_categories?.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setPagination(prev => ({ ...prev, page: 1 })); }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                      selectedCategory === cat
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* 右侧内容 */}
          <div className="flex-1 min-w-0">
            {/* 榜单表格 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('rank')}>
                  排行
                  {sortBy === 'rank' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </div>
                <div className="col-span-4">工具</div>
                <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('visits')}>
                  月访问量
                  {sortBy === 'visits' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('growth_rate')}>
                  增长率
                  {sortBy === 'growth_rate' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </div>
                <div className="col-span-3">简介</div>
              </div>

              {/* 表格内容 */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : rankings.length > 0 ? (
                rankings.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors items-center cursor-pointer"
                    onClick={() => {
                      // 记录来源页面
                      if (typeof window !== 'undefined') {
                        const backState = {
                          path: window.location.pathname + window.location.search,
                          tab: 'rankings'
                        };
                        sessionStorage.setItem('backFrom', JSON.stringify(backState));
                      }
                      if (item.tool_id) {
                        router.push(`/tools/${item.tool_id}`);
                      } else {
                        window.location.href = item.tool_url;
                      }
                    }}
                  >
                    {/* 排名 */}
                    <div className="col-span-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        item.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                        item.rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-white' :
                        item.rank === 3 ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {item.rank}
                      </div>
                      <div className="mt-1">
                        {renderRankChange(item.rank_change)}
                      </div>
                    </div>

                    {/* 工具信息 */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={item.tool_logo || item.tool_logo_backup}
                          alt={item.tool_name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${item.tool_name[0]}</text></svg>`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-slate-800 dark:text-slate-100 hover:text-orange-500 transition-colors truncate block">
                          {item.tool_name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {item.category}
                            </span>
                          )}
                          {item.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 访问量 */}
                    <div className="col-span-2 flex flex-col justify-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {item.monthly_visits || '-'}
                      </span>
                      {item.growth && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          {item.growth_num >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                          {item.growth}
                        </span>
                      )}
                    </div>

                    {/* 增长率 */}
                    <div className="col-span-2 flex items-center">
                      {renderGrowthRate(item.growth_rate || '', item.growth_rate_num || 0)}
                      {item.global_rank && (
                        <span className="ml-2 text-xs text-slate-400 flex items-center gap-0.5">
                          <Globe className="w-3 h-3" />
                          #{item.global_rank}
                        </span>
                      )}
                    </div>

                    {/* 简介 */}
                    <div className="col-span-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.tool_description || '暂无简介'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {currentMonth ? `${formatMonth(currentMonth)}暂无榜单数据` : '暂无榜单数据'}
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    请选择其他月份或联系管理员导入数据
                  </p>
                </div>
              )}

              {/* 分页 */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    共 {pagination.total} 条记录，第 {pagination.page}/{pagination.total_pages} 页
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-300 px-2">
                      {pagination.page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AnimatedLobster size={28} />
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
