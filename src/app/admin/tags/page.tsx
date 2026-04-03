'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tags } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  type: string;
}

const TAG_TYPES = [
  { value: 'feature', label: '功能标签', color: 'bg-blue-100 text-blue-700' },
  { value: 'free_type', label: '免费类型', color: 'bg-green-100 text-green-700' },
  { value: 'duration', label: '时长标签', color: 'bg-purple-100 text-purple-700' },
  { value: 'scene', label: '场景标签', color: 'bg-orange-100 text-orange-700' },
  { value: 'license', label: '商用权限', color: 'bg-cyan-100 text-cyan-700' },
];

export default function TagsAdminPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'feature' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('请输入标签名称');
      return;
    }

    try {
      const url = editingTag ? `/api/admin/tags?id=${editingTag.id}` : '/api/admin/tags';
      const method = editingTag ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setEditDialogOpen(false);
        setEditingTag(null);
        setFormData({ name: '', type: 'feature' });
        fetchTags();
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除标签「${name}」吗？`)) return;
    
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTags();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const openEditDialog = (tag: Tag | null = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name, type: tag.type });
    } else {
      setEditingTag(null);
      setFormData({ name: '', type: activeType === 'all' ? 'feature' : activeType });
    }
    setEditDialogOpen(true);
  };

  const getTypeInfo = (type: string) => {
    return TAG_TYPES.find(t => t.value === type) || TAG_TYPES[0];
  };

  const filteredTags = activeType === 'all' 
    ? tags 
    : tags.filter(t => t.type === activeType);

  const groupedTags = TAG_TYPES.map(type => ({
    ...type,
    tags: tags.filter(t => t.type === type.value)
  }));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">标签管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理工具标签，共 {tags.length} 个</p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-gradient-to-r from-orange-500 to-red-500">
          <Plus className="w-4 h-4 mr-2" />
          添加标签
        </Button>
      </div>

      {/* 标签分类 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeType === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          全部 ({tags.length})
        </button>
        {TAG_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === type.value
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {type.label} ({groupedTags.find(g => g.value === type.value)?.tags.length || 0})
          </button>
        ))}
      </div>

      {/* 标签列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredTags.map(tag => {
            const typeInfo = getTypeInfo(tag.type);
            return (
              <Card key={tag.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tags className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800 dark:text-slate-100">{tag.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditDialog(tag)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDelete(tag.id, tag.name)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={`mt-2 ${typeInfo.color}`}>{typeInfo.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredTags.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-slate-500">
            暂无标签
          </CardContent>
        </Card>
      )}

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? '编辑标签' : '添加标签'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">标签名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="如：支持中文"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">标签类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {TAG_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
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
