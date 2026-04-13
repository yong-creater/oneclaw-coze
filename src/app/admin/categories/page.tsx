'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  created_at?: string;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        const sorted = [...data.data].sort((a: Category, b: Category) => a.sort_order - b.sort_order);
        setCategories(sorted);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (item?: Category) => {
    if (item) {
      setEditingId(item.id);
      setForm({ name: item.name, slug: item.slug, sort_order: item.sort_order });
    } else {
      setEditingId(null);
      setForm({ name: '', slug: '', sort_order: categories.length + 1 });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ name: '', slug: '', sort_order: 0 });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('请填写名称和别名');
      return;
    }

    setSaving(true);
    try {
      const url = editingId 
        ? `/api/admin/categories?id=${editingId}` 
        : '/api/admin/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? '更新成功' : '添加成功');
        closeDialog();
        fetchData();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除「${name}」？`)) return;
    
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('删除成功');
        fetchData();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const handleSlugChange = (name: string) => {
    // 自动生成 slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setForm(prev => ({ ...prev, name, slug }));
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分类管理</h1>
          <p className="text-sm text-slate-500">管理一级分类，共 {categories.length} 个</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-1" /> 添加分类
        </Button>
      </div>

      {/* 分类列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48 text-slate-500">
            暂无分类，点击上方添加
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {categories.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
              >
                <GripVertical className="w-4 h-4 text-slate-300" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-xs text-slate-400">/{item.slug}</span>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500 w-16 text-center">
                  #{item.sort_order}
                </div>
                
                <div className="text-xs text-slate-400 w-20">
                  ID: {item.id}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialog(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑分类' : '添加分类'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">分类名称</label>
              <Input
                value={form.name}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="如：视频生成"
                className="mt-1"
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">URL 别名</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="如：video-generation"
                className="mt-1"
              />
              <p className="text-xs text-slate-400 mt-1">用于 URL 路径，自动转换小写</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">排序</label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
              <p className="text-xs text-slate-400 mt-1">数字越小越靠前</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
