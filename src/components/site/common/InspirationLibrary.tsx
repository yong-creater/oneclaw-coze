'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Star, ChevronRight } from 'lucide-react';
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
  /** 是否为左侧面板紧凑模式 */
  compact?: boolean;
}

export default function InspirationLibrary({ currentTool, onUseInspiration, compact = false }: InspirationLibraryProps) {
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

  // 紧凑模式：左侧面板卡片
  if (compact) {
    return (
      <div className="os-insp-compact">
        {/* 标题 */}
        <div className="os-insp-compact-header">
          <div className="os-insp-compact-title-row">
            <Sparkles className="os-insp-compact-icon" />
            <span className="os-insp-compact-title">灵感参考</span>
            <span className="os-insp-compact-count">{items.length}</span>
          </div>
        </div>

        {/* 筛选栏：横向滚动 */}
        <div className="os-insp-compact-filters">
          {categories.map(cat => (
            <button
              key={cat.label}
              className={`os-insp-compact-filter ${activeCategory === cat.label ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.label)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 灵感卡片：竖向列表 */}
        <div className="os-insp-compact-list">
          {items.slice(0, 6).map(item => (
            <CompactInspirationCard
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

  // 完整模式（暂不使用，保留以防未来需要）
  return (
    <div className="os-insp">
      <div className="os-insp-header">
        <div className="os-insp-title-row">
          <div className="os-insp-title-left">
            <Sparkles className="os-insp-title-icon" />
            <h3 className="os-insp-title">灵感参考</h3>
            <span className="os-insp-count">{items.length}</span>
          </div>
        </div>
      </div>
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
      <div className="os-insp-grid">
        {items.map(item => (
          <div key={item.id} className="os-insp-card" onClick={() => onUseInspiration(item)}>
            <div className="os-insp-card-img-wrap">
              <img src={item.image} alt={item.title} className="os-insp-card-img" loading="lazy" />
              <span className="os-insp-card-badge">{item.categoryLabel}</span>
              <button
                className={`os-insp-card-star ${favorites.has(item.id) ? 'favorited' : ''}`}
                onClick={e => toggleFavorite(item.id, e)}
              >
                <Star fill={favorites.has(item.id) ? '#FFD700' : 'none'} stroke={favorites.has(item.id) ? '#FFD700' : '#fff'} />
              </button>
            </div>
            <div className="os-insp-card-body">
              <h4 className="os-insp-card-title">{item.title}</h4>
              <p className="os-insp-card-desc">{item.desc}</p>
              <div className="os-insp-card-tags">
                {item.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="os-insp-card-tag">#{tag}</span>
                ))}
              </div>
              <button className="os-insp-card-cta" onClick={e => { e.stopPropagation(); onUseInspiration(item); }}>
                <Sparkles /> 生成同款
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 紧凑灵感卡片（左侧面板用） =====
interface CompactCardProps {
  item: InspirationItem;
  isFavorite: boolean;
  onFavorite: (id: string, e: React.MouseEvent) => void;
  onUse: (item: InspirationItem) => void;
}

function CompactInspirationCard({ item, isFavorite, onFavorite, onUse }: CompactCardProps) {
  return (
    <div className="os-insp-compact-card" onClick={() => onUse(item)}>
      {/* 缩略图 */}
      <div className="os-insp-compact-card-img">
        <img src={item.image} alt={item.title} loading="lazy" />
        <span className="os-insp-compact-card-badge">{item.categoryLabel}</span>
        <button
          className={`os-insp-compact-card-star ${isFavorite ? 'favorited' : ''}`}
          onClick={e => onFavorite(item.id, e)}
        >
          <Star fill={isFavorite ? '#FFD700' : 'none'} stroke={isFavorite ? '#FFD700' : 'rgba(255,255,255,0.8)'} />
        </button>
      </div>

      {/* 信息 */}
      <div className="os-insp-compact-card-body">
        <div className="os-insp-compact-card-info">
          <h4 className="os-insp-compact-card-title">{item.title}</h4>
          <p className="os-insp-compact-card-desc">{item.desc}</p>
        </div>
        <button className="os-insp-compact-card-cta" onClick={e => { e.stopPropagation(); onUse(item); }}>
          <Sparkles />
          <ChevronRight />
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
