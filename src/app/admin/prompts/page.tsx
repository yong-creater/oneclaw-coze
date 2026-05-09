'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sparkles, Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface InspirationItem {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  '商品图', '小红书', 'AI写真', '海报设计', '详情页', '视频',
  '电商', '美食', '穿搭', '美妆', '数码', '家居',
];

const DEFAULT_FORM = {
  title: '',
  description: '',
  content: '',
  category: '商品图',
  tags: '',
  is_featured: false,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminInspirationPage() {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---- Fetch ---- */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch inspiration items:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ---- Form handlers ---- */
  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item: InspirationItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || '',
      content: item.content,
      category: item.category,
      tags: (item.tags || []).join(', '),
      is_featured: item.is_featured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content.trim(),
        category: form.category,
        tags: form.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
        is_featured: form.is_featured,
      };
      const url = editingId ? `/api/prompts/${editingId}` : '/api/prompts';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        fetchItems();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prompts/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchItems();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  /* ---- Stats ---- */
  const stats = {
    total: items.length,
    featured: items.filter(i => i.is_featured).length,
    categories: [...new Set(items.map(i => i.category))].length,
  };

  /* ---- Render ---- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">灵感库管理</h2>
          <p className="text-sm text-muted-foreground">管理前台灵感案例库的内容，包括提示词模板和创作灵感</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> 新增灵感
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">灵感总数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.featured}</p>
              <p className="text-xs text-muted-foreground">精选推荐</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.categories}</p>
              <p className="text-xs text-muted-foreground">分类数</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索灵感标题或内容..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchItems}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>标签</TableHead>
                <TableHead className="w-16">推荐</TableHead>
                <TableHead className="w-16">使用次数</TableHead>
                <TableHead className="w-28">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无灵感内容，点击右上角新增
                  </TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(item.tags || []).slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {(item.tags || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">+{item.tags.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.is_featured ? (
                        <Badge className="bg-amber-100 text-amber-700">推荐</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.use_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑灵感' : '新增灵感'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">标题</label>
                <Input
                  value={form.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="例：夏日护肤封面"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">分类</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">简介</label>
              <Input
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="一句话描述这个灵感案例"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">灵感内容 / Prompt</label>
              <Textarea
                value={form.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="输入灵感提示词内容..."
                rows={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">标签（逗号分隔）</label>
              <Input
                value={form.tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="例：电商, 夏日, 清新"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <label htmlFor="is_featured" className="text-sm">设为推荐（前台优先展示）</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">确定要删除这条灵感内容吗？此操作不可撤销。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
