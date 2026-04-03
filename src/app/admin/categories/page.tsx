'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ChevronRight, FolderTree } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  tools_count?: number;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  sort_order: number;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', sort_order: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/sub-categories')
      ]);
      
      const catData = await catRes.json();
      const subData = await subRes.json();
      
      if (catData.success) setCategories(catData.data);
      if (subData.success) setSubCategories(subData.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      alert('请填写完整信息');
      return;
    }

    try {
      const url = editingCategory ? `/api/admin/categories?id=${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setEditDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', sort_order: 0 });
        fetchData();
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除分类「${name}」吗？该分类下的工具将失去分类。`)) return;
    
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const openEditDialog = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        sort_order: category.sort_order
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', sort_order: 0 });
    }
    setEditDialogOpen(true);
  };

  const getSubCount = (parentId: number) => {
    return subCategories.filter(s => s.parent_id === parentId).length;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">分类管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理工具分类和子分类</p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-gradient-to-r from-orange-500 to-red-500">
          <Plus className="w-4 h-4 mr-2" />
          添加分类
        </Button>
      </div>

      {/* 分类列表 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
          </div>
        ) : categories.length > 0 ? (
          categories.map(category => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-orange-500" />
                    {category.name}
                    <span className="text-xs font-normal text-slate-500">/{category.slug}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(category.id, category.name)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 子分类 */}
                <div className="space-y-2">
                  {subCategories
                    .filter(s => s.parent_id === category.id)
                    .map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{sub.name}</span>
                          <span className="text-xs text-slate-400">/{sub.slug}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {getSubCount(category.id) === 0 && (
                    <p className="text-sm text-slate-400 pl-4">暂无子分类</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32 text-slate-500">
              暂无分类数据
            </CardContent>
          </Card>
        )}
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">分类名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="如：视频生成"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL别名</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="如：video-generation"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">排序</label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-orange-500 to-red-500">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
