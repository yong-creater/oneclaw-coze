'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, Check, Zap, Brain, Code, FileText, Globe } from 'lucide-react';

// 模型配置
export interface ModelOption {
  id: string;
  name: string;
  provider: 'doubao' | 'deepseek' | 'kimi' | 'glm' | 'minimax' | 'qwen';
  description: string;
  strengths: string[];
  icon: React.ReactNode;
  recommended?: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'doubao-seed-2-0-pro-260215',
    name: '豆包 Pro',
    provider: 'doubao',
    description: '旗舰级全能通用模型',
    strengths: ['复杂推理', '长链路任务', '多模态理解'],
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'doubao-seed-1-8-251228',
    name: '豆包标准版',
    provider: 'doubao',
    description: '多模态 Agent 场景优化',
    strengths: ['内容创作', '结构化输出', '工具调用'],
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'deepseek-r1-250528',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: '满血版深度推理模型',
    strengths: ['复杂推理', '代码能力', '数学计算'],
    icon: <Brain className="w-4 h-4" />,
    recommended: true,
  },
  {
    id: 'deepseek-v3-2-251201',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: '平衡推理与输出长度',
    strengths: ['日常使用', '文本生成', '性价比高'],
    icon: <Brain className="w-4 h-4" />,
  },
  {
    id: 'kimi-k2-5-260127',
    name: 'Kimi K2',
    provider: 'kimi',
    description: 'Kimi 迄今最智能模型',
    strengths: ['Agent 能力', '代码开发', '视觉理解'],
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: 'glm-5-0-260211',
    name: 'GLM-5 旗舰',
    provider: 'glm',
    description: '智谱新一代旗舰基座',
    strengths: ['Agentic Engineering', '复杂系统', '长程任务'],
    icon: <Code className="w-4 h-4" />,
  },
  {
    id: 'glm-4-7-251222',
    name: 'GLM-4.7',
    provider: 'glm',
    description: '更强编程与推理能力',
    strengths: ['编程能力', '多步骤推理', '审美更好'],
    icon: <Code className="w-4 h-4" />,
  },
  {
    id: 'qwen-3-5-plus-260215',
    name: '通义 Qwen3.5',
    provider: 'qwen',
    description: '混合架构高效推理',
    strengths: ['视觉理解', '对话生成', '任务执行'],
    icon: <FileText className="w-4 h-4" />,
  },
];

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  compact?: boolean;
}

export default function ModelSelector({ value, onChange, compact = false }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = MODEL_OPTIONS.find((m) => m.id === value) || MODEL_OPTIONS[1];

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      doubao: 'bg-orange-500/10 text-orange-600 border-orange-200',
      deepseek: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      kimi: 'bg-violet-500/10 text-violet-600 border-violet-200',
      glm: 'bg-blue-500/10 text-blue-600 border-blue-200',
      minimax: 'bg-pink-500/10 text-pink-600 border-pink-200',
      qwen: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    };
    return colors[provider] || 'bg-slate-500/10 text-slate-600 border-slate-200';
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      doubao: '字节跳动',
      deepseek: '深度求索',
      kimi: '月之暗面',
      glm: '智谱AI',
      minimax: 'MiniMax',
      qwen: '阿里云',
    };
    return names[provider] || provider;
  };

  if (compact) {
    // 紧凑模式：下拉选择
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${getProviderColor(selectedModel.provider)} hover:opacity-80`}
        >
          {selectedModel.icon}
          <span className="text-sm font-medium">{selectedModel.name}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <div className="p-2 max-h-64 overflow-y-auto">
                {MODEL_OPTIONS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                      model.id === value
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${getProviderColor(model.provider)}`}>
                      {model.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{model.name}</span>
                        {model.recommended && (
                          <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] rounded font-medium">
                            推荐
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{model.description}</span>
                    </div>
                    {model.id === value && <Check className="w-4 h-4 text-orange-500" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 完整模式：卡片网格
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          选择优化模型
        </label>
        <span className="text-xs text-slate-500">
          不同模型擅长领域不同，可尝试对比效果
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MODEL_OPTIONS.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              model.id === value
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
            }`}
          >
            {model.recommended && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-medium shadow-sm">
                推荐
              </span>
            )}

            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${getProviderColor(model.provider)}`}>
                {model.icon}
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                {getProviderName(model.provider)}
              </span>
            </div>

            <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
              {model.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {model.description}
            </p>

            <div className="flex flex-wrap gap-1">
              {model.strengths.map((s, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] rounded">
                  {s}
                </span>
              ))}
            </div>

            {model.id === value && (
              <div className="absolute top-2 right-2">
                <Check className="w-5 h-5 text-orange-500" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
