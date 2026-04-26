'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';
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
  description?: string;
  recommended?: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'doubao-seed-2-0-pro-260215', name: '豆包 Pro', provider: '字节', description: '旗舰全能' },
  { id: 'doubao-seed-1-8-251228', name: '豆包标准版', provider: '字节', description: '多模态优化' },
  { id: 'deepseek-r1-250528', name: 'DeepSeek R1', provider: '深度求索', description: '深度推理', recommended: true },
  { id: 'deepseek-v3-2-251201', name: 'DeepSeek V3', provider: '深度求索', description: '平衡推理' },
  { id: 'kimi-k2-5-260127', name: 'Kimi K2', provider: '月之暗面', description: 'Agent能力' },
  { id: 'glm-5-0-260211', name: 'GLM-5', provider: '智谱AI', description: '旗舰基座' },
  { id: 'glm-4-7-251222', name: 'GLM-4.7', provider: '智谱AI', description: '编程推理' },
  { id: 'qwen-3-5-plus-260215', name: '通义 Qwen3.5', provider: '阿里云', description: '混合架构' },
];

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = MODEL_OPTIONS.find(m => m.id === value) || MODEL_OPTIONS[1];

  // 获取提供商颜色
  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      '字节': 'bg-orange-100 text-orange-600',
      '深度求索': 'bg-emerald-100 text-emerald-600',
      '月之暗面': 'bg-violet-100 text-violet-600',
      '智谱AI': 'bg-blue-100 text-blue-600',
      '阿里云': 'bg-cyan-100 text-cyan-600',
    };
    return colors[provider] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      >
        <Sparkles className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {selectedModel.name}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${getProviderColor(selectedModel.provider)}`}>
          {selectedModel.provider}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-orange-500" />
              选择模型
            </DialogTitle>
          </DialogHeader>

          {/* 模型列表 - 两列 */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
            {MODEL_OPTIONS.map(model => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model.id);
                  setOpen(false);
                }}
                className={`px-4 py-3 rounded-lg text-left transition-all text-sm ${
                  model.id === value
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <div className="font-medium flex items-center gap-2">
                  {model.name}
                  {model.recommended && model.id !== value && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">
                      推荐
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 flex items-center gap-2 ${model.id === value ? 'text-white/80' : 'text-slate-500'}`}>
                  <span className={`px-1 py-0.5 rounded text-[10px] ${model.id === value ? 'bg-white/20' : getProviderColor(model.provider)}`}>
                    {model.provider}
                  </span>
                  {model.description}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
