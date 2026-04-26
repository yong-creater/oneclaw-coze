'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  LayoutTemplate, Plus, Edit2, Trash2, Star, Image, 
  Search, Filter, Eye, EyeOff, Upload, ExternalLink, Copy
} from 'lucide-react';
import { toast } from 'sonner';

// 模板类型配置
const TEMPLATE_TYPES = [
  { value: 'xhs_post', label: '小红书帖子' },
  { value: 'goods_poster', label: '商品海报' },
  { value: 'portrait', label: 'AI写真' },
  { value: 'background_removal', label: '抠图' },
  { value: 'resume', label: '简历优化' },
  { value: 'novel', label: '小说创作' },
  { value: 'script', label: '推文脚本' },
];

interface Template {
  id: number;
  name: string;
  description: string;
  template_type: string;
  category: string;
  thumbnail: string;
  content: any;
  params: any;
  tags: string[];
  usage_count: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_type: 'xhs_post',
    category: '',
    thumbnail: '',
    content: '',
    tags: '',
  });

  // 加载数据
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.set('type', filterType);
      }
      
      const res = await fetch(`/api/admin/templates?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('获取模板失败:', error);
      toast.error('获取模板失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  // 搜索过滤
  const filteredTemplates = templates.filter(t => {
    const matchKeyword = !searchKeyword || 
      t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchKeyword;
  });

  // 打开弹窗
  const openDialog = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        template_type: template.template_type,
        category: template.category || '',
        thumbnail: template.thumbnail || '',
        content: template.content ? JSON.stringify(template.content, null, 2) : '',
        tags: template.tags?.join(', ') || '',
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        template_type: 'xhs_post',
        category: '',
        thumbnail: '',
        content: '',
        tags: '',
      });
    }
    setDialogOpen(true);
  };

  // 保存
  const handleSave = async () => {
    if (!formData.name || !formData.template_type) {
      toast.error('请填写必填项');
      return;
    }

    setSaving(true);
    try {
      let content = null;
      if (formData.content) {
        try {
          content = JSON.parse(formData.content);
        } catch {
          toast.error('模板内容JSON格式错误');
          setSaving(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        template_type: formData.template_type,
        category: formData.category,
        thumbnail: formData.thumbnail,
        content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const url = editingTemplate 
        ? `/api/admin/templates/${editingTemplate.id}` 
        : '/api/admin/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingTemplate ? '更新成功' : '创建成功');
        setDialogOpen(false);
        fetchTemplates();
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

  // 删除
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该模板吗？')) return;

    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('删除成功');
        fetchTemplates();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 切换精选
  const toggleFeatured = async (template: Template) => {
    try {
      const res = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !template.is_featured }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(template.is_featured ? '已取消精选' : '已设为精选');
        fetchTemplates();
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 复制模板内容
  const copyContent = (content: any) => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  // 按类型分组统计
  const typeStats = TEMPLATE_TYPES.map(type => ({
    ...type,
    count: templates.filter(t => t.template_type === type.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">模板库管理</h2>
          <p className="text-sm text-slate-500">管理各工具的模板，支持一键复刻生成</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          新增模板
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {typeStats.map(type => (
          <Card 
            key={type.value} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              filterType === type.value ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{type.count}</div>
              <div className="text-xs text-slate-500 mt-1 truncate">{type.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索模板名称、描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {TEMPLATE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">缩略图</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="w-28">类型</TableHead>
                <TableHead className="w-20">精选</TableHead>
                <TableHead className="w-20">使用</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    暂无模板
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map(template => (
                  <TableRow key={template.id}>
                    <TableCell>
                      {template.thumbnail ? (
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <LayoutTemplate className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">
                        {template.description || '暂无描述'}
                      </div>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {template.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TEMPLATE_TYPES.find(t => t.value === template.template_type)?.label || template.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleFeatured(template)}
                        className={template.is_featured ? 'text-orange-500' : ''}
                      >
                        <Star className={`w-4 h-4 ${template.is_featured ? 'fill-current' : ''}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {template.usage_count || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(template)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {template.content && (
                          <Button variant="ghost" size="icon" onClick={() => copyContent(template.content)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? '编辑模板' : '新增模板'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  模板名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模板名称"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  模板类型 <span className="text-red-500">*</span>
                </label>
                <Select value={formData.template_type} onValueChange={(v) => setFormData({ ...formData, template_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">模板描述</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入模板描述"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">分类</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="如：营销、职场、生活"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">标签</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="多个标签用逗号分隔"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">缩略图URL</label>
              <div className="flex gap-2">
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="请输入图片URL"
                  className="flex-1"
                />
                {formData.thumbnail && (
                  <img 
                    src={formData.thumbnail} 
                    alt="预览"
                    className="w-12 h-12 object-cover rounded-lg border"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                模板内容 <span className="text-xs text-slate-500">(JSON格式，用于复刻时预填参数)</span>
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={'{\n  "prompt": "...",\n  "style": "..."\n}'}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
