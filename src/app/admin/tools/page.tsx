'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, ExternalLink, Grid3X3, Trash2, Loader2, MoreHorizontal, Eye, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Tool {
  id: number;
  name: string;
  description: string;
  producer: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  is_active: boolean;
  tool_url: string;
  icon: string;
  color: string;
  usage_count: number;
  created_at: string;
  categories?: { id: number; name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ToolsAdminPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [saving, setSaving] = useState(false);

  // 获取工具列表
  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: search,
      });
      const res = await fetch(`/api/admin/tools?${params}`);
      const data = await res.json();
      if (data.success) {
        setTools(data.data || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('获取工具列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, [page, search]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 删除工具
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个工具吗？')) return;
    try {
      const res = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTools();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editingTool) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tools/${editingTool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTool),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTool(null);
        fetchTools();
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
  const colorMap: Record<string, string> = {
    'from-pink-100 to-rose-100': 'bg-pink-100 text-pink-600',
    'from-sky-100 to-blue-100': 'bg-sky-100 text-sky-600',
    'from-purple-100 to-pink-100': 'bg-purple-100 text-purple-600',
    'from-amber-100 to-orange-100': 'bg-amber-100 text-amber-600',
    'from-emerald-100 to-teal-100': 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">工具管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理 AI 工具，共 {total} 个工具</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加工具
        </Button>
      </div>

      {/* 搜索 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索工具名称、厂商或亮点..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-slate-500">共 {total} 条</span>
      </div>

      {/* 工具列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-20">
          <Grid3X3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">暂无工具</h3>
          <p className="text-sm text-slate-400 mt-1">点击添加按钮创建第一个工具</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Card key={tool.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* 预览图 */}
                <div className={`h-32 bg-gradient-to-br ${tool.color || 'from-slate-100 to-slate-200'} flex items-center justify-center relative`}>
                  <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center text-2xl">
                    {tool.icon || tool.name.slice(0, 2)}
                  </div>
                  {tool.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      推荐
                    </Badge>
                  )}
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      tool.free_type === 'free' ? 'bg-green-500 text-white' :
                      tool.free_type === 'limited' ? 'bg-blue-500 text-white' :
                      'bg-slate-500 text-white'
                    }`}
                  >
                    {tool.free_type === 'free' ? '免费' : tool.free_type === 'limited' ? '限免' : '付费'}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-slate-800">{tool.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{tool.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span>{tool.categories?.name || '未分类'}</span>
                    <span>•</span>
                    <span>使用 {tool.usage_count || 0} 次</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Link href={tool.tool_url || `/tools/${tool.id}`} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        访问
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setEditingTool(tool)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(tool.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-slate-500 px-4">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* 编辑弹窗 */}
      <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑工具</DialogTitle>
          </DialogHeader>
          {editingTool && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>工具名称</Label>
                  <Input 
                    value={editingTool.name} 
                    onChange={e => setEditingTool({...editingTool, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>所属分类</Label>
                  <Select 
                    value={editingTool.category_id.toString()} 
                    onValueChange={v => setEditingTool({...editingTool, category_id: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea 
                  value={editingTool.description || ''} 
                  onChange={e => setEditingTool({...editingTool, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>厂商/来源</Label>
                  <Input 
                    value={editingTool.producer || ''} 
                    onChange={e => setEditingTool({...editingTool, producer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>访问地址</Label>
                  <Input 
                    value={editingTool.tool_url || ''} 
                    onChange={e => setEditingTool({...editingTool, tool_url: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>免费类型</Label>
                  <Select 
                    value={editingTool.free_type || 'paid'} 
                    onValueChange={v => setEditingTool({...editingTool, free_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">完全免费</SelectItem>
                      <SelectItem value="limited">限免</SelectItem>
                      <SelectItem value="paid">付费</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingTool.is_featured}
                      onCheckedChange={v => setEditingTool({...editingTool, is_featured: v})}
                    />
                    <Label>推荐</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingTool.is_active}
                      onCheckedChange={v => setEditingTool({...editingTool, is_active: v})}
                    />
                    <Label>启用</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTool(null)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
