// 标准首页卡片组件 - Minimal Luxury 风格
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink } from 'lucide-react';
import SponsorBadge, { isSponsorActive } from './SponsorBadge';

interface ToolCardProps {
  tool: {
    id: number;
    name: string;
    logo: string;
    highlight: string;
    category_id: number;
    free_type: string;
    is_featured: boolean;
    sponsor_type: string | null;
    sponsor_expires_at: string | null;
    categories?: { name: string; slug: string };
  };
  onClick?: () => void;
  showCategory?: boolean;
  userId?: string;
}

export function ToolCard({ tool, onClick, showCategory = false, userId }: ToolCardProps) {
  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // 记录来源页面
    if (typeof window !== 'undefined') {
      const backState = { 
        path: window.location.pathname + window.location.search || '/',
        tab: 'tools'
      };
      sessionStorage.setItem('backFrom', JSON.stringify(backState));
    }
    
    // 异步记录浏览历史
    if (userId) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, tool_id: tool.id })
      }).catch(() => {});
    }
    
    // 在新标签页打开
    window.open(`/tools/${tool.id}`, '_blank');
  };

  return (
    <Card
      onClick={handleClick}
      className="group cursor-pointer bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 
                 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 
                 hover:-translate-y-0.5 transition-all duration-200"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-10 h-10 object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%2364748b" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="600">${tool.name[0]}</text></svg>`;
              }}
            />
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
                {tool.name}
              </h3>
              {isSponsorActive(tool.sponsor_type, tool.sponsor_expires_at) && (
                <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
              )}
              {tool.is_featured && !tool.sponsor_type && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{tool.highlight}</p>
            {showCategory && tool.categories && (
              <Badge variant="secondary" className="mt-1.5 text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-700">
                {tool.categories.name}
              </Badge>
            )}
          </div>

          {/* 外部链接图标 */}
          <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ToolCard;
