'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, RefreshCw, AlertTriangle, DollarSign, Globe, Bot, Settings2 } from 'lucide-react';
import { ModelSelector } from '@/components/admin/ModelSelector';
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

interface ToolConfig {
  id: number;
  tool_id: string;
  tool_name: string;
  tool_icon?: string;
  tool_description?: string;
  tool_group?: string;
  model_provider_id: number | null;
  model_name: string | null;
}

export default function ToolModelsPage() {
  const [configs, setConfigs] = useState<ToolConfig[]>([]);
  const [providers, setProviders] = useState<Record<string, ModelProvider[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  // 模型选择弹框状态
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ToolConfig | null>(null);

  // 获取配置
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tool-models');
      const data = await res.json();
      if (data.data) {
        setConfigs(data.data);
      }
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // 打开模型选择弹框
  const openModelSelector = (config: ToolConfig) => {
    setSelectedConfig(config);
    setSelectorOpen(true);
  };

  // 处理模型选择
  const handleModelSelect = (providerId: number, modelName: string) => {
    if (!selectedConfig) return;
    
    setConfigs(prev => prev.map(c => {
      if (c.id === selectedConfig.id) {
        return { ...c, model_provider_id: providerId, model_name: modelName };
      }
      return c;
    }));
    setHasChanges(true);
    setSelectedConfig(null);
  };

  // 保存配置
  const saveConfigs = async () => {
    setSaving(true);
    try {
      for (const config of configs) {
        await fetch('/api/admin/tool-models', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_id: config.id,
            model_provider_id: config.model_provider_id,
            model_name: config.model_name,
          })
        });
      }
      setHasChanges(false);
      setLastSaved(new Date().toLocaleTimeString('zh-CN'));
      toast.success('配置保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 获取工具的当前提供商
  const getToolProvider = (config: ToolConfig) => {
    const allProviders = Object.values(providers).flat();
    return allProviders.find(p => p.id === config.model_provider_id);
  };

  // 获取提供商的类型标签
  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      image: '图片生成',
      llm: '大语言模型',
      video: '视频生成',
      audio: '音频处理',
    };
    return labels[type] || type;
  };

  // 过滤工具
  const filteredConfigs = configs.filter(c => {
    if (filterType === 'all') return true;
    const provider = getToolProvider(c);
    return provider?.provider_type === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">模型配置</h2>
          <p className="text-sm text-slate-500 mt-1">
            配置精选工具调用的AI模型，点击工具卡片选择模型
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-slate-500">
              上次保存: {lastSaved}
            </span>
          )}
          <Button onClick={fetchConfigs} variant="outline" disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            onClick={saveConfigs}
            disabled={!hasChanges || saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            保存配置
          </Button>
        </div>
      </div>

      {/* 提供商概览 */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">模型提供商</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(providers).map(([type, typeProviders]) => (
              typeProviders.map(provider => (
                <div key={provider.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg border">
                  {provider.slug === 'coze' || provider.slug === 'coze-llm' ? (
                    <Bot className="w-4 h-4 text-green-600" />
                  ) : (
                    <Globe className="w-4 h-4 text-amber-600" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{provider.name}</div>
                    <div className="text-xs text-slate-500">
                      {getProviderTypeLabel(provider.provider_type)} · {provider.models.length} 个模型
                    </div>
                  </div>
                  {provider.is_system ? (
                    <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-600 border-green-200">免费</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-600 border-amber-200">付费</Badge>
                  )}
                </div>
              ))
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 类型筛选 */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'bg-orange-500' : ''}
        >
          全部
        </Button>
        <Button
          variant={filterType === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('image')}
          className={filterType === 'image' ? 'bg-orange-500' : ''}
        >
          图片生成
        </Button>
        <Button
          variant={filterType === 'llm' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('llm')}
          className={filterType === 'llm' ? 'bg-orange-500' : ''}
        >
          大语言模型
        </Button>
      </div>

      {/* 配置列表 - 卡片式布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConfigs.map(config => {
          const currentProvider = getToolProvider(config);
          const isCoze = currentProvider?.slug?.includes('coze');
          
          return (
            <Card key={config.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {config.tool_icon ? (
                      <span className="text-2xl">{config.tool_icon}</span>
                    ) : (
                      <Bot className="w-6 h-6 text-slate-400" />
                    )}
                    <div>
                      <CardTitle className="text-base">{config.tool_name}</CardTitle>
                      {config.tool_description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {config.tool_description}
                        </p>
                      )}
                    </div>
                  </div>
                  {isCoze ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      免费
                    </Badge>
                  ) : currentProvider ? (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                      <DollarSign className="w-3 h-3 mr-0.5" />
                      付费
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      未配置
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => openModelSelector(config)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {currentProvider ? (
                      <>
                        <span className="font-medium truncate">{currentProvider.name}</span>
                        <span className="text-slate-400">/</span>
                        <span className="truncate">{config.model_name}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">点击选择模型</span>
                    )}
                  </div>
                  <Settings2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 无工具提示 */}
      {filteredConfigs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            暂无工具配置
          </CardContent>
        </Card>
      )}

      {/* 模型选择弹框 */}
      <ModelSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={handleModelSelect}
        currentProviderId={selectedConfig?.model_provider_id}
        currentModelName={selectedConfig?.model_name}
        providers={providers}
      />
    </div>
  );
}
