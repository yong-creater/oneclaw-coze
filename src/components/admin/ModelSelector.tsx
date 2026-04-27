'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Bot, Globe, Check, Image, MessageSquare, Video, Music, Sparkles, X } from 'lucide-react';
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
  providers = {},
}: ModelSelectorProps) {
  // 状态
  const [selectedType, setSelectedType] = useState<string>('image');
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // 调试日志
  useEffect(() => {
    console.log('[ModelSelector] Props changed:', {
      open,
      providersKeys: Object.keys(providers),
      currentProviderId,
      currentModelName,
    });
  }, [open, providers, currentProviderId, currentModelName]);

  useEffect(() => {
    console.log('[ModelSelector] selectedType changed to:', selectedType);
  }, [selectedType]);

  // 初始化：当弹框打开时设置初始值
  useEffect(() => {
    if (!open) return;
    
    console.log('[ModelSelector] Dialog opened, initializing...');
    
    // 如果有当前选中的模型，找到对应的类型
    if (currentProviderId && currentModelName) {
      // 遍历所有类型找 provider
      for (const [type, providerList] of Object.entries(providers)) {
        const provider = providerList.find(p => p.id === currentProviderId);
        if (provider) {
          console.log('[ModelSelector] Found current provider, switching to type:', type);
          setSelectedType(type);
          setSelectedProviderId(currentProviderId);
          setSelectedModel(currentModelName);
          return;
        }
      }
    }
    
    // 否则选择第一个可用模型
    const firstType = Object.keys(TYPE_CONFIG).find(t => (providers[t] || []).length > 0);
    if (firstType) {
      console.log('[ModelSelector] No current model, selecting first type:', firstType);
      setSelectedType(firstType);
      const firstProvider = providers[firstType]?.[0];
      if (firstProvider?.models?.[0]) {
        setSelectedProviderId(firstProvider.id);
        setSelectedModel(firstProvider.models[0].name);
      }
    }
  }, [open, providers]);

  // 处理 Tab 点击 - 使用 useCallback 避免不必要的重新渲染
  const handleTabClick = useCallback((type: string) => {
    console.log('[ModelSelector] Tab clicked:', type);
    setSelectedType(type);
    
    // 切换类型后自动选择该类型第一个模型
    const providerList = providers[type] || [];
    if (providerList.length > 0 && providerList[0].models.length > 0) {
      setSelectedProviderId(providerList[0].id);
      setSelectedModel(providerList[0].models[0].name);
      console.log('[ModelSelector] Auto-selected first model:', providerList[0].models[0].name);
    }
  }, [providers]);

  // 获取当前类型的模型列表
  const currentTypeProviders = providers[selectedType] || [];
  const currentModels: Array<{ provider: ModelProvider; model: Model }> = [];
  currentTypeProviders.forEach(provider => {
    provider.models.forEach(model => {
      currentModels.push({ provider, model });
    });
  });

  // 过滤搜索结果
  const filteredModels = searchQuery.length >= 2
    ? currentModels.filter(({ model }) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model.display_name && model.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : currentModels;

  // 获取当前选中的详情
  const selectedDetails = selectedProviderId && selectedModel
    ? currentModels.find(m => m.provider.id === selectedProviderId && m.model.name === selectedModel)
    : null;

  const isCurrentConfig = selectedProviderId === currentProviderId && selectedModel === currentModelName;

  // 确认选择
  const handleConfirm = () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error('请选择模型');
      return;
    }
    console.log('[ModelSelector] Confirming selection:', { selectedProviderId, selectedModel });
    setLoading(true);
    onSelect(selectedProviderId, selectedModel);
    setLoading(false);
    onOpenChange(false);
  };

  // 关闭时重置搜索
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[900px] max-h-[85vh] !p-0 !rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl z-[100]"
        showCloseButton={false}
      >
        {/* 头部 */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative">
          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          
          {/* 标题 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">选择AI模型</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">选择一个适合的模型来驱动您的工具</p>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索模型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Tab 选择 */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {Object.entries(TYPE_CONFIG).map(([type, config]) => {
              const TypeIcon = config.icon;
              const count = (providers[type] || []).reduce((sum, p) => sum + (p.models?.length || 0), 0);
              const isSelected = selectedType === type;
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTabClick(type)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm ring-2 ring-orange-500/30'
                      : count > 0
                        ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <TypeIcon className={`w-4 h-4 ${isSelected ? config.color.replace('bg-', 'text-') : ''}`} />
                  <span>{config.label}</span>
                  {count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-600">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 模型列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Image className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-base font-medium">暂无可用模型</p>
              <p className="text-sm">该类型下没有可用的模型</p>
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
                      console.log('[ModelSelector] Model card clicked:', model.name);
                      setSelectedProviderId(provider.id);
                      setSelectedModel(model.name);
                    }}
                    disabled={!model.is_available}
                    className={`relative w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 bg-white dark:bg-slate-800'
                    } ${!model.is_available ? 'opacity-50' : ''}`}
                  >
                    {/* 选中标记 */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* 模型名称 */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${is4SAPI ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-green-100 dark:bg-green-900/40'}`}>
                        {is4SAPI ? (
                          <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <h4 className="font-bold text-slate-800 dark:text-white">
                          {model.display_name || model.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {model.name}
                        </p>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={is4SAPI ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}>
                        {provider.name}
                      </Badge>
                      {isCurrent && (
                        <Badge className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          当前使用
                        </Badge>
                      )}
                    </div>

                    {/* 描述 */}
                    {model.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {model.description}
                      </p>
                    )}

                    {/* 价格 */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {provider.is_system ? (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">免费使用</span>
                      ) : model.price_per_1k_tokens ? (
                        <span className="text-sm font-bold text-amber-600">${model.price_per_1k_tokens}/1M</span>
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            {selectedDetails ? (
              <>
                <span className="text-sm text-slate-500">已选择:</span>
                <Badge className={!selectedDetails.provider.slug?.includes('coze') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                  {selectedDetails.provider.name}
                </Badge>
                <span className="text-slate-400">/</span>
                <Badge variant="outline">
                  {selectedDetails.model.display_name || selectedDetails.model.name}
                </Badge>
                {isCurrentConfig && (
                  <Badge className="bg-slate-200 text-slate-500 ml-1">无变化</Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-400">请点击选择一个模型</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px]">
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedProviderId || !selectedModel || loading}
              className="min-w-[120px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? '处理中...' : '确认选择'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
