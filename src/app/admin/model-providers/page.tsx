'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModal } from '@/contexts/ModalContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, Check, RefreshCw, Loader2, ExternalLink, DollarSign, Zap, Clock } from 'lucide-react';

interface ModelProvider {
  id: number;
  name: string;
  slug: string;
  api_url: string | null;
  api_key: string | null;
  has_api_key: boolean;
  provider_type: string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
}

interface FetchedModel {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  context_length?: number;
  input_token_limit?: number;
  output_token_limit?: number;
  pricing?: {
    input?: number;
    output?: number;
    image?: number;
  };
  capabilities?: string[];
  is_available?: boolean;
}

interface ProviderModels {
  provider_id: number;
  models: FetchedModel[];
  fetched_at?: string;
  error?: string;
}

const PROVIDER_TYPES = [
  { value: 'image', label: '图片生成' },
  { value: 'llm', label: '大语言模型' },
  { value: 'tts', label: '语音合成' },
  { value: 'video', label: '视频生成' },
  { value: 'audio', label: '音频处理' },
];

export default function ModelProvidersPage() {
  const { showAlert, confirm: modalConfirm } = useModal();
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addModelDialogOpen, setAddModelDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);
  const [fetchingModels, setFetchingModels] = useState<number | null>(null);
  const [providerModels, setProviderModels] = useState<Record<number, ProviderModels>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    api_url: '',
    api_key: '',
    provider_type: 'llm',
    is_active: true,
  });

  const [modelFormData, setModelFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    price_input: '',
    price_output: '',
    price_image: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/model-providers', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        // API 返回 data 字段
        setProviders(data.data || []);
      }
    } catch (error) {
      console.error('获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const openAddDialog = () => {
    setEditingProvider(null);
    setFormData({
      name: '',
      slug: '',
      api_url: '',
      api_key: '',
      provider_type: 'llm',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (provider: ModelProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      slug: provider.slug,
      api_url: provider.api_url || '',
      api_key: provider.api_key || '', // 回填脱敏 key 供展示，提交时如果未修改则不传
      provider_type: provider.provider_type,
      is_active: provider.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const url = '/api/admin/model-providers';
      const method = editingProvider ? 'PUT' : 'POST';
      
      // 构建 body，编辑时包含 id
      const body: any = { ...formData };
      if (editingProvider) {
        body.id = editingProvider.id;
        // 编辑时如果 api_key 为空或是脱敏格式（含 ...），不传该字段（保持数据库原值不变）
        if (!body.api_key || body.api_key.includes('...')) {
          delete body.api_key;
        }
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setDialogOpen(false);
        fetchProviders();
      } else {
        showAlert(`保存失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存失败:', error);
      showAlert('保存失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await modalConfirm('确定要删除吗？', '删除后不可恢复', 'delete');
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/model-providers?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchProviders();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchModelsFromAPI = async (provider: ModelProvider) => {
    // 内置提供商不允许通过 API 获取
    if (provider.is_system) {
      showAlert('内置模型无法通过 API 获取，请联系系统管理员');
      return;
    }
    
    if (!provider.api_key) {
      showAlert('该提供商未配置 API Key');
      return;
    }

    setFetchingModels(provider.id);
    try {
      const res = await fetch('/api/admin/model-providers/fetch-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider_id: provider.id,
          api_url: provider.api_url,
          api_key: provider.api_key,
          provider_type: provider.provider_type,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        // 保存成功后，刷新模型列表
        await loadProviderModels(provider.id);
      } else {
        showAlert(`获取失败: ${data.error}`);
      }
    } catch (error) {
      console.error('获取模型失败:', error);
      showAlert('获取模型失败');
    } finally {
      setFetchingModels(null);
    }
  };

  // 手动添加模型
  const handleAddModel = async () => {
    if (!selectedProvider || !modelFormData.name) {
      showAlert('请填写模型名称');
      return;
    }

    try {
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider_id: selectedProvider.id,
          name: modelFormData.name,
          display_name: modelFormData.display_name || modelFormData.name,
          description: modelFormData.description,
          model_type: selectedProvider.provider_type,
          price_input: modelFormData.price_input ? parseFloat(modelFormData.price_input) : null,
          price_output: modelFormData.price_output ? parseFloat(modelFormData.price_output) : null,
          price_image: modelFormData.price_image ? parseFloat(modelFormData.price_image) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAddModelDialogOpen(false);
        setModelFormData({
          name: '',
          display_name: '',
          description: '',
          price_input: '',
          price_output: '',
          price_image: '',
        });
        await loadProviderModels(selectedProvider.id);
      } else {
        showAlert(`添加失败: ${data.error}`);
      }
    } catch (error) {
      console.error('添加模型失败:', error);
      showAlert('添加模型失败');
    }
  };

  // 删除模型
  const handleDeleteModel = async (modelId: string) => {
    const ok = await modalConfirm('确定要删除该模型吗？', '删除后不可恢复', 'delete');
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/models?id=${modelId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await loadProviderModels(selectedProvider!.id);
      }
    } catch (error) {
      console.error('删除模型失败:', error);
    }
  };

  // 从 tool-models API 加载单个提供商的模型
  const loadProviderModels = async (providerId: number) => {
    try {
      const res = await fetch('/api/admin/tool-models', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.providers) {
        // 从 providers 中提取该提供商的模型
        const allModels: any[] = [];
        
        // API 返回格式: { image: [{ id, name, models: [...] }], llm: [...] }
        Object.entries(data.providers).forEach(([type, typeProviders]) => {
          (typeProviders as any[]).forEach((provider) => {
            if (provider.id === providerId) {
              // 该提供商的模型
              (provider.models || []).forEach((model: any) => {
                // 解析价格
                let pricing: Record<string, number> = {};
                try {
                  if (typeof model.price_per_1k_tokens === 'object') {
                    pricing = model.price_per_1k_tokens || {};
                  } else if (typeof model.price_per_1k_tokens === 'string') {
                    pricing = JSON.parse(model.price_per_1k_tokens) || {};
                  }
                } catch (e) {
                  pricing = {};
                }
                
                allModels.push({
                  id: model.id,
                  name: model.name,
                  display_name: model.display_name || model.name,
                  description: model.description || '',
                  pricing,
                  is_available: model.is_available,
                });
              });
            }
          });
        });
        
        setProviderModels(prev => ({
          ...prev,
          [providerId]: {
            provider_id: providerId,
            models: allModels,
            fetched_at: new Date().toISOString(),
          }
        }));
      }
    } catch (error) {
      console.error('加载模型列表失败:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    return PROVIDER_TYPES.find(t => t.value === type)?.label || type;
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return '未知';
    if (price === 0) return '免费';
    return `$${price.toFixed(4)}`;
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
          <h2 className="text-2xl font-bold">模型提供商</h2>
          <p className="text-sm text-slate-500 mt-1">管理 AI 模型提供商，配置 API Key 后可实时获取模型列表</p>
        </div>
        <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          添加提供商
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{providers.length}</div>
            <div className="text-sm text-slate-500">提供商总数</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{providers.filter(p => p.has_api_key).length}</div>
            <div className="text-sm text-slate-500">已配置 Key</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{providers.filter(p => p.is_system).length}</div>
            <div className="text-sm text-slate-500">内置模型</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Object.values(providerModels).reduce((sum, p) => sum + (p.models?.length || 0), 0)}
            </div>
            <div className="text-sm text-slate-500">已获取模型</div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区 - 左右分栏 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧：提供商列表 */}
        <div className="col-span-5">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">提供商列表</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={async () => {
                    setSelectedProvider(provider);
                    // 自动加载模型列表
                    if (!providerModels[provider.id]) {
                      await loadProviderModels(provider.id);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProvider?.id === provider.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider.name}</span>
                        {provider.is_system && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">内置</Badge>
                        )}
                        {provider.has_api_key && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">已配置</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{provider.slug}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{getTypeLabel(provider.provider_type)}</Badge>
                        <Badge variant={provider.is_active ? 'default' : 'secondary'} className={`text-xs ${provider.is_active ? 'bg-green-500' : ''}`}>
                          {provider.is_active ? '启用' : '禁用'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditDialog(provider); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {!provider.is_system && (
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(provider.id); }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {providers.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  暂无提供商，点击上方按钮添加
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：模型详情 */}
        <div className="col-span-7">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedProvider ? `${selectedProvider.name} - 模型列表` : '选择左侧提供商查看模型'}
                </CardTitle>
                {selectedProvider && !selectedProvider.is_system && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddModelDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      手动添加
                    </Button>
                    {selectedProvider.has_api_key && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchModelsFromAPI(selectedProvider)}
                        disabled={fetchingModels === selectedProvider.id}
                      >
                        {fetchingModels === selectedProvider.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        API 刷新
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {selectedProvider && (
                <p className="text-xs text-slate-500 mt-2">
                  {providerModels[selectedProvider.id]?.fetched_at 
                    ? `模型数量: ${providerModels[selectedProvider.id].models?.length || 0}`
                    : selectedProvider.is_system
                      ? '内置模型，数据来自系统'
                      : selectedProvider.has_api_key 
                        ? '点击"API 刷新"通过 API 获取最新数据，或手动添加模型'
                        : '请先配置 API Key 或手动添加模型'
                  }
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!selectedProvider ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <ExternalLink className="w-8 h-8" />
                  </div>
                  <p>请选择左侧的提供商</p>
                </div>
              ) : !providerModels[selectedProvider.id]?.models?.length ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <EyeOff className="w-8 h-8" />
                  </div>
                  <p>暂无模型数据</p>
                  {!selectedProvider.is_system && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddModelDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        手动添加
                      </Button>
                      {selectedProvider.has_api_key && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchModelsFromAPI(selectedProvider)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          API 刷新
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {providerModels[selectedProvider.id].models.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.display_name || model.name}</span>
                            {model.is_available === false && (
                              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">不可用</Badge>
                            )}
                          </div>
                          <code className="text-xs text-slate-500 mt-1 block">{model.id}</code>
                          {model.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{model.description}</p>
                          )}
                        </div>
                        {!selectedProvider.is_system && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteModel(model.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      
                      {/* 模型规格信息 */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-3">
                          {model.pricing?.input !== undefined && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-slate-500">输入:</span>
                              <span className="text-xs font-medium">{formatPrice(model.pricing.input)}</span>
                            </div>
                          )}
                          {model.pricing?.output !== undefined && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-slate-500">输出:</span>
                              <span className="text-xs font-medium">{formatPrice(model.pricing.output)}</span>
                            </div>
                          )}
                          {model.pricing?.image !== undefined && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-purple-500" />
                              <span className="text-xs text-slate-500">图片:</span>
                              <span className="text-xs font-medium">{formatPrice(model.pricing.image)}</span>
                            </div>
                          )}
                          {model.context_length && (
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-orange-500" />
                              <span className="text-xs text-slate-500">上下文:</span>
                              <span className="text-xs font-medium">{model.context_length.toLocaleString()} tokens</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 添加/编辑提供商弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProvider ? '编辑提供商' : '添加提供商'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingProvider ? formData.slug : generateSlug(e.target.value),
                    });
                  }}
                  placeholder="如：4SAPI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  disabled={editingProvider?.is_system}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="如：4sapi"
                  className={editingProvider?.is_system ? 'bg-slate-100 dark:bg-slate-800' : ''}
                />
                {editingProvider?.is_system && (
                  <p className="text-xs text-slate-400">系统内置不可修改</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                value={formData.api_url}
                disabled={editingProvider?.is_system}
                onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                placeholder="如：https://api.4s.ai/v1"
                className={editingProvider?.is_system ? 'bg-slate-100 dark:bg-slate-800' : ''}
              />
              {editingProvider?.is_system && (
                <p className="text-xs text-slate-400">系统内置不可修改</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.api_key}
                  disabled={editingProvider?.is_system}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder={editingProvider?.has_api_key ? '修改请输入新 Key，留空保持不变' : '输入 API Key'}
                  className={editingProvider?.is_system ? 'bg-slate-100 dark:bg-slate-800 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {editingProvider?.has_api_key && !formData.api_key?.includes('...') && (
                <p className="text-xs text-slate-400">已有 Key，不填则保持不变</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select 
                  value={formData.provider_type}
                  disabled={editingProvider?.is_system}
                  onValueChange={(v) => setFormData({ ...formData, provider_type: v })}
                >
                  <SelectTrigger className={editingProvider?.is_system ? 'bg-slate-100 dark:bg-slate-800' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingProvider?.is_system && (
                  <p className="text-xs text-slate-400">系统内置不可修改</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select 
                  value={formData.is_active ? 'true' : 'false'}
                  onValueChange={(v) => setFormData({ ...formData, is_active: v === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">启用</SelectItem>
                    <SelectItem value="false">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
              {editingProvider ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 手动添加模型弹窗 */}
      <Dialog open={addModelDialogOpen} onOpenChange={setAddModelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>手动添加模型</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model_name">模型名称 *</Label>
              <Input
                id="model_name"
                value={modelFormData.name}
                onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                placeholder="如：flux-pro"
              />
              <p className="text-xs text-slate-400">API 调用时使用的模型 ID</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_display_name">显示名称</Label>
              <Input
                id="model_display_name"
                value={modelFormData.display_name}
                onChange={(e) => setModelFormData({ ...modelFormData, display_name: e.target.value })}
                placeholder="如：FLUX Pro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_description">描述</Label>
              <Input
                id="model_description"
                value={modelFormData.description}
                onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                placeholder="简要描述该模型的能力"
              />
            </div>

            <div className="space-y-2">
              <Label>价格设置</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">输入价格</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={modelFormData.price_input}
                    onChange={(e) => setModelFormData({ ...modelFormData, price_input: e.target.value })}
                    placeholder="0.0001"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">输出价格</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={modelFormData.price_output}
                    onChange={(e) => setModelFormData({ ...modelFormData, price_output: e.target.value })}
                    placeholder="0.0001"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">图片价格</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={modelFormData.price_image}
                    onChange={(e) => setModelFormData({ ...modelFormData, price_image: e.target.value })}
                    placeholder="0.05"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">每 1000 tokens 的价格，图片为每张的价格</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModelDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddModel} className="bg-orange-500 hover:bg-orange-600">
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
