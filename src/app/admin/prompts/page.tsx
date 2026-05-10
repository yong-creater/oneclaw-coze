'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Plus, Pencil, Trash2, Search, RefreshCw, Star, ChevronLeft, ChevronRight, Eye, EyeOff, Copy, ImagePlus, X } from 'lucide-react';

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
  views: number;
  is_featured: boolean;
  status: string;
  tool_slug: string | null;
  image: string | null;
  style: string | null;
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
  { value: '商品图', label: '商品图' },
  { value: '小红书', label: '小红书' },
  { value: 'AI写真', label: 'AI写真' },
  { value: '海报设计', label: '海报设计' },
  { value: '详情页', label: '详情页' },
  { value: '抠图', label: '抠图' },
  { value: '场景描述', label: '场景描述' },
  { value: '风格迁移', label: '风格迁移' },
  { value: '特效制作', label: '特效制作' },
  { value: '视频', label: '视频' },
];

const TOOL_SLUGS = [
  { value: 'product-generator', label: '商品图' },
  { value: 'xiaohongshu-generator', label: '小红书' },
  { value: 'ai-photo', label: 'AI写真' },
  { value: 'poster-design', label: '海报设计' },
  { value: 'background-removal', label: '抠图' },
  { value: 'product-page', label: '详情页' },
];

const CATEGORY_COLORS: Record<string, string> = {
  '商品图': 'bg-orange-100 text-orange-700',
  '小红书': 'bg-rose-100 text-rose-700',
  'AI写真': 'bg-violet-100 text-violet-700',
  '海报设计': 'bg-blue-100 text-blue-700',
  '详情页': 'bg-emerald-100 text-emerald-700',
  '抠图': 'bg-purple-100 text-purple-700',
  '视频': 'bg-cyan-100 text-cyan-700',
  '场景描述': 'bg-amber-100 text-amber-700',
  '风格迁移': 'bg-pink-100 text-pink-700',
  '特效制作': 'bg-indigo-100 text-indigo-700',
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
  tool_slug: '',
  image: '',
  style: '',
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

  // Image upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  /* ---- Image upload ---- */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'inspiration');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setForm(f => ({ ...f, image: data.data.url }));
      } else {
        alert(data.error || '上传失败');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      tool_slug: item.tool_slug || '',
      image: item.image || '',
      style: item.style || '',
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
        tool_slug: form.tool_slug || null,
        image: form.image || null,
        style: form.style || null,
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
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImagePlus className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row: category + status + featured + actions */}
                    <div className="flex items-center justify-between mb-1.5">
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

                    {/* Tool slug + style */}
                    <div className="flex items-center gap-2 mb-1">
                      {item.tool_slug && (
                        <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                          {TOOL_SLUGS.find(t => t.value === item.tool_slug)?.label || item.tool_slug}
                        </span>
                      )}
                      {item.style && (
                        <span className="text-xs text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">
                          {item.style}
                        </span>
                      )}
                    </div>

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
                        {item.views || 0} 浏览 · {item.likes || 0} 赞 · {item.uses || 0} 使用
                      </span>
                    </div>
                  </div>
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
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-lg">{editingId ? '编辑灵感' : '新增灵感'}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {editingId ? '修改灵感内容，保存后前台即时生效' : '添加新的灵感案例，发布后前台可见'}
            </p>
          </DialogHeader>
          <div className="px-6 py-4 space-y-5">
            {/* 标题 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">标题 <span className="text-red-400">*</span></label>
              <Input
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="例：夏日护肤封面"
                className="w-full"
              />
            </div>

            {/* 分类 + 关联工具 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">分类</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">关联工具</label>
                <Select value={form.tool_slug} onValueChange={v => setForm(f => ({ ...f, tool_slug: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择工具" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    {TOOL_SLUGS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 风格 + 状态 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">风格</label>
                <Input
                  value={form.style}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, style: e.target.value }))}
                  placeholder="例：lifestyle, korean-fresh"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">状态</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as 'published' | 'draft' }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-green-600" /> 已发布</span>
                    </SelectItem>
                    <SelectItem value="draft">
                      <span className="flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5 text-slate-400" /> 草稿</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 封面图上传 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">封面图</label>
              <div className="flex items-start gap-3">
                {form.image ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden group/img">
                    <img src={form.image} alt="封面" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: '' }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-orange-400 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">{uploading ? '上传中' : '上传'}</span>
                  </button>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">支持 JPG、PNG、WebP，建议 16:10 比例，不超过 5MB</p>
                  <Input
                    value={form.image}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="或输入图片 URL"
                    className="mt-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 灵感内容 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">灵感内容 <span className="text-red-400">*</span></label>
              <Textarea
                value={form.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="输入灵感提示词内容，描述你想要生成的画面效果..."
                rows={4}
                className="w-full resize-none"
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">标签</label>
              <Input
                value={form.tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="用逗号分隔，例：电商, 夏日, 清新"
                className="w-full"
              />
            </div>

            {/* 推荐 */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <button
                type="button"
                role="switch"
                aria-checked={form.is_featured}
                onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.is_featured ? 'bg-amber-400' : 'bg-slate-300'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${form.is_featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <div>
                <p className="text-sm font-medium">设为推荐</p>
                <p className="text-xs text-muted-foreground">推荐灵感会在前台优先展示</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50/50 dark:bg-slate-800/30">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? '保存中...' : editingId ? '保存修改' : '添加灵感'}
            </Button>
          </div>
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
