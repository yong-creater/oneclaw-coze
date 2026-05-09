'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Search, RefreshCw, Star, ChevronLeft, ChevronRight, Eye, EyeOff, Copy } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface InspirationItem {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  author: string | null;
  uses: number;
  likes: number;
  is_featured: boolean;
  status: string;
  tool_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { value: '场景描述', label: '场景描述' },
  { value: '风格迁移', label: '风格迁移' },
  { value: '角色扮演', label: '角色扮演' },
  { value: '特效制作', label: '特效制作' },
  { value: '商品图', label: '商品图' },
  { value: '小红书', label: '小红书' },
  { value: 'AI写真', label: 'AI写真' },
  { value: '海报设计', label: '海报设计' },
  { value: '详情页', label: '详情页' },
  { value: '视频', label: '视频' },
];

const CATEGORY_COLORS: Record<string, string> = {
  '商品图': 'bg-orange-100 text-orange-700',
  '小红书': 'bg-rose-100 text-rose-700',
  'AI写真': 'bg-violet-100 text-violet-700',
  '海报设计': 'bg-blue-100 text-blue-700',
  '详情页': 'bg-emerald-100 text-emerald-700',
  '视频': 'bg-cyan-100 text-cyan-700',
  '场景描述': 'bg-amber-100 text-amber-700',
  '风格迁移': 'bg-pink-100 text-pink-700',
  '角色扮演': 'bg-indigo-100 text-indigo-700',
  '特效制作': 'bg-purple-100 text-purple-700',
};

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
];

const DEFAULT_FORM = {
  title: '',
  content: '',
  category: '商品图',
  tags: '',
  is_featured: false,
  status: 'published' as 'published' | 'draft',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminInspirationPage() {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---- Fetch ---- */
  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      params.set('page', String(page));
      params.set('pageSize', '20');

      const res = await fetch(`/api/admin/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        setPagination(data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch inspiration items:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus]);

  useEffect(() => { fetchItems(1); }, [fetchItems]);

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
      content: item.content,
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      is_featured: item.is_featured,
      status: item.status as 'published' | 'draft',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        tags: form.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
        is_featured: form.is_featured,
        status: form.status,
      };
      const url = editingId ? `/api/admin/prompts/${editingId}` : '/api/admin/prompts';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        fetchItems(editingId ? pagination.page : 1);
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
      const res = await fetch(`/api/admin/prompts/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchItems(pagination.page);
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (item: InspirationItem) => {
    try {
      const res = await fetch(`/api/admin/prompts/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !item.is_featured }),
      });
      const data = await res.json();
      if (data.success) fetchItems(pagination.page);
    } catch (err) {
      console.error('Toggle featured failed:', err);
    }
  };

  const toggleStatus = async (item: InspirationItem) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      const res = await fetch(`/api/admin/prompts/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchItems(pagination.page);
    } catch (err) {
      console.error('Toggle status failed:', err);
    }
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
  };

  /* ---- Render ---- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">灵感库管理</h2>
          <p className="text-sm text-muted-foreground">
            管理前台灵感案例库内容 · 共 {pagination.total} 条
          </p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> 新增灵感
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
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
          <SelectTrigger className="w-36">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => fetchItems(pagination.page)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Card List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">暂无灵感内容，点击右上角新增</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(item => (
            <Card key={item.id} className="group relative hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Top row: category + status + featured + actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${CATEGORY_COLORS[item.category] || 'bg-slate-100 text-slate-700'}`}>
                      {item.category}
                    </Badge>
                    <button onClick={() => toggleStatus(item)} className="cursor-pointer" title={item.status === 'published' ? '点击下架' : '点击发布'}>
                      {item.status === 'published' ? (
                        <Badge className="text-xs cursor-pointer bg-green-100 text-green-700 hover:bg-green-200">
                          <Eye className="w-3 h-3 mr-0.5" /> 已发布
                        </Badge>
                      ) : (
                        <Badge className="text-xs cursor-pointer bg-slate-100 text-slate-500 hover:bg-slate-200">
                          <EyeOff className="w-3 h-3 mr-0.5" /> 草稿
                        </Badge>
                      )}
                    </button>
                    <button onClick={() => toggleFeatured(item)} className="cursor-pointer" title={item.is_featured ? '取消推荐' : '设为推荐'}>
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyContent(item.content)} title="复制内容">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)} title="编辑">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteId(item.id)} title="删除">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-medium text-sm line-clamp-1 mb-1">{item.title}</h3>

                {/* Content preview */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                  {item.content}
                </p>

                {/* Bottom row: tags + stats */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(item.tags || []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {(item.tags || []).length > 3 && (
                      <span className="text-xs text-slate-400">+{(item.tags || []).length - 3}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {item.uses || 0} 次使用 · {item.likes || 0} 赞
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 条
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchItems(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchItems(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑灵感' : '新增灵感'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">标题 *</label>
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
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">灵感内容 / Prompt *</label>
              <Textarea
                value={form.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="输入灵感提示词内容..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">标签（逗号分隔）</label>
                <Input
                  value={form.tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="例：电商, 夏日, 清新"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">状态</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as 'published' | 'draft' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
