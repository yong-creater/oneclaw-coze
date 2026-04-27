'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Bot, Globe, Check, Image, MessageSquare, Video, Music, Copy, X } from 'lucide-react';
import { toast } from 'sonner';

interface Model {
  id: number;
  name: string;
  display_name: string;
  description: string;
  model_type: string;
  price_per_1k_tokens: number | null;
  is_available: boolean;
}

interface ModelProvider {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  is_system: boolean;
  models: Model[];
}

interface ModelSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (providerId: number, modelName: string) => void;
  currentProviderId?: number | null;
  currentModelName?: string | null;
  providers: Record<string, ModelProvider[]>;
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof Image }> = {
  image: { label: '图片生成', icon: Image },
  llm: { label: '大语言模型', icon: MessageSquare },
  video: { label: '视频生成', icon: Video },
  audio: { label: '音频处理', icon: Music },
};

export function ModelSelector({
  open,
  onOpenChange,
  onSelect,
  currentProviderId,
  currentModelName,
  providers,
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取所有提供商列表（扁平化）
  const allProviders = Object.values(providers).flat();

  // 获取当前选中的提供商
  const selectedProvider = selectedProviderId
    ? allProviders.find(p => p.id === selectedProviderId)
    : allProviders.find(p => p.id === currentProviderId);

  // 过滤模型
  const filteredModels = (selectedProvider?.models || []).filter(model => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(query) ||
      model.display_name.toLowerCase().includes(query) ||
      model.description?.toLowerCase().includes(query)
    );
  });

  // 处理选择
  const handleConfirm = async () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error('请选择模型');
      return;
    }
    setLoading(true);
    try {
      onSelect(selectedProviderId, selectedModel);
      onOpenChange(false);
      toast.success('模型已选择');
    } finally {
      setLoading(false);
    }
  };

  // 复制模型名称
  const handleCopy = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(name);
    toast.success('已复制');
  };

  // 初始化选中状态
  useEffect(() => {
    if (open) {
      if (currentProviderId && !selectedProviderId) {
        setSelectedProviderId(currentProviderId);
        setSelectedModel(currentModelName || null);
      } else if (!selectedProviderId && allProviders.length > 0) {
        setSelectedProviderId(allProviders[0].id);
        setSelectedModel(allProviders[0].models[0]?.name || null);
      }
    }
  }, [open, currentProviderId, currentModelName, selectedProviderId, allProviders]);

  // 重置状态
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSelectedProviderId(null);
      setSelectedModel(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">选择AI模型</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              选择提供者和模型类型，然后选择具体模型
            </p>
          </div>
          {/* 搜索框 */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索模型名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
        </div>

        {/* 主体内容 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：提供者列表 */}
          <div className="w-64 border-r overflow-y-auto">
            <div className="p-3">
              {Object.entries(providers).map(([type, typeProviders]) => {
                const TypeIcon = TYPE_LABELS[type]?.icon || Bot;
                return (
                  <div key={type} className="mb-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <TypeIcon className="w-3.5 h-3.5" />
                      {TYPE_LABELS[type]?.label || type}
                    </div>
                    <div className="space-y-1">
                      {typeProviders.map((provider) => {
                        const isSelected = selectedProviderId === provider.id || (!selectedProviderId && currentProviderId === provider.id);
                        const is4SAPI = !provider.slug?.includes('coze');
                        return (
                          <button
                            key={provider.id}
                            onClick={() => {
                              setSelectedProviderId(provider.id);
                              setSelectedModel(provider.models[0]?.name || null);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                            }`}
                          >
                            <div className={`p-1.5 rounded-md ${
                              is4SAPI ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                              {is4SAPI ? (
                                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <Bot className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{provider.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500">{provider.models.length} 个模型</span>
                                {provider.is_system ? (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-600 border-green-200">
                                    免费
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-50 text-amber-600 border-amber-200">
                                    付费
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧：模型卡片列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedProvider && !selectedProviderId ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                请选择一个提供者
              </div>
            ) : (
              <>
                {/* 提供商信息 */}
                {selectedProvider && (
                  <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      selectedProvider.slug?.includes('coze') ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      {selectedProvider.slug?.includes('coze') ? (
                        <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{selectedProvider.name}</div>
                      <div className="text-sm text-slate-500">
                        {selectedProvider.is_system ? (
                          <span className="text-green-600">扣子内置 · 免费使用</span>
                        ) : (
                          <span className="text-amber-600">按量计费 · 价格见模型卡片</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 模型卡片网格 */}
                <div className="grid grid-cols-2 gap-3">
                  {filteredModels.map((model) => {
                    const isSelected = selectedModel === model.name || (!selectedModel && currentModelName === model.name);
                    const isCurrent = currentModelName === model.name;
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.name)}
                        disabled={!model.is_available}
                        className={`relative text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        } ${!model.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {/* 选中标记 */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* 当前使用标记 */}
                        {isCurrent && !isSelected && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-50 text-orange-600 border-orange-200">
                              使用中
                            </Badge>
                          </div>
                        )}

                        {/* 模型名称 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm truncate pr-6">
                            {model.display_name || model.name}
                          </span>
                          <button
                            onClick={(e) => handleCopy(model.name, e)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                            title="复制模型名称"
                          >
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>

                        {/* 模型ID */}
                        <div className="text-xs text-slate-500 mb-2 truncate font-mono">
                          {model.name}
                        </div>

                        {/* 价格（仅4SAPI显示） */}
                        {!selectedProvider?.is_system && model.price_per_1k_tokens && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-500">价格:</span>
                            <span className="font-medium text-amber-600">
                              ${model.price_per_1k_tokens}/1M Tokens
                            </span>
                          </div>
                        )}

                        {/* 免费标签 */}
                        {selectedProvider?.is_system && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-600 border-green-200 mt-1">
                            免费
                          </Badge>
                        )}

                        {/* 不可用提示 */}
                        {!model.is_available && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-50 text-red-600 border-red-200 mt-1 ml-1">
                            不可用
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {filteredModels.length === 0 && (
                  <div className="flex items-center justify-center h-40 text-slate-400">
                    {searchQuery ? '未找到匹配的模型' : '该提供者暂无模型'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50 dark:bg-slate-800">
          <div className="text-sm text-slate-500">
            {selectedProvider && selectedModel && (
              <span>
                已选择: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedProvider.name}</span>
                <span className="mx-1">/</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedModel}</span>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedProviderId || !selectedModel || loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              确认选择
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
