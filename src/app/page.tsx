'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ExternalLink, Video, Search, Film, Wand2, Palette, Music, 
  Mic, Users, ChevronRight, Sparkles, Star, X, Check,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import { SkeletonGrid } from '@/components/LobsterSkeleton';

// 类型定义
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  type: string;
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
  categories: { name: string; slug: string };
}

// 免费类型颜色
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

// 分类图标
const CATEGORY_ICONS: Record<string, typeof Video> = {
  'video-generation': Wand2,
  'digital-human': Users,
  'video-editing': Film,
  'ai-dubbing': Mic,
  'anime-creation': Palette,
};

export default function HomePage() {
  // 状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureTags, setFeatureTags] = useState<Tag[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 筛选状态
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreeTypes, setSelectedFreeTypes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // 详情弹窗
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 获取分类
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  // 获取标签
  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags?type=feature');
      const data = await res.json();
      if (data.success) {
        setFeatureTags(data.data);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
    }
  };

  // 获取工具列表
  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', '20');
      
      if (activeCategory !== 'all') {
        params.set('category', activeCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      if (selectedFreeTypes.length > 0) {
        params.set('free_types', selectedFreeTypes.join(','));
      }
      if (selectedFeatures.length > 0) {
        params.set('features', selectedFeatures.join(','));
      }

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTools(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages
        }));
      }
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, activeCategory, searchQuery, selectedFreeTypes, selectedFeatures]);

  // 初始化
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // 筛选变化时重新获取
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTools();
  }, [activeCategory, selectedFreeTypes, selectedFeatures]);

  // 搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchTools();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 分页变化
  useEffect(() => {
    fetchTools();
  }, [pagination.page]);

  // 切换筛选
  const toggleFilter = (type: 'freeType' | 'feature', value: string) => {
    if (type === 'freeType') {
      setSelectedFreeTypes(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else {
      setSelectedFeatures(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    }
  };

  // 清除筛选
  const clearFilters = () => {
    setSelectedFreeTypes([]);
    setSelectedFeatures([]);
    setSearchQuery('');
    setActiveCategory('all');
  };

  // 打开详情
  const openDetail = (tool: Tool) => {
    setSelectedTool(tool);
    setDetailOpen(true);
  };

  // 获取跳转链接
  const getRedirectUrl = (tool: Tool) => {
    return tool.promotion_url || tool.official_url;
  };

  const hasFilters = selectedFreeTypes.length > 0 || selectedFeatures.length > 0 || searchQuery;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI视频工具导航</p>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索AI视频工具..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 bg-slate-100 dark:bg-slate-700 border-0 focus-visible:ring-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* 统计 */}
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Video className="w-4 h-4" />
              <span>共 {pagination.total} 款工具</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 分类导航 */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            全部
          </button>
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug] || Video;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* 筛选区 */}
        <div className="mb-6 space-y-4">
          {/* 免费类型 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">免费类型</h3>
            <div className="flex flex-wrap gap-2">
              {['完全免费', '免费额度', '限时免费', '付费工具'].map(type => (
                <button
                  key={type}
                  onClick={() => toggleFilter('freeType', type)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedFreeTypes.includes(type)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 功能标签 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">核心功能</h3>
            <div className="flex flex-wrap gap-2">
              {featureTags.slice(0, 8).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleFilter('feature', tag.name)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedFeatures.includes(tag.name)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 清除筛选 */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>

        {/* 工具列表 */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.map(tool => (
                <Card
                  key={tool.id}
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => openDetail(tool)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Logo */}
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
                          <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                            {tool.name}
                          </h3>
                          {tool.is_featured && (
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                          {tool.highlight}
                        </p>
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
              ))}
            </div>

            {/* 分页 */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无符合条件的工具</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">试试更换筛选条件</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              清除筛选
            </Button>
          </div>
        )}
      </main>

      {/* 工具详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={selectedTool.logo}
                    alt={selectedTool.name}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-100 dark:bg-slate-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect fill="%23f97316" width="56" height="56"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${selectedTool.name[0]}</text></svg>`;
                    }}
                  />
                  <div>
                    <DialogTitle className="text-xl">{selectedTool.name}</DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTool.producer}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 核心亮点 */}
                <p className="text-slate-600 dark:text-slate-300">{selectedTool.highlight}</p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${FREE_TYPE_COLORS[selectedTool.free_type]}`}>
                    {selectedTool.free_type}
                  </span>
                  {selectedTool.feature_tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 免费额度说明 */}
                {selectedTool.free_quota_desc && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💰 {selectedTool.free_quota_desc}
                    </p>
                  </div>
                )}

                {/* 核心优势 */}
                {selectedTool.advantages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">核心优势</h4>
                    <ul className="space-y-1">
                      {selectedTool.advantages.map((adv, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-green-500" />
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 局限性 */}
                {selectedTool.limitations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">局限性</h4>
                    <ul className="space-y-1">
                      {selectedTool.limitations.map((lim, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <X className="w-4 h-4 text-red-500" />
                          {lim}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 其他信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">生成时长：</span>
                    <span className="text-slate-700 dark:text-slate-200">{selectedTool.max_duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">商用授权：</span>
                    <span className="text-slate-700 dark:text-slate-200">{selectedTool.commercial_license}</span>
                  </div>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => {
                      window.open(getRedirectUrl(selectedTool), '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    官网直达
                  </Button>
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>
                    关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
