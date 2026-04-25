'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus, Trash2, Copy, Check, Key, ToggleLeft, ToggleRight, Loader2, Eye, EyeOff, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: number;
  name: string;
  key: string;
  is_active: boolean;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showKey, setShowKey] = useState<number | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/admin/api-keys');
      const data = await res.json();
      if (data.success) {
        setKeys(data.data || []);
      }
    } catch (error) {
      toast.error('获取 API Key 列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert('请输入 Key 名称');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('API Key 创建成功！请立即复制保存，关闭后将不再显示');
        setKeys([data.data, ...keys]);
        setShowCreate(false);
        setNewName('');
        setShowKey(data.data.id);
      } else {
        alert('创建失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      alert('创建失败，请检查网络或数据库连接');
      console.error('创建API Key失败:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个 API Key 吗？删除后将无法恢复。')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('删除成功');
        setKeys(keys.filter(k => k.id !== id));
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggle = async (id: number, currentState: boolean) => {
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentState }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(!currentState ? '已启用' : '已禁用');
        setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentState } : k));
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const copyKey = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length > 20) {
      return key.slice(0, 8) + '...' + key.slice(-8);
    }
    return key.slice(0, 8) + '...';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            API Key 管理
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            管理外部AI工具的数据导入权限
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          创建 Key
        </Button>
      </div>

      {/* 使用说明 */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            使用说明
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <p>1. 创建 API Key 后，立即复制保存（关闭后将不再显示完整 Key）</p>
            <p>2. 调用接口时，在请求体中传入 <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">api_key</code> 字段</p>
            <p>3. 可以禁用/启用 Key 来控制访问权限</p>
          </div>
        </CardContent>
      </Card>

      {/* Key 列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无 API Key，点击上方按钮创建</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => (
            <Card key={apiKey.id} className={!apiKey.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                        {apiKey.is_active ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                        {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        title={showKey === apiKey.id ? '隐藏' : '显示'}
                      >
                        {showKey === apiKey.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyKey(apiKey.key, apiKey.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        title="复制"
                      >
                        {copiedId === apiKey.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      创建于 {new Date(apiKey.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(apiKey.id, apiKey.is_active)}
                      className="gap-1"
                    >
                      {apiKey.is_active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">已启用</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>已禁用</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(apiKey.id)}
                      className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建对话框 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新的 API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Key 名称</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：外部AI工具导入"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>重要：</strong>创建后请立即复制保存，关闭对话框后将不再显示完整 Key。
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={creating} className="gap-2">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                创建
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
