'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Loader2, Star, Image, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Template {
  id: number;
  name: string;
  category: string;
  style: string;
  description: string;
  thumbnail: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  usage_count: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// 风格映射
const STYLE_OPTIONS = [
  { value: 'minimal', label: '简约' },
  { value: 'vibrant', label: '活泼' },
  { value: 'luxury', label: '高端' },
  { value: 'cute', label: '可爱' },
  { value: 'tech', label: '科技' },
];

// 分类映射
const CATEGORY_LABELS: Record<string, string> = {
  social: '社交媒体',
  video: '视频封面',
  ecommerce: '电商',
  poster: '海报',
  document: '文档',
  logo: 'Logo',
};

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  // 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: search,
      });
      if (categoryFilter !== 'all') {
        params.set('category', categoryFilter);
      }
      const res = await fetch(`/api/admin/templates?${params}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data || []);
        setCategories(data.categories || []);
        setTotal(data.pagination?.total || 0);
        setStats(data.stats || { total: 0, active: 0 });
      }
    } catch (error) {
      console.error('获取模板列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, search, categoryFilter]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 创建模板
  const handleCreate = () => {
    setEditingTemplate({
      id: 0,
      name: '',
      category: 'social',
      style: 'minimal',
      description: '',
      thumbnail: '',
      tags: [],
      is_active: true,
      is_featured: false,
      usage_count: 0,
      created_at: new Date().toISOString(),
    });
  };

  // 删除模板
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个模板吗？')) return;
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 保存模板
  const handleSave = async () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name || !editingTemplate.category) {
      alert('请填写必填项');
      return;
    }

    setSaving(true);
    try {
      const method = editingTemplate.id === 0 ? 'POST' : 'PUT';
      const url = editingTemplate.id === 0 
        ? '/api/admin/templates' 
        : `/api/admin/templates/${editingTemplate.id}`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  // 颜色映射
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      social: 'from-pink-100 to-rose-100',
      video: 'from-purple-100 to-violet-100',
      ecommerce: 'from-blue-100 to-sky-100',
      poster: 'from-orange-100 to-amber-100',
      document: 'from-slate-100 to-gray-100',
      logo: 'from-emerald-100 to-teal-100',
    };
    return colors[category] || 'from-slate-100 to-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">模板管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {total} 个模板</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-sm text-slate-600">
            启用中 {stats.active}
          </div>
          <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            添加模板
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索模板..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-white border-slate-200">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
            ))}
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 模板列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">暂无模板</h3>
          <p className="text-sm text-slate-400 mt-1">点击添加按钮创建第一个模板</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all">
                {/* 预览图 */}
                <div className={`h-36 bg-gradient-to-br ${getCategoryColor(template.category)} flex items-center justify-center relative`}>
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-400">{template.name.slice(0, 2)}</span>
                    </div>
                  )}
                  {template.is_featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      推荐
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full text-white ${
                    template.is_active ? 'bg-green-500' : 'bg-slate-400'
                  }`}>
                    {template.is_active ? '启用' : '禁用'}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{template.description || '暂无描述'}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </div>
                    <div className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                      {STYLE_OPTIONS.find(s => s.value === template.style)?.label || template.style}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{template.usage_count || 0} 次使用</span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                        className="text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="cursor-pointer"
              >
                上一页
              </Button>
              <span className="text-sm text-slate-500">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="cursor-pointer"
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* 编辑/创建弹窗 */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingTemplate?.id === 0 ? '添加模板' : '编辑模板'}
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">模板名称 *</Label>
                  <Input 
                    value={editingTemplate.name} 
                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    placeholder="请输入模板名称"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">分类 *</Label>
                  <Select 
                    value={editingTemplate.category} 
                    onValueChange={v => setEditingTemplate({...editingTemplate, category: v})}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">风格</Label>
                  <Select 
                    value={editingTemplate.style} 
                    onValueChange={v => setEditingTemplate({...editingTemplate, style: v})}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">缩略图URL</Label>
                  <Input 
                    value={editingTemplate.thumbnail || ''} 
                    onChange={e => setEditingTemplate({...editingTemplate, thumbnail: e.target.value})}
                    placeholder="https://..."
                    className="border-slate-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-700">描述</Label>
                <Textarea 
                  value={editingTemplate.description || ''} 
                  onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                  placeholder="请输入模板描述"
                  rows={3}
                  className="border-slate-200"
                />
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingTemplate.is_active}
                    onCheckedChange={v => setEditingTemplate({...editingTemplate, is_active: v})}
                  />
                  <Label className="text-slate-700">启用</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingTemplate.is_featured}
                    onCheckedChange={v => setEditingTemplate({...editingTemplate, is_featured: v})}
                  />
                  <Label className="text-slate-700">推荐</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)} className="cursor-pointer">取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 cursor-pointer">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
