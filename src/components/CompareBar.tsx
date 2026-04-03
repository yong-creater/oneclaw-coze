'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight, Crown } from 'lucide-react';
import Link from 'next/link';

// 对比工具类型
export interface CompareTool {
  id: number;
  name: string;
  logo: string;
  category_id: number;
  category_name: string;
}

// 对比栏状态管理
const COMPARE_KEY = 'oneclaw_compare_tools';
const MAX_COMPARE = 3;

// 获取已选工具
export function getCompareTools(): CompareTool[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(COMPARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存已选工具
export function saveCompareTools(tools: CompareTool[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPARE_KEY, JSON.stringify(tools));
  // 触发自定义事件通知其他组件
  window.dispatchEvent(new CustomEvent('compareToolsChanged'));
}

// 清空对比
export function clearCompareTools(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COMPARE_KEY);
  window.dispatchEvent(new CustomEvent('compareToolsChanged'));
}

// 对比栏组件
export default function CompareBar() {
  const router = useRouter();
  const [tools, setTools] = useState<CompareTool[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 加载已选工具
  useEffect(() => {
    const loadTools = () => {
      const saved = getCompareTools();
      setTools(saved);
      setIsOpen(saved.length > 0);
    };

    loadTools();

    // 监听变化
    window.addEventListener('compareToolsChanged', loadTools);
    return () => window.removeEventListener('compareToolsChanged', loadTools);
  }, []);

  // 移除工具
  const removeTool = (toolId: number) => {
    const newTools = tools.filter(t => t.id !== toolId);
    saveCompareTools(newTools);
  };

  // 清空
  const clearAll = () => {
    clearCompareTools();
  };

  // 开始对比
  const startCompare = () => {
    if (tools.length >= 2) {
      const ids = tools.map(t => t.id).join(',');
      router.push(`/compare?ids=${ids}`);
    }
  };

  if (!isOpen || tools.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 已选工具 */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
              对比栏 ({tools.length}/{MAX_COMPARE})
            </span>
            <div className="flex items-center gap-2">
              {tools.map(tool => (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-5 h-5 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect fill="%23f97316" width="20" height="20"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${tool.name[0]}</text></svg>`;
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {tool.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTool(tool.id);
                    }}
                    className="p-0.5 hover:bg-orange-200 dark:hover:bg-orange-800 rounded"
                  >
                    <X className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-slate-500 dark:text-slate-400"
            >
              清空
            </Button>
            <Button
              size="sm"
              onClick={startCompare}
              disabled={tools.length < 2}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              开始对比
            </Button>
          </div>
        </div>

        {/* 提示 */}
        {tools.length === 1 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 再选择 1 款工具即可开始对比
          </p>
        )}
        {tools.length >= 2 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 
            <Link href="/membership" className="text-orange-500 hover:text-orange-600 ml-1">
              <Crown className="w-3 h-3 inline mr-1" />
              会员可对比 3 款工具
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
