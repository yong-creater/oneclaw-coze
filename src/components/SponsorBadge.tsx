'use client';

import { Badge } from '@/components/ui/badge';
import { Crown, Gem, Star } from 'lucide-react';

// 赞助商等级配置
export const SPONSOR_CONFIG = {
  diamond: {
    label: '钻石推广',
    icon: Crown,
    className: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white animate-pulse',
    priority: 3,
  },
  premium: {
    label: '高级推广',
    icon: Gem,
    className: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    priority: 2,
  },
  basic: {
    label: '基础推广',
    icon: Star,
    className: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
    priority: 1,
  },
} as const;

type SponsorType = keyof typeof SPONSOR_CONFIG;

interface SponsorBadgeProps {
  sponsorType: SponsorType | null | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

// 检查赞助商是否有效（未过期）
export function isSponsorActive(
  sponsorType: SponsorType | null | string,
  expiresAt: string | null
): boolean {
  if (!sponsorType || !expiresAt) return false;
  if (!(sponsorType in SPONSOR_CONFIG)) return false;
  return new Date(expiresAt) > new Date();
}

// 赞助商标识组件
export function SponsorBadge({ 
  sponsorType, 
  size = 'sm',
  showLabel = false 
}: SponsorBadgeProps) {
  if (!sponsorType || !(sponsorType in SPONSOR_CONFIG)) return null;

  const config = SPONSOR_CONFIG[sponsorType as SponsorType];
  const Icon = config.icon;

  return (
    <Badge 
      className={`${config.className} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'} gap-0.5 font-medium`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {showLabel && <span className="ml-0.5">{config.label}</span>}
    </Badge>
  );
}

// 获取赞助商排序优先级
export function getSponsorPriority(sponsorType: SponsorType | null | string): number {
  if (!sponsorType || !(sponsorType in SPONSOR_CONFIG)) return 0;
  return SPONSOR_CONFIG[sponsorType as SponsorType].priority;
}

export default SponsorBadge;
