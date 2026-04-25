'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Grid3X3, Trash2, Loader2, Eye, Star, ExternalLink } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">工具管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {total} 个工具</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          添加工具
        </Button>
      </div>

      {/* 搜索 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索工具..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
      </div>

      {/* 工具列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Grid3X3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">暂无工具</h3>
          <p className="text-sm text-slate-400 mt-1">点击添加按钮创建第一个工具</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Card key={tool.id} className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden">
                {/* 预览图 */}
                <div className={`h-28 bg-gradient-to-br ${tool.color || 'from-slate-100 to-slate-200'} flex items-center justify-center relative`}>
                  <div className="w-14 h-14 rounded-2xl bg-white/90 flex items-center justify-center text-2xl font-bold text-slate-700">
                    {tool.icon || tool.name.slice(0, 2)}
                  </div>
                  {tool.is_featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      推荐
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full text-white ${
                    tool.free_type === 'free' ? 'bg-green-500' :
                    tool.free_type === 'limited' ? 'bg-blue-500' :
                    'bg-slate-500'
                  }`}>
                    {tool.free_type === 'free' ? '免费' : tool.free_type === 'limited' ? '限免' : '付费'}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{tool.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{tool.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md">{tool.categories?.name || '未分类'}</span>
                    <span>{tool.usage_count || 0} 次使用</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <a href={tool.tool_url || '#'} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent cursor-pointer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        访问
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingTool(tool)}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

      {/* 编辑弹窗 */}
      <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">编辑工具</DialogTitle>
          </DialogHeader>
          {editingTool && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">工具名称</Label>
                  <Input 
                    value={editingTool.name} 
                    onChange={e => setEditingTool({...editingTool, name: e.target.value})}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">所属分类</Label>
                  <Select 
                    value={editingTool.category_id.toString()} 
                    onValueChange={v => setEditingTool({...editingTool, category_id: parseInt(v)})}
                  >
                    <SelectTrigger className="border-slate-200">
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
                <Label className="text-slate-700">描述</Label>
                <Textarea 
                  value={editingTool.description || ''} 
                  onChange={e => setEditingTool({...editingTool, description: e.target.value})}
                  rows={3}
                  className="border-slate-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">厂商/来源</Label>
                  <Input 
                    value={editingTool.producer || ''} 
                    onChange={e => setEditingTool({...editingTool, producer: e.target.value})}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">访问地址</Label>
                  <Input 
                    value={editingTool.tool_url || ''} 
                    onChange={e => setEditingTool({...editingTool, tool_url: e.target.value})}
                    className="border-slate-200"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">免费类型</Label>
                  <Select 
                    value={editingTool.free_type || 'paid'} 
                    onValueChange={v => setEditingTool({...editingTool, free_type: v})}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">完全免费</SelectItem>
                      <SelectItem value="limited">限免</SelectItem>
                      <SelectItem value="paid">付费</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingTool.is_featured}
                      onCheckedChange={v => setEditingTool({...editingTool, is_featured: v})}
                    />
                    <Label className="text-slate-700">推荐</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editingTool.is_active}
                      onCheckedChange={v => setEditingTool({...editingTool, is_active: v})}
                    />
                    <Label className="text-slate-700">启用</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTool(null)} className="cursor-pointer">取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 cursor-pointer">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
