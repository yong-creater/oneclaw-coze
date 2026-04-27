'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, RefreshCw, AlertTriangle, DollarSign, Globe, Bot } from 'lucide-react';

interface ModelProvider {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  is_system: boolean;
  models: Array<{
    id: number;
    name: string;
    display_name: string;
    description: string;
    is_available: boolean;
  }>;
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

  // 更新单个配置
  const updateConfig = (toolId: number, field: string, value: any) => {
    setConfigs(prev => prev.map(c => {
      if (c.id === toolId) {
        return { ...c, [field]: value };
      }
      return c;
    }));
    setHasChanges(true);
  };

  // 保存配置
  const saveConfigs = async () => {
    setSaving(true);
    try {
      // 保存所有配置
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
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 获取工具的当前提供商
  const getToolProvider = (config: ToolConfig) => {
    const allProviders = Object.values(providers).flat();
    return allProviders.find(p => p.id === config.model_provider_id);
  };

  // 获取提供商的所有模型
  const getProviderModels = (providerId: number) => {
    const allProviders = Object.values(providers).flat();
    const provider = allProviders.find(p => p.id === providerId);
    return provider?.models || [];
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
            配置精选工具调用的AI模型，支持扣子内置模型（免费）和4SAPI模型（付费）
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
                  {provider.is_system && (
                    <Badge variant="outline" className="ml-2 text-xs">系统</Badge>
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

      {/* 配置列表 */}
      <div className="space-y-4">
        {filteredConfigs.map(config => {
          const currentProvider = getToolProvider(config);
          const currentModels = getProviderModels(config.model_provider_id || 0);
          const isCoze = currentProvider?.slug?.includes('coze');
          
          return (
            <Card key={config.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {config.tool_icon ? (
                      <span className="text-2xl">{config.tool_icon}</span>
                    ) : (
                      <Bot className="w-6 h-6 text-slate-400" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{config.tool_name}</CardTitle>
                      {config.tool_description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                          {config.tool_description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCoze ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        免费
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <DollarSign className="w-3 h-3 mr-1" />
                        付费
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 选择提供商 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">模型提供商</Label>
                    <Select
                      value={String(config.model_provider_id || '')}
                      onValueChange={(value) => {
                        const providerId = parseInt(value);
                        const models = getProviderModels(providerId);
                        const firstModel = models[0];
                        updateConfig(config.id, 'model_provider_id', providerId);
                        updateConfig(config.id, 'model_name', firstModel?.name || '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择提供商" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(providers).map(([type, typeProviders]) => (
                          <div key={type}>
                            <div className="px-2 py-1.5 text-xs font-medium text-slate-500">
                              {getProviderTypeLabel(type)}
                            </div>
                            {typeProviders.map(provider => (
                              <SelectItem key={provider.id} value={String(provider.id)}>
                                <div className="flex items-center gap-2">
                                  {provider.slug?.includes('coze') ? (
                                    <Bot className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Globe className="w-4 h-4 text-amber-600" />
                                  )}
                                  <span>{provider.name}</span>
                                  {provider.is_system && (
                                    <Badge variant="outline" className="ml-2 text-xs">免费</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 选择模型 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">选择模型</Label>
                    <Select
                      value={config.model_name || ''}
                      onValueChange={(value) => updateConfig(config.id, 'model_name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentModels.map(model => (
                          <SelectItem key={model.id} value={model.name} disabled={!model.is_available}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {model.display_name || model.name}
                                {!model.is_available && ' (不可用)'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 当前配置信息 */}
                {currentProvider && config.model_name && (
                  <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <div className="text-sm">
                      <span className="text-slate-500">当前配置：</span>
                      <span className="font-medium">{currentProvider.name}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="font-medium">{config.model_name}</span>
                    </div>
                  </div>
                )}
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
    </div>
  );
}

// 添加 Label 组件
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      {children}
    </label>
  );
}
