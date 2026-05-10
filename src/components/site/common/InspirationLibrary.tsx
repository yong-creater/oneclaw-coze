'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Star, Eye, Heart, ChevronRight } from 'lucide-react';
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
    <div className="os-insp-panel">
      {/* 标题行 */}
      <div className="os-insp-panel-header">
        <div className="os-insp-panel-title-row">
          <Sparkles className="os-insp-panel-icon" />
          <span className="os-insp-panel-title">灵感参考</span>
          <span className="os-insp-panel-count">{items.length}</span>
        </div>
      </div>

      {/* 筛选栏：横向滚动标签 */}
      <div className="os-insp-panel-filters">
        {categories.map(cat => (
          <button
            key={cat.label}
            className={`os-insp-panel-filter ${activeCategory === cat.label ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.label)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 灵感卡片列表 */}
      <div className="os-insp-panel-cards">
        {items.slice(0, 8).map(item => (
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

// ===== 灵感卡片 =====
interface CardProps {
  item: InspirationItem;
  isFavorite: boolean;
  onFavorite: (id: string, e: React.MouseEvent) => void;
  onUse: (item: InspirationItem) => void;
}

function InspirationCard({ item, isFavorite, onFavorite, onUse }: CardProps) {
  return (
    <div className="os-insp-panel-card" onClick={() => onUse(item)}>
      {/* 图片区域 */}
      <div className="os-insp-panel-card-img">
        <img src={item.image} alt={item.title} loading="lazy" />
        {/* 类型标签 */}
        <span className="os-insp-panel-card-badge">{item.categoryLabel}</span>
        {/* 收藏按钮 */}
        <button
          className={`os-insp-panel-card-star ${isFavorite ? 'favorited' : ''}`}
          onClick={e => onFavorite(item.id, e)}
        >
          <Star fill={isFavorite ? '#FFD700' : 'none'} stroke={isFavorite ? '#FFD700' : '#fff'} strokeWidth={1.5} />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="os-insp-panel-card-body">
        <h4 className="os-insp-panel-card-title">{item.title}</h4>
        <p className="os-insp-panel-card-desc">{item.desc}</p>

        {/* 标签 */}
        <div className="os-insp-panel-card-tags">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="os-insp-panel-card-tag">#{tag}</span>
          ))}
        </div>

        {/* 统计 + 操作 */}
        <div className="os-insp-panel-card-footer">
          <div className="os-insp-panel-card-stats">
            <span className="os-insp-panel-card-stat">
              <Eye strokeWidth={1.5} /> {item.views || 0}
            </span>
            <span className="os-insp-panel-card-stat">
              <Heart strokeWidth={1.5} /> {item.likes || 0}
            </span>
          </div>
          <button className="os-insp-panel-card-cta" onClick={e => { e.stopPropagation(); onUse(item); }}>
            <Sparkles strokeWidth={1.5} />
            <span>生成同款</span>
            <ChevronRight strokeWidth={1.5} />
          </button>
        </div>
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
