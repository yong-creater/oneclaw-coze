'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Star, Eye, Heart } from 'lucide-react';
import {
  getInspirations,
  getInspirationCategories,
  type InspirationItem,
} from '@/lib/tool-workflow-config';

interface InspirationLibraryProps {
  /** 当前选中的工具 slug，用于默认筛选 */
  currentTool?: string;
  /** 点击灵感卡片，填充参数并可选触发生成 */
  onUseInspiration: (item: InspirationItem) => void;
}

export default function InspirationLibrary({ currentTool, onUseInspiration }: InspirationLibraryProps) {
  const categories = getInspirationCategories();
  const [activeCategory, setActiveCategory] = useState(currentTool ? getCategoryByTool(currentTool) : '全部');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 按分类筛选灵感
  const items = activeCategory === '全部'
    ? getInspirations()
    : getInspirations().filter(i => i.categoryLabel === activeCategory);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="os-insp">
      {/* 标题栏 */}
      <div className="os-insp-header">
        <div className="os-insp-title-row">
          <div className="os-insp-title-left">
            <Sparkles className="os-insp-title-icon" />
            <h3 className="os-insp-title">灵感参考</h3>
            <span className="os-insp-count">{items.length}</span>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="os-insp-filters">
        {categories.map(cat => (
          <button
            key={cat.label}
            className={`os-insp-filter-btn ${activeCategory === cat.label ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.label)}
          >
            {cat.label}
            <span className="os-insp-filter-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* 灵感卡片区 */}
      <div className="os-insp-grid">
        {items.map(item => (
          <InspirationCard
            key={item.id}
            item={item}
            isFavorite={favorites.has(item.id)}
            onFavorite={toggleFavorite}
            onUse={onUseInspiration}
          />
        ))}
      </div>
    </div>
  );
}

// ===== 单张灵感卡片 =====
interface CardProps {
  item: InspirationItem;
  isFavorite: boolean;
  onFavorite: (id: string, e: React.MouseEvent) => void;
  onUse: (item: InspirationItem) => void;
}

function InspirationCard({ item, isFavorite, onFavorite, onUse }: CardProps) {
  return (
    <div className="os-insp-card" onClick={() => onUse(item)}>
      {/* 图片区 */}
      <div className="os-insp-card-img-wrap">
        <img src={item.image} alt={item.title} className="os-insp-card-img" loading="lazy" />
        {/* 分类标签 */}
        <span className="os-insp-card-badge">{item.categoryLabel}</span>
        {/* 收藏 */}
        <button
          className={`os-insp-card-star ${isFavorite ? 'favorited' : ''}`}
          onClick={e => onFavorite(item.id, e)}
        >
          <Star fill={isFavorite ? '#FFD700' : 'none'} stroke={isFavorite ? '#FFD700' : '#fff'} />
        </button>
      </div>

      {/* 信息区 */}
      <div className="os-insp-card-body">
        <h4 className="os-insp-card-title">{item.title}</h4>
        <p className="os-insp-card-desc">{item.desc}</p>

        {/* 标签 */}
        <div className="os-insp-card-tags">
          {item.tags.map(tag => (
            <span key={tag} className="os-insp-card-tag">#{tag}</span>
          ))}
        </div>

        {/* 互动指标 */}
        <div className="os-insp-card-meta">
          <span className="os-insp-card-stat"><Eye /> {Math.floor(Math.random() * 500 + 100)}</span>
          <span className="os-insp-card-stat"><Heart /> {Math.floor(Math.random() * 80 + 10)}</span>
        </div>

        {/* 生成同款按钮 */}
        <button className="os-insp-card-cta" onClick={e => { e.stopPropagation(); onUse(item); }}>
          <Sparkles /> 生成同款
        </button>
      </div>
    </div>
  );
}

// ===== 工具 slug → 分类标签 =====
function getCategoryByTool(slug: string): string {
  const map: Record<string, string> = {
    'product-generator': '商品图',
    'xiaohongshu-generator': '小红书',
    'ai-photo': 'AI写真',
    'poster-design': '海报',
    'background-removal': '抠图',
    'product-page': '详情页',
  };
  return map[slug] || '全部';
}
