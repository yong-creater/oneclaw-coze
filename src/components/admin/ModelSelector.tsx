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
  const [selectedType, setSelectedType] = useState<string>('image');
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

  // 获取当前类型的提供商
  const typeProviders = useMemo(() => {
    return providers[selectedType] || [];
  }, [providers, selectedType]);

  // 是否为当前使用的配置
  const isCurrentConfig = selectedProviderId === currentProviderId && selectedModel === currentModelName;

  // 全局搜索
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Array<{ provider: ModelProvider; model: Model }> = [];
    
    allProviders.forEach(provider => {
      provider.models.forEach(model => {
        if (
          model.name.toLowerCase().includes(query) ||
          (model.display_name && model.display_name.toLowerCase().includes(query))
        ) {
          results.push({ provider, model });
        }
      });
    });
    
    return results.slice(0, 6);
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

  // 搜索结果中选择
  const handleSelectFromSearch = (providerId: number, modelName: string) => {
    const provider = allProviders.find(p => p.id === providerId);
    if (provider) {
      setSelectedType(provider.provider_type);
      setSelectedProviderId(providerId);
      setSelectedModel(modelName);
      setSearchQuery('');
    }
  };

  // 初始化和重置
  useEffect(() => {
    if (open) {
      if (currentProviderId) {
        setSelectedProviderId(currentProviderId);
        setSelectedModel(currentModelName || null);
        // 根据当前提供商设置类型
        const currentProvider = allProviders.find(p => p.id === currentProviderId);
        if (currentProvider?.provider_type) {
          setSelectedType(currentProvider.provider_type);
        }
      } else if (!selectedProviderId && typeProviders.length > 0) {
        setSelectedProviderId(typeProviders[0].id);
        setSelectedModel(typeProviders[0].models[0]?.name || null);
      } else if (!selectedProviderId && typeProviders.length === 0) {
        // 该类型没有提供商，自动选择有模型的类型
        const firstTypeWithModels = Object.keys(providers).find(
          type => (providers[type] || []).some(p => p.models.length > 0)
        );
        if (firstTypeWithModels) {
          setSelectedType(firstTypeWithModels);
        }
      }
    }
  }, [open, currentProviderId, currentModelName]);

  // 切换类型时自动选择第一个有模型的提供商
  useEffect(() => {
    const provider = typeProviders.find(p => p.id === selectedProviderId);
    if (!provider || provider.models.length === 0) {
      const firstWithModels = typeProviders.find(p => p.models.length > 0);
      if (firstWithModels) {
        setSelectedProviderId(firstWithModels.id);
        setSelectedModel(firstWithModels.models[0]?.name || null);
      } else {
        setSelectedProviderId(null);
        setSelectedModel(null);
      }
    }
  }, [selectedType, typeProviders]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const is4SAPI = (provider: ModelProvider) => !provider.slug?.includes('coze');

  // 获取当前选中的模型详情
  const selectedModelDetail = useMemo(() => {
    if (!selectedProvider || !selectedModel) return null;
    return selectedProvider.models.find(m => m.name === selectedModel);
  }, [selectedProvider, selectedModel]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">选择AI模型</h2>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg max-h-56 overflow-y-auto z-10">
                  {searchResults.map(({ provider, model }) => (
                    <button
                      key={`${provider.id}-${model.name}`}
                      onClick={() => handleSelectFromSearch(provider.id, model.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                    >
                      <span className={`p-1.5 rounded-lg ${
                        is4SAPI(provider) ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-green-100 dark:bg-green-900/50'
                      }`}>
                        {is4SAPI(provider) ? (
                          <Globe className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-green-600" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-800 dark:text-white truncate">
                          {model.display_name || model.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{provider.name}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            免费工具推荐使用扣子内置模型，付费工具可选择4SAPI获取更高质量
          </p>
        </div>

        {/* 主体 - 上下布局 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：类型选择 + 提供商列表 */}
          <div className="w-72 border-r border-slate-200 dark:border-slate-700 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50">
            {/* 类型切换 */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-1">
                模型类型
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                  const TypeIcon = config.icon;
                  const count = (providers[type] || []).length;
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      <TypeIcon className="w-4 h-4" />
                      <span className="truncate">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 提供商列表 */}
            <div className="p-3">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-1">
                选择提供商
              </div>
              <div className="space-y-1">
                {typeProviders.map((provider) => {
                  const isSelected = selectedProviderId === provider.id;
                  const is4sapi = is4SAPI(provider);
                  const hasModels = provider.models.length > 0;
                  
                  return (
                    <button
                      key={provider.id}
                      onClick={() => {
                        if (hasModels) {
                          setSelectedProviderId(provider.id);
                          setSelectedModel(provider.models[0]?.name || null);
                        }
                      }}
                      disabled={!hasModels}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 shadow-sm ring-2 ring-orange-500/30'
                          : hasModels
                            ? 'hover:bg-white/80 dark:hover:bg-slate-700/80'
                            : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        is4sapi ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-green-100 dark:bg-green-900/40'
                      }`}>
                        {is4sapi ? (
                          <Globe className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Bot className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                          {provider.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {hasModels ? `${provider.models.length} 个模型` : '暂无可用模型'}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
                {typeProviders.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    暂无可用的{selectedType}模型
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：模型详情列表 */}
          <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900">
            {!selectedProvider ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                请在左侧选择一个模型提供商
              </div>
            ) : (
              <div className="space-y-3">
                {/* 提供商头部 */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className={`p-2 rounded-lg ${is4SAPI(selectedProvider) ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-green-100 dark:bg-green-900/40'}`}>
                    {is4SAPI(selectedProvider) ? (
                      <Globe className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Bot className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white">{selectedProvider.name}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedProvider.is_system ? (
                        <span className="text-green-600 dark:text-green-400">免费使用</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">按量计费</span>
                      )}
                      <span className="mx-1.5">·</span>
                      <span>{selectedProvider.models.length} 个可用模型</span>
                    </div>
                  </div>
                </div>

                {/* 模型卡片列表 */}
                <div className="grid gap-3">
                  {selectedProvider.models.map((model) => {
                    const isSelected = selectedModel === model.name;
                    const isCurrent = currentModelName === model.name && selectedProviderId === currentProviderId;
                    
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.name)}
                        disabled={!model.is_available}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-900/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                        } ${!model.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {/* 模型信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                              {model.display_name || model.name}
                            </h4>
                            {isCurrent && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
                                当前使用
                              </Badge>
                            )}
                            {!model.is_available && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-400">
                                暂不可用
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
                            {model.name}
                          </p>
                          {model.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                              {model.description}
                            </p>
                          )}
                        </div>

                        {/* 价格 */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {selectedProvider.is_system ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-1">
                              免费
                            </Badge>
                          ) : model.price_per_1k_tokens ? (
                            <div className="text-right px-3 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                ${model.price_per_1k_tokens}
                              </div>
                              <div className="text-[10px] text-slate-400">/1M Tokens</div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 px-2 py-1">待定价</Badge>
                          )}
                          
                          {isSelected && (
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedProvider.models.length === 0 && (
                  <div className="flex items-center justify-center h-40 text-slate-400">
                    该提供商暂无模型
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 min-w-0">
            {selectedProvider && selectedModel ? (
              <>
                <span className="text-sm text-slate-500 flex-shrink-0">已选择:</span>
                <Badge variant="outline" className="bg-white dark:bg-slate-800 flex-shrink-0">
                  {selectedProvider.name}
                </Badge>
                <span className="text-slate-400 flex-shrink-0">/</span>
                <Badge variant="outline" className="bg-white dark:bg-slate-800 font-medium flex-shrink-0 max-w-[200px]">
                  <span className="truncate">{selectedModelDetail?.display_name || selectedModel}</span>
                </Badge>
                {isCurrentConfig && (
                  <Badge className="text-xs bg-green-100 text-green-700 flex-shrink-0">无变化</Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-400">请选择一个模型</span>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-300 dark:border-slate-600"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedProviderId || !selectedModel || loading}
              className="bg-orange-500 hover:bg-orange-600 min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '确认'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
