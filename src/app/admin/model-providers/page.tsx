'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, Check, ChevronDown, ChevronRight, Bot } from 'lucide-react';

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

interface ProviderModel {
  id: number;
  name: string;
  display_name: string | null;
  provider_id: number;
  is_available: boolean;
  price_per_1k_tokens: number | null;
}

const PROVIDER_TYPES = [
  { value: 'image', label: '图片生成' },
  { value: 'llm', label: '大语言模型' },
  { value: 'tts', label: '语音合成' },
  { value: 'video', label: '视频生成' },
];

export default function ModelProvidersPage() {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedProviders, setExpandedProviders] = useState<Set<number>>(new Set());
  const [providerModels, setProviderModels] = useState<Record<number, ProviderModel[]>>({});
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    api_url: '',
    api_key: '',
    provider_type: 'image',
    is_active: true,
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
        setProviders(data.data);
      }
    } catch (error) {
      console.error('获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (providerId: number) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
      // 如果还没加载过模型列表，则获取
      if (!providerModels[providerId]) {
        await fetchProviderModels(providerId);
      }
    }
    setExpandedProviders(newExpanded);
  };

  const fetchProviderModels = async (providerId: number) => {
    try {
      const res = await fetch('/api/admin/tool-models', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.providers) {
        // 找出该提供商下的所有模型
        const allModels: ProviderModel[] = [];
        const providersByType = data.providers as Record<string, any[]>;
        Object.values(providersByType).forEach((typeModels) => {
          typeModels.forEach((p) => {
            if (p.provider && p.provider.id === providerId) {
              allModels.push({
                id: p.model.id,
                name: p.model.name,
                display_name: p.model.display_name,
                provider_id: providerId,
                is_available: p.model.is_available,
                price_per_1k_tokens: p.model.price_per_1k_tokens,
              });
            }
          });
        });
        setProviderModels(prev => ({ ...prev, [providerId]: allModels }));
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    }
  };

  const openAddDialog = () => {
    setEditingProvider(null);
    setFormData({
      name: '',
      slug: '',
      api_url: '',
      api_key: '',
      provider_type: 'image',
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
      api_key: '', // 编辑时不显示原key
      provider_type: provider.provider_type,
      is_active: provider.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingProvider 
        ? '/api/admin/model-providers' 
        : '/api/admin/model-providers';
      const method = editingProvider ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(editingProvider && { id: editingProvider.id }),
          ...formData,
          api_key: formData.api_key || null, // 空字符串转null
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        fetchProviders();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (provider: ModelProvider) => {
    if (provider.is_system) {
      alert('系统内置provider不允许删除');
      return;
    }
    
    if (!confirm(`确定删除 "${provider.name}" 吗？`)) return;
    
    try {
      const res = await fetch(`/api/admin/model-providers?id=${provider.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getTypeLabel = (type: string) => {
    return PROVIDER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      case 'llm': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'tts': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'video': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">模型提供商配置</h2>
          <p className="text-sm text-slate-500 mt-1">
            配置 AI 模型服务提供商，每个环境可配置不同的 API Key
          </p>
        </div>
        <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          添加提供商
        </Button>
      </div>

      {/* 提供商列表 */}
      <div className="grid gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold">{provider.name}</h3>
                    <Badge className={getTypeColor(provider.provider_type)}>
                      {getTypeLabel(provider.provider_type)}
                    </Badge>
                    {provider.is_system && (
                      <Badge variant="outline" className="text-slate-500">系统内置</Badge>
                    )}
                    {provider.is_active ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        已启用
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500">已禁用</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Slug:</span>
                      <code className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                        {provider.slug}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">API URL:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {provider.api_url || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <span className="text-slate-500">API Key:</span>
                      {provider.has_api_key ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                            {showApiKey ? provider.api_key : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(provider.api_key!, provider.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          >
                            {copiedId === provider.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">未配置</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(provider.id)}
                  >
                    {expandedProviders.has(provider.id) ? (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-1" />
                    )}
                    模型
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(provider)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  {!provider.is_system && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(provider)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  )}
                </div>
              </div>

              {/* 模型列表 */}
              {expandedProviders.has(provider.id) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      包含模型 ({providerModels[provider.id]?.length || 0})
                    </span>
                  </div>
                  {providerModels[provider.id]?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {providerModels[provider.id].map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg"
                        >
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {model.display_name || model.name}
                          </span>
                          <code className="text-xs text-slate-500">{model.name}</code>
                          {model.price_per_1k_tokens ? (
                            <Badge variant="outline" className="text-xs">
                              ${model.price_per_1k_tokens}/1M
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-green-600">
                              免费
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">暂无模型</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {providers.length === 0 && (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-12 text-center text-slate-500">
              暂无模型提供商，点击上方按钮添加
            </CardContent>
          </Card>
        )}
      </div>

      {/* 添加/编辑弹框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? '编辑提供商' : '添加提供商'}
            </DialogTitle>
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
              <Label htmlFor="api_key">
                API Key 
                {editingProvider && <span className="text-slate-400 font-normal ml-2">（留空则保持原值）</span>}
              </Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder={editingProvider ? '输入新Key可更新' : '输入API Key'}
              />
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
                  disabled={editingProvider?.is_system}
                  onValueChange={(v) => setFormData({ ...formData, is_active: v === 'true' })}
                >
                  <SelectTrigger className={editingProvider?.is_system ? 'bg-slate-100 dark:bg-slate-800' : ''}>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
              {editingProvider ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
