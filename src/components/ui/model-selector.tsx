'use client';

import { useState } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// 模型配置
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  icon?: string;
  description?: string;
  recommended?: boolean;
  isPaid?: boolean;
}

// 默认模型列表
export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'doubao-seed-2-0-pro-260215', name: 'Seed 2.0 Pro', provider: '豆包', description: '旗舰全能' },
  { id: 'doubao-seed-1-8-251228', name: 'Seed 1.8', provider: '豆包', description: '多模态优化' },
  { id: 'deepseek-r1-250528', name: 'R1', provider: 'DeepSeek', description: '深度推理', recommended: true },
  { id: 'deepseek-v3-2-251201', name: 'V3', provider: 'DeepSeek', description: '平衡推理' },
  { id: 'kimi-k2-5-260127', name: 'K2.5', provider: 'Kimi', description: 'Agent能力' },
  { id: 'kimi-k2-250905', name: 'K2', provider: 'Kimi', description: '长文本' },
  { id: 'glm-5-0-260211', name: 'GLM-5', provider: 'GLM', description: '旗舰基座' },
  { id: 'qwen-3-5-plus-260215', name: 'Qwen 3.5 Plus', provider: 'Qwen', description: '混合架构' },
];

// 品牌配置
const PROVIDER_CONFIG: Record<string, { icon: string; color: string }> = {
  '豆包': { icon: '🦜', color: 'bg-emerald-500' },
  'DeepSeek': { icon: '🔮', color: 'bg-violet-500' },
  'Kimi': { icon: '🌙', color: 'bg-amber-500' },
  'GLM': { icon: '📊', color: 'bg-blue-500' },
  'Qwen': { icon: '🏔️', color: 'bg-orange-500' },
};

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = MODEL_OPTIONS.find(m => m.id === value) || MODEL_OPTIONS[0];
  
  const providerConfig = PROVIDER_CONFIG[selectedModel.provider] || { icon: '🤖', color: 'bg-slate-500' };

  return (
    <div>
      {/* 触发按钮 - 简洁样式 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700 rounded-lg 
                   hover:border-slate-300 dark:hover:border-slate-600 
                   focus:outline-none focus:border-orange-500 transition-colors"
      >
        {/* 品牌图标 */}
        <div className={`w-5 h-5 ${providerConfig.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
          {providerConfig.icon}
        </div>
        
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

          {/* 模型列表 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {MODEL_OPTIONS.map(model => {
              const config = PROVIDER_CONFIG[model.provider] || { icon: '🤖', color: 'bg-slate-500' };
              const isSelected = model.id === value;
              
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* 品牌图标 */}
                  <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center text-base flex-shrink-0`}>
                    {config.icon}
                  </div>
                  
                  {/* 名称和描述 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {model.name}
                      </span>
                      {model.recommended && !isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                          推荐
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {model.description}
                    </div>
                  </div>
                  
                  {/* 选中标识 */}
                  {isSelected && (
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
