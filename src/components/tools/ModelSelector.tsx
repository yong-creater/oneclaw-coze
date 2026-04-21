'use client';

import { useState } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

// 品牌配置
const PROVIDER_CONFIG: Record<string, { color: string }> = {
  '豆包': { color: 'bg-emerald-500' },
  'DeepSeek': { color: 'bg-violet-500' },
  'Kimi': { color: 'bg-amber-500' },
  'GLM': { color: 'bg-blue-500' },
  'Qwen': { color: 'bg-orange-500' },
  'GPT (4sAPI)': { color: 'bg-green-500' },
  'Claude (4sAPI)': { color: 'bg-amber-600' },
  'Gemini (4sAPI)': { color: 'bg-blue-400' },
};

// 模型选择器组件 - 简洁分组列表形式
interface ModelSelectorProps {
  groups: ModelGroup[];
  value: string;
  onChange: (model: string) => void;
  triggerClassName?: string;
}

export function ModelSelector({ groups, value, onChange, triggerClassName = '' }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // 找到当前选中的模型
  let selectedModel: Model | null = null;
  let selectedProvider = '';
  for (const group of groups) {
    const found = group.models.find(m => m.value === value);
    if (found) {
      selectedModel = found;
      selectedProvider = group.provider;
      break;
    }
  }
  
  const providerConfig = PROVIDER_CONFIG[selectedProvider] || { color: 'bg-slate-500' };

  return (
    <div>
      {/* 触发按钮 - 简洁样式 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700 rounded-lg 
                   hover:border-slate-300 dark:hover:border-slate-600 
                   focus:outline-none focus:border-orange-500 transition-colors ${triggerClassName}`}
      >
        {/* 品牌图标 */}
        <div className={`w-5 h-5 ${providerConfig.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
          {selectedProvider.charAt(0)}
        </div>
        
        {/* 模型名称 */}
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {selectedModel?.label || '选择模型'}
        </span>
        
        {/* 提供商 */}
        <span className="text-xs text-slate-500">
          {selectedProvider}
        </span>
        
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {/* 选择弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[70vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-medium">
              <Sparkles className="w-4 h-4 text-orange-500" />
              选择模型
            </DialogTitle>
          </DialogHeader>

          {/* 模型列表 - 按提供商分组 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {groups.map(group => {
              const config = PROVIDER_CONFIG[group.provider] || { color: 'bg-slate-500' };
              const isPaid = group.provider.includes('4sAPI');
              
              return (
                <div key={group.provider} className="space-y-1">
                  {/* 分组标题 */}
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <div className={`w-5 h-5 ${config.color} rounded flex items-center justify-center text-white text-xs`}>
                      {group.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {group.provider}
                    </span>
                    {isPaid && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                        付费
                      </span>
                    )}
                  </div>
                  
                  {/* 模型选项 */}
                  {group.models.map(model => {
                    const isSelected = model.value === value;
                    
                    return (
                      <button
                        key={model.value}
                        type="button"
                        onClick={() => {
                          onChange(model.value);
                          setOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-700'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* 模型名称 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                              {model.label}
                            </span>
                            {model.recommended && !isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 rounded">
                                推荐
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* 区域标签 */}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isPaid 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {model.region}
                        </span>
                        
                        {/* 选中标识 */}
                        {isSelected && (
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ModelSelector;
