'use client';

import { useState, useEffect } from 'react';
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
};

export function ModelSelector({
  open,
  onOpenChange,
  onSelect,
  currentProviderId,
  currentModelName,
  providers = {},
}: ModelSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('image');
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // 弹框打开时，根据 currentProviderId/currentModelName 回显选中状态
  useEffect(() => {
    if (!open) return;

    // 回显当前选中：确定模型类型并设置选中状态
    if (currentProviderId && currentModelName) {
      // 在 providers 中查找当前模型属于哪个类型
      let foundType = selectedType;
      for (const [type, providerList] of Object.entries(providers)) {
        const found = providerList?.some(p =>
          p.id === currentProviderId && p.models?.some(m => m.name === currentModelName)
        );
        if (found) {
          foundType = type;
          break;
        }
      }
      setSelectedType(foundType);
      setSelectedProviderId(currentProviderId);
      setSelectedModel(currentModelName);
    } else {
      // 没有已选模型，重置选中状态
      setSelectedProviderId(null);
      setSelectedModel(null);
    }
    setSearchQuery('');
  }, [open, currentProviderId, currentModelName]);

  // Tab 点击处理
  const handleTabClick = (type: string) => {
    setSelectedType(type);
    setSelectedProviderId(null);
    setSelectedModel(null);
  };

  // 当前类型的模型
  const currentTypeProviders = providers[selectedType] || [];

  // 扁平化模型列表
  const allModels: Array<{ provider: ModelProvider; model: Model }> = [];
  currentTypeProviders.forEach(provider => {
    if (provider.models) {
      provider.models.forEach(model => {
        allModels.push({ provider, model });
      });
    }
  });

  // 搜索过滤
  const filteredModels = searchQuery.length >= 2
    ? allModels.filter(({ model }) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model.display_name && model.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allModels;

  // 确认选择
  const handleConfirm = () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error('请选择模型');
      return;
    }
    onSelect(selectedProviderId, selectedModel);
  };

  // 选中详情
  const selectedDetails = selectedProviderId && selectedModel
    ? allModels.find(m => m.provider.id === selectedProviderId && m.model.name === selectedModel)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[900px] !max-h-[80vh] !h-[80vh] !p-0 !rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl z-[100] flex flex-col"
        showCloseButton={false}
      >
        {/* 头部 */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">选择AI模型</h2>
              <p className="text-xs text-slate-500">选择适合的模型</p>
            </div>
          </div>

          {/* Tab */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {Object.entries(TYPE_CONFIG).map(([type, config]) => {
              const TypeIcon = config.icon;
              const count = (providers[type] || []).reduce((sum, p) => sum + (p.models?.length || 0), 0);
              const isSelected = selectedType === type;
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTabClick(type)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <TypeIcon className="w-4 h-4" />
                  <span>{config.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-600">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 模型列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 检查是否有可用的模型 */}
          {(() => {
            const totalModels = Object.values(providers).reduce((sum, proList) => 
              sum + proList.reduce((s, p) => s + (p.models?.length || 0), 0), 0);
            
            if (totalModels === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                    <X className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
                    未配置模型
                  </h3>
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    该工具尚未配置任何AI模型，请先在「模型配置」中添加模型
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => onOpenChange(false)}
                  >
                    关闭
                  </Button>
                </div>
              );
            }
            
            if (filteredModels.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Image className="w-12 h-12 mb-3 opacity-50" />
                  <p>暂无模型</p>
                </div>
              );
            }
            
            return (
            <div className="grid grid-cols-2 gap-3">
              {filteredModels.map(({ provider, model }) => {
                const isSelected = selectedProviderId === provider.id && selectedModel === model.name;
                const isCurrent = currentProviderId === provider.id && currentModelName === model.name;
                const is4S = provider.slug?.includes('4s') || provider.slug?.includes('coze');

                return (
                  <button
                    key={`${provider.id}-${model.name}`}
                    onClick={() => {
                      setSelectedProviderId(provider.id);
                      setSelectedModel(model.name);
                    }}
                    disabled={!model.is_available}
                    className={`relative w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-400'
                    } ${!model.is_available ? 'opacity-50' : ''}`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${is4S ? 'bg-green-100 dark:bg-green-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
                        {is4S ? (
                          <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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

                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={is4S ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}>
                        {provider.name}
                      </Badge>
                      {isCurrent && (
                        <Badge className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          当前
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {provider.is_system ? (
                        <span className="text-sm text-green-600 dark:text-green-400">免费</span>
                      ) : model.price_per_1k_tokens ? (
                        <span className="text-sm font-bold text-amber-600">${model.price_per_1k_tokens}/1M</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
            );
          })()}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            {selectedDetails ? (
              <>
                <Badge>{selectedDetails.provider.name}</Badge>
                <span className="text-slate-400">/</span>
                <Badge variant="outline">{selectedDetails.model.display_name || selectedDetails.model.name}</Badge>
              </>
            ) : (
              <span className="text-slate-400">请选择模型</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[80px]">取消</Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedProviderId || !selectedModel || loading}
              className="min-w-[80px] bg-orange-500 hover:bg-orange-600"
            >
              确认
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
