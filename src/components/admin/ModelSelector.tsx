'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Bot, Globe, Check, Image, MessageSquare, Video, Music, ChevronRight } from 'lucide-react';
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

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Image }> = {
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

  // 扁平化所有提供商
  const allProviders = useMemo(() => {
    return Object.values(providers).flat();
  }, [providers]);

  // 获取当前选中的提供商
  const selectedProvider = useMemo(() => {
    return allProviders.find(p => p.id === selectedProviderId);
  }, [allProviders, selectedProviderId]);

  // 是否为当前使用的配置
  const isCurrentConfig = selectedProviderId === currentProviderId && selectedModel === currentModelName;

  // 过滤模型
  const filteredModels = useMemo(() => {
    if (!selectedProvider) return [];
    if (!searchQuery) return selectedProvider.models;
    
    const query = searchQuery.toLowerCase();
    return selectedProvider.models.filter(model =>
      model.name.toLowerCase().includes(query) ||
      model.display_name.toLowerCase().includes(query) ||
      model.description?.toLowerCase().includes(query)
    );
  }, [selectedProvider, searchQuery]);

  // 全局搜索
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Array<{ provider: ModelProvider; model: Model }> = [];
    
    allProviders.forEach(provider => {
      provider.models.forEach(model => {
        if (
          model.name.toLowerCase().includes(query) ||
          model.display_name.toLowerCase().includes(query)
        ) {
          results.push({ provider, model });
        }
      });
    });
    
    return results.slice(0, 10);
  }, [searchQuery, allProviders]);

  const handleConfirm = async () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error('请选择模型');
      return;
    }
    setLoading(true);
    try {
      onSelect(selectedProviderId, selectedModel);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromSearch = (providerId: number, modelName: string) => {
    setSelectedProviderId(providerId);
    setSelectedModel(modelName);
    setSearchQuery('');
  };

  useEffect(() => {
    if (open) {
      if (currentProviderId) {
        setSelectedProviderId(currentProviderId);
        setSelectedModel(currentModelName || null);
      } else if (!selectedProviderId && allProviders.length > 0) {
        const firstWithModels = allProviders.find(p => p.models.length > 0);
        if (firstWithModels) {
          setSelectedProviderId(firstWithModels.id);
          setSelectedModel(firstWithModels.models[0]?.name || null);
        }
      }
    }
  }, [open, currentProviderId, currentModelName, selectedProviderId, allProviders]);

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const is4SAPI = (provider: ModelProvider) => !provider.slug?.includes('coze');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold">选择AI模型</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              为工具配置调用的AI模型，免费工具推荐使用扣子内置模型
            </p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索模型名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-lg max-h-64 overflow-y-auto z-10">
                {searchResults.map(({ provider, model }) => (
                  <button
                    key={`${provider.id}-${model.name}`}
                    onClick={() => handleSelectFromSearch(provider.id, model.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                  >
                    <span className={`p-1 rounded ${is4SAPI(provider) ? 'bg-amber-100' : 'bg-green-100'}`}>
                      {is4SAPI(provider) ? (
                        <Globe className="w-3 h-3 text-amber-600" />
                      ) : (
                        <Bot className="w-3 h-3 text-green-600" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{model.display_name || model.name}</div>
                      <div className="text-xs text-slate-400 truncate">{provider.name}</div>
                    </div>
                    {provider.is_system ? (
                      <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">免费</Badge>
                    ) : (
                      <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">
                        {model.price_per_1k_tokens ? `$${model.price_per_1k_tokens}/1M` : '付费'}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 主体 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：提供者列表 */}
          <div className="w-72 border-r overflow-y-auto bg-slate-50/30">
            <div className="p-4">
              {Object.entries(providers).map(([type, typeProviders]) => {
                const TypeIcon = TYPE_CONFIG[type]?.icon || Bot;
                return (
                  <div key={type} className="mb-6">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                      <TypeIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {TYPE_CONFIG[type]?.label || type}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {typeProviders.map((provider) => {
                        const isSelected = selectedProviderId === provider.id;
                        const is4sapi = is4SAPI(provider);
                        
                        return (
                          <button
                            key={provider.id}
                            onClick={() => {
                              setSelectedProviderId(provider.id);
                              if (provider.models.length > 0) {
                                setSelectedModel(provider.models[0].name);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-white shadow-sm border-2 border-orange-300 dark:border-orange-600'
                                : 'hover:bg-white/80 border-2 border-transparent'
                            }`}
                          >
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                              is4sapi ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                              {is4sapi ? (
                                <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-medium text-sm truncate">{provider.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">{provider.models.length} 个模型</span>
                                {provider.is_system ? (
                                  <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">免费</Badge>
                                ) : (
                                  <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">付费</Badge>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧：模型列表 */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {!selectedProvider ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                请在左侧选择一个提供者
              </div>
            ) : filteredModels.length === 0 && searchQuery ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                未找到匹配的模型
              </div>
            ) : (
              <>
                {/* 提供商头部 */}
                <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      is4SAPI(selectedProvider) ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {is4SAPI(selectedProvider) ? (
                        <Globe className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Bot className="w-6 h-6 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedProvider.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {selectedProvider.is_system ? (
                          <span className="text-sm text-green-600 font-medium">扣子内置 · 完全免费</span>
                        ) : (
                          <span className="text-sm text-amber-600 font-medium">按量计费 · 费用见模型详情</span>
                        )}
                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-500">共 {selectedProvider.models.length} 个模型</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 模型卡片 */}
                <div className="grid grid-cols-2 gap-3">
                  {filteredModels.map((model) => {
                    const isSelected = selectedModel === model.name;
                    const isCurrent = currentModelName === model.name;
                    
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.name)}
                        disabled={!model.is_available}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        } ${!model.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {isCurrent && !isSelected && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="text-[10px] px-2 py-0 bg-orange-100 text-orange-700 border-orange-200">使用中</Badge>
                          </div>
                        )}

                        <div className="font-semibold text-base mb-1 pr-6">
                          {model.display_name || model.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mb-2 truncate">
                          {model.name}
                        </div>

                        <div className="flex items-center justify-between">
                          {selectedProvider.is_system ? (
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">免费使用</Badge>
                          ) : model.price_per_1k_tokens ? (
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-slate-500">价格:</span>
                              <span className="font-semibold text-amber-600">${model.price_per_1k_tokens}</span>
                              <span className="text-slate-400 text-xs">/1M Tokens</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">价格待定</Badge>
                          )}
                          {!model.is_available && (
                            <Badge variant="outline" className="text-xs text-red-500 border-red-200">暂不可用</Badge>
                          )}
                        </div>

                        {model.description && (
                          <div className="mt-2 text-xs text-slate-400 line-clamp-2">{model.description}</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {filteredModels.length === 0 && !searchQuery && (
                  <div className="flex items-center justify-center h-40 text-slate-400">该提供者暂无模型</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
          <div className="text-sm">
            {selectedProvider && selectedModel ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">已选择:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedProvider.name}</span>
                <span className="text-slate-400">/</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedModel}</span>
                {isCurrentConfig && (
                  <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200 ml-2">与当前配置相同</Badge>
                )}
              </div>
            ) : (
              <span className="text-slate-400">请选择模型</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedProviderId || !selectedModel || loading}
              className="bg-orange-500 hover:bg-orange-600 min-w-[120px]"
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
