'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, RefreshCw, AlertTriangle, Check, DollarSign } from 'lucide-react';

interface ModelConfig {
  id: number;
  tool_id: string;
  tool_name: string;
  tool_type: string;
  default_model: string;
  model_source: string;
  model_price_per_1k_tokens: number;
  is_free: boolean;
  is_active: boolean;
  config_params: any;
  model_info?: any;
  available_sources: Array<{
    id: string;
    name: string;
    models: Array<{
      id: string;
      name: string;
      isFree?: boolean;
      price?: number;
      maxTokens?: number;
      type?: string;
    }>;
  }>;
}

export default function ToolModelsPage() {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 获取配置
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tool-models');
      const data = await res.json();
      if (data.success) {
        setConfigs(data.configs);
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
  const updateConfig = (toolId: string, field: string, value: any) => {
    setConfigs(prev => prev.map(c => {
      if (c.tool_id === toolId) {
        const updated = { ...c, [field]: value };
        // 如果切换了模型来源，重置相关字段
        if (field === 'model_source') {
          const sourceModels = value === '4sapi' 
            ? c.available_sources?.find(s => s.id === '4sapi')?.models
            : c.available_sources?.find(s => s.id === 'coze')?.models;
          if (sourceModels && sourceModels.length > 0) {
            updated.default_model = sourceModels[0].id;
            updated.is_free = value !== '4sapi';
          }
        }
        return updated;
      }
      return c;
    }));
    setHasChanges(true);
  };

  // 保存配置
  const saveConfigs = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tool-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configs: configs.map(c => ({
            tool_id: c.tool_id,
            default_model: c.default_model,
            model_source: c.model_source,
            model_price_per_1k_tokens: c.model_price_per_1k_tokens,
            is_free: c.is_free,
            is_active: c.is_active,
            config_params: c.model_info,
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setHasChanges(false);
        setLastSaved(new Date().toLocaleTimeString('zh-CN'));
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 获取当前工具选中的模型信息
  const getSelectedModelInfo = (config: ModelConfig) => {
    const source = config.available_sources?.find(s => s.id === config.model_source);
    return source?.models.find(m => m.id === config.default_model);
  };

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
            配置精选工具调用的AI模型，扣子内置模型免费，4sAPI模型需付费
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-slate-500">
              上次保存: {lastSaved}
            </span>
          )}
          <Button
            onClick={fetchConfigs}
            variant="outline"
            disabled={loading}
          >
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

      {/* 图例 */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                免费
              </Badge>
              <span className="text-slate-600">扣子内置模型，完全免费</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <DollarSign className="w-3 h-3 mr-1" />
                付费
              </Badge>
              <span className="text-slate-600">4sAPI模型，按量计费</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                停用
              </Badge>
              <span className="text-slate-600">该工具将暂停使用</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置列表 */}
      <div className="space-y-4">
        {configs.map(config => {
          const selectedModel = getSelectedModelInfo(config);
          const isPaidModel = config.model_source === '4sapi';
          
          return (
            <Card key={config.id} className={!config.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{config.tool_name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {config.tool_type}
                    </Badge>
                    {isPaidModel ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <DollarSign className="w-3 h-3 mr-1" />
                        付费
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        免费
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {config.is_active ? '启用' : '停用'}
                    </span>
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={(checked) => updateConfig(config.tool_id, 'is_active', checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 模型来源 */}
                  <div className="space-y-2">
                    <Label>模型来源</Label>
                    <Select
                      value={config.model_source}
                      onValueChange={(value) => updateConfig(config.tool_id, 'model_source', value)}
                      disabled={!config.is_active}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coze">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            扣子免费模型
                          </div>
                        </SelectItem>
                        <SelectItem value="4sapi">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            4sAPI付费模型
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 选择模型 */}
                  <div className="space-y-2">
                    <Label>选择模型</Label>
                    <Select
                      value={config.default_model}
                      onValueChange={(value) => updateConfig(config.tool_id, 'default_model', value)}
                      disabled={!config.is_active}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.available_sources?.find(s => s.id === config.model_source)?.models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{model.name}</span>
                              {isPaidModel && model.price && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  ${model.price}/1K
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 当前配置信息 */}
                  <div className="space-y-2">
                    <Label>当前配置</Label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
                      {selectedModel ? (
                        <div className="space-y-1">
                          <div className="font-medium">{selectedModel.name}</div>
                          <div className="text-slate-500">
                            {isPaidModel ? (
                              <span className="text-amber-600">
                                ${selectedModel.price || 0}/1K tokens
                              </span>
                            ) : (
                              <span className="text-green-600">免费使用</span>
                            )}
                          </div>
                          {selectedModel.maxTokens && (
                            <div className="text-slate-400 text-xs">
                              最大 {selectedModel.maxTokens.toLocaleString()} tokens
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">未选择模型</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4sapi价格说明 */}
                {isPaidModel && selectedModel?.price && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium">付费模型说明</p>
                        <p className="mt-1">
                          当前选择的是4sAPI付费模型，每次调用将消耗账户余额。
                          单次调用预估费用：约 ¥{((selectedModel.price * 1000) * 0.03).toFixed(4)}（按1000 tokens估算）
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 保存按钮（底部固定） */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 left-72">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              有未保存的更改
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setHasChanges(false)}>
                取消
              </Button>
              <Button
                onClick={saveConfigs}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                保存更改
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
