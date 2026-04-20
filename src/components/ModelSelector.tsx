'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Search } from 'lucide-react';

// 模型分组接口
export interface ModelGroup {
  provider: string;
  icon: string;
  models: Model[];
}

// 模型接口
export interface Model {
  value: string;
  label: string;
  region?: string;
  recommended?: boolean;
}

// 模型选择器组件
interface ModelSelectorProps {
  groups: ModelGroup[];
  value: string;
  onChange: (model: string) => void;
  triggerClassName?: string;
}

export function ModelSelector({ groups, value, onChange, triggerClassName = '' }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(groups[0]?.provider || '');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取当前选中的模型
  const selectedModel = groups
    .flatMap(g => g.models)
    .find(m => m.value === value);

  // 获取当前分组的模型
  const currentModels = groups.find(g => g.provider === activeTab)?.models || [];

  // 过滤模型
  const filteredModels = searchQuery
    ? groups.flatMap(g => g.models.map(m => ({ ...m, provider: g.provider }))).filter(m => 
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentModels;

  // 关闭弹窗
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开弹窗时聚焦搜索框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 选择模型
  const handleSelect = (modelValue: string) => {
    onChange(modelValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      const allModels = groups.flatMap(g => g.models);
      const currentIndex = allModels.findIndex(m => m.value === value);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, allModels.length - 1);
        onChange(allModels[nextIndex].value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        onChange(allModels[prevIndex].value);
      } else if (e.key === 'Enter') {
        setIsOpen(false);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, value, groups, onChange]);

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 
                   border-2 border-slate-200 dark:border-slate-700 rounded-xl
                   hover:border-orange-400 dark:hover:border-orange-500 
                   focus:outline-none focus:border-orange-500 transition-colors
                   ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 flex-1">
          {/* 显示图标 */}
          {selectedModel && (
            <span className="text-base">
              {groups.find(g => g.models.some(m => m.value === selectedModel.value))?.icon || '🤖'}
            </span>
          )}
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {selectedModel?.label || '选择模型'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 弹窗 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 
                      border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50
                      overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 搜索框 */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="搜索模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 
                         border border-slate-200 dark:border-slate-700 rounded-lg
                         text-sm text-slate-800 dark:text-slate-200
                         placeholder:text-slate-400
                         focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* 标签页 */}
          {!searchQuery && (
            <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-700">
              {groups.map(group => (
                <button
                  key={group.provider}
                  onClick={() => setActiveTab(group.provider)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap
                            border-b-2 transition-colors
                            ${activeTab === group.provider
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'
                              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                >
                  <span>{group.icon}</span>
                  <span>{group.provider}</span>
                </button>
              ))}
            </div>
          )}

          {/* 模型网格 */}
          <div className="p-2 max-h-72 overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                未找到匹配的模型
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {filteredModels.map(model => (
                  <button
                    key={model.value}
                    onClick={() => handleSelect(model.value)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-left
                              transition-colors
                              ${model.value === value
                                ? 'bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-500'
                                : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {model.label}
                        </span>
                        {model.recommended && (
                          <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      {model.region && (
                        <span className={`text-[10px] ${model.region === '免费' ? 'text-green-600' : 'text-amber-600'}`}>
                          {model.region}
                        </span>
                      )}
                    </div>
                    {model.value === value && (
                      <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-[10px] text-slate-400">
              使用 ↑↓ 键导航，Enter 确认，Esc 关闭
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
