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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

interface SortableItemProps {
  id: number;
  item: Category;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableItem({ id, item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.name}</span>
          <span className="text-xs text-slate-400">/{item.slug}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    console.log('保存分类:', { editingId, form });
    
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
      
      console.log('请求:', { url, method, body: form });
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      console.log('响应:', data);
      
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
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setForm(prev => ({ ...prev, name, slug }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex(item => item.id === active.id);
      const newIndex = categories.findIndex(item => item.id === over.id);
      
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);
      setIsSaving(true);

      // 更新排序
      try {
        const updates = newCategories.map((item, index) => ({
          id: item.id,
          sort_order: index + 1,
        }));

        const res = await fetch('/api/admin/categories/batch-update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: updates }),
        });

        const result = await res.json();
        
        if (result.success) {
          toast.success('排序已保存');
          fetchData();
        } else {
          toast.error(result.error || '保存失败');
        }
      } catch (error) {
        console.error('保存排序失败:', error);
        toast.error('保存排序失败');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分类管理</h1>
          <p className="text-sm text-slate-500">拖拽调整顺序，共 {categories.length} 个</p>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  onEdit={() => openDialog(item)}
                  onDelete={() => handleDelete(item.id, item.name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
              <p className="text-xs text-slate-400 mt-1">数字越小越靠前（拖拽会自动更新）</p>
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
