'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// 工具卡片骨架屏
export const ToolCardSkeleton = memo(function ToolCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 图标骨架 */}
          <div className="w-14 h-14 rounded-xl skeleton" />
          
          <div className="flex-1 min-w-0">
            {/* 标题骨架 */}
            <div className="h-5 w-32 rounded skeleton mb-2" />
            {/* 描述骨架 */}
            <div className="h-4 w-full rounded skeleton mb-1" />
            <div className="h-4 w-2/3 rounded skeleton" />
          </div>
        </div>
        
        {/* 标签骨架 */}
        <div className="flex gap-1.5 mt-3">
          <div className="h-5 w-14 rounded-full skeleton" />
          <div className="h-5 w-16 rounded-full skeleton" />
        </div>
      </CardContent>
    </Card>
  );
});

// 技能卡片骨架屏
export const SkillCardSkeleton = memo(function SkillCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* 图标骨架 */}
          <div className="w-12 h-12 rounded-xl skeleton" />
          
          <div className="flex-1 min-w-0">
            {/* 标题骨架 */}
            <div className="h-5 w-28 rounded skeleton mb-1" />
            {/* 描述骨架 */}
            <div className="h-4 w-full rounded skeleton mb-1" />
            <div className="h-4 w-3/4 rounded skeleton" />
          </div>
        </div>
        
        {/* 元数据骨架 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="h-4 w-20 rounded skeleton" />
          <div className="h-4 w-16 rounded skeleton" />
        </div>
      </CardContent>
    </Card>
  );
});

// 提示词卡片骨架屏
export const PromptCardSkeleton = memo(function PromptCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 图标骨架 */}
          <div className="w-14 h-14 rounded-xl skeleton" />
          
          <div className="flex-1 min-w-0">
            {/* 标题骨架 */}
            <div className="h-5 w-36 rounded skeleton mb-2" />
            {/* 描述骨架 */}
            <div className="h-4 w-full rounded skeleton mb-1" />
            <div className="h-4 w-4/5 rounded skeleton" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// 骨架屏列表组件
interface SkeletonGridProps {
  count?: number;
  type?: 'tool' | 'skill' | 'prompt';
}

export const SkeletonGrid = memo(function SkeletonGrid({ 
  count = 6, 
  type = 'tool' 
}: SkeletonGridProps) {
  const SkeletonComponent = {
    tool: ToolCardSkeleton,
    skill: SkillCardSkeleton,
    prompt: PromptCardSkeleton,
  }[type];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
});

export default SkeletonGrid;
