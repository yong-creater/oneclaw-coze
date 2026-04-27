'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Bot, Globe, Check, Image, MessageSquare, Video, Music, Sparkles } from 'lucide-react';
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

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Image; color: string }> = {
  image: { label: '图片生成', icon: Image, color: 'bg-pink-500' },
  llm: { label: '大语言模型', icon: MessageSquare, color: 'bg-blue-500' },
  video: { label: '视频生成', icon: Video, color: 'bg-purple-500' },
  audio: { label: '音频处理', icon: Music, color: 'bg-green-500' },
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

  // 获取当前类型的提供商和模型
  const typeModels = useMemo(() => {
    const typeProviders = providers[selectedType] || [];
    const models: Array<{
      provider: ModelProvider;
      model: Model;
    }> = [];

    typeProviders.forEach(provider => {
      provider.models.forEach(model => {
        models.push({ provider, model });
      });
    });

    return models;
  }, [providers, selectedType]);

  // 过滤搜索结果
  const filteredModels = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return typeModels;
    }
    const query = searchQuery.toLowerCase();
    return typeModels.filter(({ model }) =>
      model.name.toLowerCase().includes(query) ||
      (model.display_name && model.display_name.toLowerCase().includes(query)) ||
      model.description?.toLowerCase().includes(query)
    );
  }, [typeModels, searchQuery]);

  // 是否为当前使用的配置
  const isCurrentConfig = selectedProviderId === currentProviderId && selectedModel === currentModelName;

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

  // 初始化
  useEffect(() => {
    if (open) {
      // 设置当前选中的模型
      if (currentProviderId && currentModelName) {
        setSelectedProviderId(currentProviderId);
        setSelectedModel(currentModelName);
        // 自动切换到对应的类型
        const provider = allProviders.find(p => p.id === currentProviderId);
        if (provider?.provider_type) {
          setSelectedType(provider.provider_type);
        }
      } else if (typeModels.length > 0) {
        // 默认选择第一个
        setSelectedProviderId(typeModels[0].provider.id);
        setSelectedModel(typeModels[0].model.name);
      }
    }
  }, [open, currentProviderId, currentModelName, typeModels, allProviders]);

  // 切换类型时保持选中状态
  useEffect(() => {
    const currentSelection = typeModels.find(
      m => m.provider.id === selectedProviderId && m.model.name === selectedModel
    );
    if (!currentSelection && typeModels.length > 0) {
      setSelectedProviderId(typeModels[0].provider.id);
      setSelectedModel(typeModels[0].model.name);
    }
  }, [selectedType, typeModels]);

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  // 获取当前选中的详情
  const selectedDetails = useMemo(() => {
    if (!selectedProviderId || !selectedModel) return null;
    const item = typeModels.find(
      m => m.provider.id === selectedProviderId && m.model.name === selectedModel
    );
    return item;
  }, [typeModels, selectedProviderId, selectedModel]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        {/* 头部 */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          {/* 标题行 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">选择AI模型</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">选择一个适合的模型来驱动您的工具</p>
              </div>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* 类型选择标签 - 使用 w-full 确保完整显示 */}
          <div className="relative">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                const TypeIcon = config.icon;
                const count = (providers[type] || []).reduce((sum, p) => sum + p.models.length, 0);
                const isSelected = selectedType === type;
                const hasData = count > 0;
                
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 z-10 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : hasData
                          ? 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={!hasData && type !== selectedType}
                  >
                    <TypeIcon className={`w-4 h-4 ${isSelected ? config.color.replace('bg-', 'text-') : ''}`} />
                    <span>{config.label}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        isSelected 
                          ? 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                    {!hasData && (
                      <span className="text-[10px] text-slate-400">(暂无)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 主体 - 模型列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Image className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-base font-medium">暂无可用模型</p>
              <p className="text-sm mt-1">该类型下没有可用的模型，请选择其他类型</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredModels.map(({ provider, model }) => {
                const isSelected = selectedProviderId === provider.id && selectedModel === model.name;
                const isCurrent = currentProviderId === provider.id && currentModelName === model.name;
                const is4SAPI = !provider.slug?.includes('coze');

                return (
                  <button
                    key={`${provider.id}-${model.name}`}
                    onClick={() => {
                      setSelectedProviderId(provider.id);
                      setSelectedModel(model.name);
                    }}
                    disabled={!model.is_available}
                    className={`relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    } ${!model.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* 选中标记 */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* 模型名称 */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        is4SAPI ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-green-100 dark:bg-green-900/40'
                      }`}>
                        {is4SAPI ? (
                          <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                          {model.display_name || model.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                          {model.name}
                        </p>
                      </div>
                    </div>

                    {/* 来源标签 */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-[10px] px-2 py-0.5 font-medium ${
                        is4SAPI 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {provider.name}
                      </Badge>
                      {isCurrent && (
                        <Badge className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          当前使用
                        </Badge>
                      )}
                      {!model.is_available && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-slate-400">
                          暂不可用
                        </Badge>
                      )}
                    </div>

                    {/* 描述 */}
                    {model.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {model.description}
                      </p>
                    )}

                    {/* 价格 */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                      {provider.is_system ? (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-semibold">免费使用</span>
                        </div>
                      ) : model.price_per_1k_tokens ? (
                        <div className="text-right">
                          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            ${model.price_per_1k_tokens}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">/1M Tokens</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">价格待定</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-2xl">
          <div className="flex items-center gap-2">
            {selectedDetails ? (
              <>
                <span className="text-sm text-slate-500">已选择:</span>
                <Badge className={`px-3 py-1.5 text-sm font-medium ${
                  !selectedDetails.provider.slug?.includes('coze')
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                }`}>
                  {selectedDetails.provider.name}
                </Badge>
                <span className="text-slate-400">›</span>
                <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800">
                  {selectedDetails.model.display_name || selectedDetails.model.name}
                </Badge>
                {isCurrentConfig && (
                  <Badge className="text-xs bg-slate-200 text-slate-500 ml-1">无变化</Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-400">请点击选择一个模型</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="min-w-[100px] h-11 rounded-xl border-slate-300 dark:border-slate-600"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedProviderId || !selectedModel || loading}
              className="min-w-[120px] h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  确认选择
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
