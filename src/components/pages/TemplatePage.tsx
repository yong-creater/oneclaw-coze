'use client';

import { useState, useEffect } from 'react';
import { LayoutTemplate, Search, ArrowRight, Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import { useMenu } from '@/components/common/MenuProvider';

// ========== 模板类型映射 ==========
const TEMPLATE_TYPE_MAP: Record<string, { label: string; color: string; icon: string }> = {
  xhs_post: { label: '小红书', color: 'bg-red-50 text-red-600', icon: '📕' },
  goods_poster: { label: '商品海报', color: 'bg-orange-50 text-orange-600', icon: '🎨' },
  portrait: { label: 'AI写真', color: 'bg-pink-50 text-pink-600', icon: '📸' },
  cover: { label: '封面设计', color: 'bg-blue-50 text-blue-600', icon: '🖼️' },
  background_removal: { label: '智能抠图', color: 'bg-cyan-50 text-cyan-600', icon: '✂️' },
  resume: { label: '简历优化', color: 'bg-amber-50 text-amber-600', icon: '📄' },
  novel: { label: '小说创作', color: 'bg-violet-50 text-violet-600', icon: '✍️' },
  script: { label: '视频脚本', color: 'bg-emerald-50 text-emerald-600', icon: '🎬' },
};

// ========== 分类筛选列表 ==========
const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'xhs_post', label: '小红书' },
  { id: 'goods_poster', label: '商品海报' },
  { id: 'portrait', label: 'AI写真' },
  { id: 'cover', label: '封面设计' },
  { id: 'background_removal', label: '智能抠图' },
  { id: 'resume', label: '简历优化' },
  { id: 'novel', label: '小说创作' },
  { id: 'script', label: '视频脚本' },
];

// ========== 模板数据类型 ==========
interface Template {
  id: number;
  name: string;
  description: string;
  template_type: string;
  category: string;
  thumbnail: string;
  tags: string[];
  usage_count: number;
  is_featured: boolean;
}

export default function TemplatePage() {
  const { setCurrentMenu, setPendingInput } = useMenu();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 从 API 获取模板数据
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // 筛选逻辑
  const filtered = templates.filter((tpl) => {
    const matchCategory = activeCategory === 'all' || tpl.template_type === activeCategory;
    const matchSearch =
      !searchQuery ||
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // 使用模板 → 跳转首页 + 填充输入
  const handleUseTemplate = (tpl: Template) => {
    const typeInfo = TEMPLATE_TYPE_MAP[tpl.template_type];
    const inputText = `使用「${tpl.name}」模板 - ${tpl.description}`;
    setPendingInput(inputText);
    setCurrentMenu('home');
  };

  return (
    <div className="py-8 px-6">
      {/* 标题 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          模板中心
        </h2>
        <p className="text-sm text-slate-500">选择模板，快速生成专业内容</p>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500 focus:outline-none focus:border-orange-500 transition-colors text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 加载态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="ml-2 text-slate-400 text-sm">加载模板中...</span>
        </div>
      )}

      {/* 模板卡片网格 */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tpl) => {
            const typeInfo = TEMPLATE_TYPE_MAP[tpl.template_type] || {
              label: tpl.template_type,
              color: 'bg-slate-50 text-slate-600',
              icon: '📋',
            };
            return (
              <div
                key={tpl.id}
                className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-lg transition-all duration-200 group"
              >
                {/* 图片占位区 */}
                <div className="relative h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {tpl.thumbnail ? (
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">暂无预览</span>
                    </div>
                  )}
                  {/* 分类标签 */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium ${typeInfo.color}`}
                  >
                    {typeInfo.icon} {tpl.category || typeInfo.label}
                  </span>
                  {/* 推荐标记 */}
                  {tpl.is_featured && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white rounded-md text-xs font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      推荐
                    </span>
                  )}
                </div>

                {/* 内容区 */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-1">
                    {tpl.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {tpl.description}
                  </p>

                  {/* 标签 */}
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tpl.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 使用按钮 */}
                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    使用模板
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <LayoutTemplate className="w-12 h-12 mb-3" />
          <p className="text-sm">暂无匹配的模板</p>
        </div>
      )}
    </div>
  );
}
