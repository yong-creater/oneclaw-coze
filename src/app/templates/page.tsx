'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search,
  Grid3X3,
  List,
  Sparkles,
  Star,
  Eye,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

interface Template {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  style: string;
  thumbnail?: string;
  isFeatured?: boolean;
  usage_count?: number;
  created_at?: string;
}

interface TemplateStats {
  total: number;
  active: number;
  totalUses: number;
}

// 风格颜色映射
const styleColors: Record<string, string> = {
  minimal: 'from-slate-100 to-gray-100',
  vibrant: 'from-orange-100 to-amber-100',
  luxury: 'from-purple-100 to-violet-100',
  cute: 'from-pink-100 to-rose-100',
  tech: 'from-blue-100 to-cyan-100',
};

// 风格名称映射
const styleLabels: Record<string, string> = {
  minimal: '简约',
  vibrant: '活力',
  luxury: '高端',
  cute: '可爱',
  tech: '科技',
};

// 分类名称映射
const categoryLabels: Record<string, string> = {
  social: '社交媒体',
  video: '视频封面',
  ecommerce: '电商',
  poster: '海报',
  document: '文档',
  logo: 'Logo',
};

// 默认模板数据（当 API 不可用时使用）
const defaultTemplates: Template[] = [
  { id: 1, name: '电商通用主图', category: 'ecommerce', categoryName: '电商', style: 'minimal', thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop', isFeatured: true, usage_count: 8900 },
  { id: 2, name: '小红书封面', category: 'social', categoryName: '社交媒体', style: 'vibrant', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', isFeatured: true, usage_count: 15600 },
  { id: 3, name: '抖音视频封面', category: 'video', categoryName: '视频封面', style: 'vibrant', thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop', isFeatured: false, usage_count: 7800 },
  { id: 4, name: '节日促销海报', category: 'poster', categoryName: '海报', style: 'vibrant', thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop', isFeatured: true, usage_count: 12300 },
  { id: 5, name: '品牌Logo', category: 'logo', categoryName: 'Logo', style: 'luxury', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop', isFeatured: false, usage_count: 5600 },
  { id: 6, name: '淘宝详情页', category: 'ecommerce', categoryName: '电商', style: 'minimal', thumbnail: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop', isFeatured: true, usage_count: 9800 },
  { id: 7, name: 'ins风配图', category: 'social', categoryName: '社交媒体', style: 'minimal', thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop', isFeatured: false, usage_count: 6700 },
  { id: 8, name: '会员卡设计', category: 'poster', categoryName: '海报', style: 'luxury', thumbnail: 'https://images.unsplash.com/photo-1626785774625-0b1c2c4eabab?w=400&h=300&fit=crop', isFeatured: false, usage_count: 3400 },
];

// 默认分类
const defaultCategories = [
  { name: '全部', slug: 'all', count: defaultTemplates.length },
  { name: '社交媒体', slug: 'social', count: defaultTemplates.filter(t => t.category === 'social').length },
  { name: '视频封面', slug: 'video', count: defaultTemplates.filter(t => t.category === 'video').length },
  { name: '电商', slug: 'ecommerce', count: defaultTemplates.filter(t => t.category === 'ecommerce').length },
  { name: '海报', slug: 'poster', count: defaultTemplates.filter(t => t.category === 'poster').length },
  { name: '文档', slug: 'document', count: defaultTemplates.filter(t => t.category === 'document').length },
  { name: 'Logo', slug: 'logo', count: defaultTemplates.filter(t => t.category === 'logo').length },
];

// 默认风格
const defaultStyles = ['全部', '简约', '活力', '高端', '可爱', '科技'];

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStyle, setActiveStyle] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [categories, setCategories] = useState(defaultCategories);
  const [stats, setStats] = useState<TemplateStats>({ total: defaultTemplates.length, active: defaultTemplates.length, totalUses: 0 });
  const { collapsed } = useSidebar();

  // 获取模板列表
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        style: activeStyle === '全部' ? 'all' : activeStyle,
        search,
        page: '1',
        pageSize: '50',
      });

      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();

      if (data.success && data.data?.templates?.length > 0) {
        // 处理从 API 返回的数据
        const apiTemplates = data.data.templates.map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          categoryName: categoryLabels[t.category] || t.category,
          style: t.style,
          thumbnail: t.thumbnail || t.useCount?.toString(),
          isFeatured: t.isFeatured || t.is_featured || false,
          usage_count: t.usage_count || t.useCount || 0,
          created_at: t.created_at || t.createdAt,
        }));
        setTemplates(apiTemplates);
        
        // 更新分类统计
        if (data.data.categories) {
          const categoryList = [
            { name: '全部', slug: 'all', count: apiTemplates.length },
            ...data.data.categories.map((c: any) => ({
              name: c.name || categoryLabels[c.slug] || c.slug,
              slug: c.slug || c.name,
              count: apiTemplates.filter((t: Template) => t.category === (c.slug || c.name)).length,
            })),
          ];
          setCategories(categoryList);
        }

        // 更新统计
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      }
    } catch (error) {
      console.error('获取模板列表失败:', error);
      // 使用默认数据
      setTemplates(defaultTemplates);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeStyle, search]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 筛选模板
  const filteredTemplates = templates.filter(t => {
    const matchCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchStyle = activeStyle === '全部' || styleLabels[t.style] === activeStyle || t.style === activeStyle;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchStyle && matchSearch;
  });

  // 获取分类数量
  const getCategoryCount = (slug: string) => {
    if (slug === 'all') return templates.length;
    return templates.filter(t => t.category === slug).length;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="设计模板" subtitle={`${filteredTemplates.length} 个模板`} />
        
        <div className="p-8">
          {/* 搜索框 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索模板..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">{cat.count || getCategoryCount(cat.slug)}</span>
              </button>
            ))}
          </div>

          {/* 风格标签 */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-sm text-slate-500 mr-2">风格:</span>
            {defaultStyles.map((style) => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                  activeStyle === style
                    ? 'bg-orange-100 text-orange-600 font-medium'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* 模板列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无模板</h3>
              <p className="text-slate-500">换个筛选条件试试</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template, idx) => (
                <div
                  key={template.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    {template.isFeatured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        推荐
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium flex items-center gap-2 transition-opacity">
                        <Eye className="w-4 h-4" />
                        预览
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 bg-gradient-to-r ${styleColors[template.style] || 'from-slate-100 to-gray-100'} text-slate-600 text-xs font-medium rounded`}>
                        {styleLabels[template.style] || template.style}
                      </span>
                      <span className="text-xs text-slate-400">{template.categoryName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>使用 {template.usage_count?.toLocaleString() || 0} 次</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template, idx) => (
                <div
                  key={template.id}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className={`w-20 h-15 rounded-lg bg-gradient-to-br ${styleColors[template.style] || 'from-slate-100 to-gray-100'} flex items-center justify-center shrink-0 overflow-hidden`}>
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                        {template.name}
                      </h3>
                      {template.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className={`px-2 py-0.5 bg-gradient-to-r ${styleColors[template.style] || 'from-slate-100 to-gray-100'} text-slate-600 text-xs font-medium rounded`}>
                        {styleLabels[template.style] || template.style}
                      </span>
                      <span>{template.categoryName}</span>
                      <span>使用 {template.usage_count?.toLocaleString() || 0} 次</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    预览
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
