'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowRight, Star, Tag } from 'lucide-react';
import { useMenu } from '@/components/common/MenuProvider';

// ========== 类型定义 ==========
interface Template {
  id: number;
  name: string;
  template_type: string;
  category: string;
  description: string;
  tags: string[];
  thumbnail: string;
  is_featured: boolean;
  is_active: boolean;
  usage_count: number;
}

// ========== 分类映射 ==========
const CATEGORY_MAP: Record<string, string> = {
  all: '全部',
  xhs_post: '小红书',
  goods_poster: '商品海报',
  portrait: 'AI写真',
  cover: '封面设计',
  background_removal: '智能抠图',
  resume: '简历优化',
  novel: '小说创作',
  script: '视频脚本',
};

export default function TemplatePage() {
  const { setCurrentMenu, setPendingInput } = useMenu();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // 获取模板数据
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTemplates(data.templates || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // 分类筛选 + 搜索
  const filtered = templates.filter((t) => {
    const matchCategory = activeCategory === 'all' || t.template_type === activeCategory;
    const matchSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // 使用模板 → 跳转首页填充
  const handleUseTemplate = (tpl: Template) => {
    setPendingInput(`使用模板「${tpl.name}」生成内容`);
    setCurrentMenu('home');
  };

  return (
    <div className="ui-page">
      {/* 标题区 */}
      <div className="ui-page-header">
        <h1 className="ui-page-title">模板</h1>
        <p className="ui-page-desc">选择模板，快速开始创作</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索模板..."
          className="ui-input pl-10"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(CATEGORY_MAP).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
              activeCategory === key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          加载中...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <div key={tpl.id} className="ui-card p-0 overflow-hidden flex flex-col group">
              {/* 图片占位 */}
              <div className="aspect-[16/10] bg-slate-100 relative flex items-center justify-center">
                {tpl.thumbnail ? (
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-300">
                    <Tag className="w-8 h-8" />
                  </div>
                )}
                {/* 推荐标记 */}
                {tpl.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                )}
                {/* 分类标签 */}
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-0.5 bg-white/90 rounded-[6px] text-[10px] font-medium text-slate-600">
                    {CATEGORY_MAP[tpl.template_type] || tpl.template_type}
                  </span>
                </div>
              </div>
              {/* 文字区 */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-slate-900 truncate">{tpl.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 flex-1">
                  {tpl.description || '暂无描述'}
                </p>
                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="ui-btn-secondary w-full justify-center"
                >
                  <ArrowRight className="w-3 h-3" />
                  使用模板
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Search className="w-8 h-8 mb-2" />
          <p className="text-sm">未找到匹配的模板</p>
        </div>
      )}
    </div>
  );
}
