'use client';

import { useState } from 'react';
import { ChevronDown, Check, Sparkles, Bot, Zap, Moon, BarChart3, Mountain, Cpu, Brain } from 'lucide-react';
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
  getModelById,
  MODEL_PROVIDER_CONFIG
} from '@/lib/models';

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Bot': Bot,
  'Zap': Zap,
  'Moon': Moon,
  'BarChart3': BarChart3,
  'Mountain': Mountain,
  'Cpu': Cpu,
  'Brain': Brain,
  'Sparkles': Sparkles,
};

// 模型选择器组件 - 清晰分组样式
interface ModelPickerProps {
  value: string;
  onChange: (modelId: string) => void;
  triggerClassName?: string;
}

export default function ModelPicker({ value, onChange, triggerClassName = '' }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = getModelById(value) || UNIFIED_MODEL_OPTIONS[0];
  const selectedConfig = MODEL_PROVIDER_CONFIG[selectedModel.provider] || { icon: 'Bot', color: 'bg-slate-500' };
  const SelectedIcon = ICON_MAP[selectedConfig.icon] || Bot;

  return (
    <div>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700 rounded-lg 
                   hover:border-slate-300 dark:hover:border-slate-600 
                   focus:outline-none focus:border-orange-500 transition-colors ${triggerClassName}`}
      >
        <div className={`w-5 h-5 ${selectedConfig.color} rounded flex items-center justify-center`}>
          <SelectedIcon className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {selectedModel.name}
        </span>
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

          {/* 模型列表 - 清晰分组 */}
          <div className="flex-1 overflow-y-auto py-2">
            {UNIFIED_MODEL_GROUPS.map((group, groupIndex) => {
              const config = MODEL_PROVIDER_CONFIG[group.provider] || { icon: 'Bot', color: 'bg-slate-500' };
              const IconComponent = ICON_MAP[config.icon] || Bot;
              const isPaid = group.provider.includes('4sAPI');
              
              return (
                <div key={group.provider}>
                  {/* 分组标题 - 带分隔线 */}
                  <div className={`flex items-center gap-2 px-4 py-2 ${groupIndex > 0 ? 'border-t border-slate-100 dark:border-slate-800 mt-1' : ''}`}>
                    <div className={`w-5 h-5 ${config.color} rounded flex items-center justify-center`}>
                      <IconComponent className="w-3 h-3 text-white" />
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
                  <div className="px-3 pb-1">
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
                              ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isSelected ? 'text-orange-700 dark:text-orange-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                              {model.label}
                            </span>
                            {model.recommended && !isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">
                                推荐
                              </span>
                            )}
                          </div>
                          
                          {isSelected && (
                            <Check className="w-4 h-4 text-orange-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
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
export { UNIFIED_MODEL_GROUPS, UNIFIED_MODEL_OPTIONS, DEFAULT_MODEL_ID, getModelById, MODEL_PROVIDER_CONFIG } from '@/lib/models';
