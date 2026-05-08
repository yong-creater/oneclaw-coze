'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
const CATEGORY_MAP: Record<string, { label: string; gradient: string }> = {
  all: { label: '全部', gradient: '' },
  xhs_post: { label: '小红书', gradient: 'from-[#7B61FF] to-[#FFB84D]' },
  goods_poster: { label: '商品海报', gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
  portrait: { label: 'AI写真', gradient: 'from-[#7B61FF] to-[#A78BFA]' },
  cover: { label: '封面设计', gradient: 'from-[#5B8CFF] to-[#6EE7FF]' },
  background_removal: { label: '智能抠图', gradient: 'from-[#5B8CFF] to-[#7B61FF]' },
  resume: { label: '简历优化', gradient: 'from-[#7B61FF] to-[#6EE7FF]' },
  novel: { label: '小说创作', gradient: 'from-[#A78BFA] to-[#7B61FF]' },
  script: { label: '视频脚本', gradient: 'from-[#5B8CFF] to-[#7B61FF]' },
};

export default function TemplatePage() {
  const { setPendingInput } = useMenu();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // 获取模板数据
  useEffect(() => {
    fetch('/api/templates', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 分类筛选 + 搜索
  const filtered = (templates || []).filter((t) => {
    const matchCategory = activeCategory === 'all' || t.template_type === activeCategory;
    const matchSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // 使用模板
  const handleUseTemplate = (tpl: Template) => {
    setPendingInput(`使用模板「${tpl.name}」生成内容`);
    router.push('/');
  };

  return (
    <div className="os-page">
      {/* 标题区 */}
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="os-h1">模板</h1>
        <p className="os-section-desc">选择模板，快速开始创作</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-5 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索模板..."
          className="os-search-input"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        {Object.entries(CATEGORY_MAP).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`os-btn-capsule ${activeCategory === key ? 'os-btn-capsule-active' : ''}`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7B61FF] rounded-full animate-spin mb-3" />
          <p className="text-sm">加载中...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((tpl, index) => {
            const catConfig = CATEGORY_MAP[tpl.template_type] || { label: tpl.template_type, gradient: 'from-slate-400 to-slate-500' };
            return (
              <div
                key={tpl.id}
                className="os-card p-0 overflow-hidden flex flex-col animate-stagger-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* 图片区域 */}
                <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center">
                  {tpl.thumbnail ? (
                    <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center opacity-30`}>
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {/* 推荐标记 */}
                  {tpl.is_featured && (
                    <div className="absolute top-2.5 right-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#FFB84D] flex items-center justify-center">
                        <Star className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>
                  )}
                  {/* 分类标签 */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="os-btn-capsule !h-5 !text-[10px] !px-2 !font-semibold pointer-events-none bg-black/40 !text-white">
                      {catConfig.label}
                    </span>
                  </div>
                </div>
                {/* 文字区 */}
                <div className="p-6 flex-1 flex flex-col gap-2">
                  <h3 className="os-h3 truncate">{tpl.name}</h3>
                  <p className="os-caption line-clamp-2 flex-1">
                    {tpl.description || '暂无描述'}
                  </p>
                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="os-btn-primary w-full justify-center text-xs py-2.5"
                  >
                    使用模板
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">未找到匹配的模板</p>
        </div>
      )}
    </div>
  );
}
