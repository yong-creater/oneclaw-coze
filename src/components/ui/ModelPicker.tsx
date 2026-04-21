'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Sparkles, Bot, Zap, Moon, BarChart3, Mountain, Cpu, Brain, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

// 类型定义
interface ModelOption {
  id: string;
  name: string;
  provider: string;
  icon: string;
  color: string;
  description?: string;
  recommended?: boolean;
  isPaid?: boolean;
}

interface ModelGroup {
  provider: string;
  icon: string;
  color: string;
  models: Array<{ value: string; label: string; region: string; recommended?: boolean }>;
}

interface ModelPickerProps {
  value: string;
  onChange: (modelId: string) => void;
  triggerClassName?: string;
}

export default function ModelPicker({ value, onChange, triggerClassName = '' }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ModelGroup[]>([]);
  const [options, setOptions] = useState<ModelOption[]>([]);
  const [defaultModel, setDefaultModel] = useState('deepseek-r1-250528');

  // 获取模型列表
  const fetchModels = useCallback(async () => {
    if (groups.length > 0) return; // 已加载
    
    setLoading(true);
    try {
      const response = await fetch('/api/models');
      const result = await response.json();
      
      if (result.success) {
        setGroups(result.data.groups || []);
        setOptions(result.data.options || []);
        setDefaultModel(result.data.defaultModel || 'deepseek-r1-250528');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [groups.length]);

  // 打开弹窗时获取模型
  useEffect(() => {
    if (open) {
      fetchModels();
    }
  }, [open, fetchModels]);

  // 获取当前选中的模型
  const selectedModel = options.find(m => m.id === value) || options[0];
  const selectedConfig = selectedModel ? {
    icon: selectedModel.icon,
    color: selectedModel.color,
  } : { icon: 'Bot', color: 'bg-slate-500' };
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
        {loading ? (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        ) : (
          <div className={`w-5 h-5 ${selectedConfig.color} rounded flex items-center justify-center`}>
            <SelectedIcon className="w-3 h-3 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {selectedModel?.name || '加载中...'}
        </span>
        <span className="text-xs text-slate-500">
          {selectedModel?.provider || ''}
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
            {groups.length === 0 && !loading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                暂无可用模型
              </div>
            ) : (
              groups.map((group, groupIndex) => {
                const IconComponent = ICON_MAP[group.icon] || Bot;
                const isPaid = group.provider.includes('4sAPI') || group.provider.includes('GPT') || group.provider.includes('Claude') || group.provider.includes('Gemini');
                
                return (
                  <div key={group.provider}>
                    {/* 分组标题 */}
                    <div className={`flex items-center gap-2 px-4 py-2 ${groupIndex > 0 ? 'border-t border-slate-100 dark:border-slate-800 mt-1' : ''}`}>
                      <div className={`w-5 h-5 ${group.color} rounded flex items-center justify-center`}>
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
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
