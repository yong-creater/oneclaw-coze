'use client';

import { useState } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  UNIFIED_MODEL_GROUPS, 
  UNIFIED_MODEL_OPTIONS, 
  DEFAULT_MODEL_ID,
  getModelById 
} from '@/lib/models';

// 模型选择器组件 - 统一样式（无图标 + 分组）
interface ModelPickerProps {
  value: string;
  onChange: (modelId: string) => void;
  triggerClassName?: string;
}

export default function ModelPicker({ value, onChange, triggerClassName = '' }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = getModelById(value) || UNIFIED_MODEL_OPTIONS[0];

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
        {/* 模型名称 */}
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {selectedModel.name}
        </span>
        
        {/* 提供商 */}
        <span className="text-xs text-slate-500">
          {selectedModel.provider}
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

          {/* 模型列表 - 按提供商分组，无图标 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {UNIFIED_MODEL_GROUPS.map(group => {
              const isPaid = group.provider.includes('4sAPI');
              
              return (
                <div key={group.provider} className="space-y-1">
                  {/* 分组标题 */}
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-700'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* 模型名称和推荐标签 */}
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isSelected ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                            {model.label}
                          </span>
                          {model.recommended && !isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                              推荐
                            </span>
                          )}
                        </div>
                        
                        {/* 区域/价格标签 */}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isPaid 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {model.region}
                        </span>
                        
                        {/* 选中标识 */}
                        {isSelected && (
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0 ml-2" />
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

// 导出索引
export { UNIFIED_MODEL_GROUPS, UNIFIED_MODEL_OPTIONS, DEFAULT_MODEL_ID } from '@/lib/models';
