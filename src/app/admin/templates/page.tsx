'use client';

import { useState } from 'react';
import { 
  Star, Plus, Search, Edit2, Trash2, 
  Eye, EyeOff, Copy, Check, X,
  Upload, Image as ImageIcon, Filter, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 模板类型
interface Template {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  color: string;
  tags: string[];
  uses: number;
  isActive: boolean;
  createdAt: string;
}

// 示例数据
const INITIAL_TEMPLATES: Template[] = [
  { id: 1, name: '可爱头像模板', category: 'avatar', thumbnail: '', color: 'from-pink-100 to-rose-100', tags: ['热门', '可爱'], uses: 2847, isActive: true, createdAt: '2024-01-15' },
  { id: 2, name: '商务简历形象照', category: 'resume', thumbnail: '', color: 'from-sky-100 to-blue-100', tags: ['推荐'], uses: 1923, isActive: true, createdAt: '2024-01-14' },
  { id: 3, name: '小红书爆款封面', category: 'cover', thumbnail: '', color: 'from-orange-100 to-amber-100', tags: ['热门'], uses: 3521, isActive: true, createdAt: '2024-01-13' },
  { id: 4, name: '端午节日海报', category: 'poster', thumbnail: '', color: 'from-green-100 to-emerald-100', tags: ['节日'], uses: 1456, isActive: false, createdAt: '2024-01-12' },
  { id: 5, name: '餐饮美食菜单', category: 'menu', thumbnail: '', color: 'from-amber-100 to-orange-100', tags: ['实用'], uses: 987, isActive: true, createdAt: '2024-01-11' },
  { id: 6, name: '抖音视频封面', category: 'cover', thumbnail: '', color: 'from-purple-100 to-pink-100', tags: ['热门', '新版'], uses: 2109, isActive: true, createdAt: '2024-01-10' },
  { id: 7, name: '商品展示详情页', category: 'product', thumbnail: '', color: 'from-cyan-100 to-sky-100', tags: ['电商'], uses: 876, isActive: true, createdAt: '2024-01-09' },
  { id: 8, name: '简约商务名片', category: 'resume', thumbnail: '', color: 'from-slate-100 to-gray-100', tags: ['商务'], uses: 654, isActive: false, createdAt: '2024-01-08' },
];

const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'avatar', name: '头像模板' },
  { id: 'cover', name: '封面模板' },
  { id: 'poster', name: '海报模板' },
  { id: 'menu', name: '菜单模板' },
  { id: 'resume', name: '简历模板' },
  { id: 'product', name: '商品详情' },
  { id: 'social', name: '社交媒体' },
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 筛选
  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // 显示提示
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // 切换选中
  const toggleSelect = (id: number) => {
    setSelectedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(filteredTemplates.map(t => t.id)));
    }
  };

  // 删除模板
  const deleteTemplate = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast('删除成功');
  };

  // 批量删除
  const batchDelete = () => {
    setTemplates(prev => prev.filter(t => !selectedTemplates.has(t.id)));
    setSelectedTemplates(new Set());
    showToast('批量删除成功');
  };

  // 切换状态
  const toggleStatus = (id: number) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
    showToast('状态已更新');
  };

  // 复制模板
  const copyTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Math.max(...templates.map(t => t.id)) + 1,
      name: `${template.name} (副本)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [...prev, newTemplate]);
    showToast('复制成功');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">模板管理</h2>
          <p className="text-sm text-slate-500 mt-1">管理设计模板库</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          添加模板
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-800">{templates.length}</div>
            <div className="text-sm text-slate-500">模板总数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{templates.filter(t => t.isActive).length}</div>
            <div className="text-sm text-slate-500">已上架</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-400">{templates.filter(t => !t.isActive).length}</div>
            <div className="text-sm text-slate-500">已下架</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{templates.reduce((sum, t) => sum + t.uses, 0).toLocaleString()}</div>
            <div className="text-sm text-slate-500">总使用次数</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索模板名称..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {selectedTemplates.size > 0 && (
              <Button variant="destructive" size="sm" onClick={batchDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                批量删除 ({selectedTemplates.size})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>模板列表</CardTitle>
            <span className="text-sm text-slate-500">
              共 {filteredTemplates.length} 个模板
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.size === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">模板</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">分类</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">标签</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">使用次数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">创建时间</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map(template => (
                  <tr key={template.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.has(template.id)}
                        onChange={() => toggleSelect(template.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-sm font-bold text-white/50">{template.name.slice(0, 2)}</span>
                        </div>
                        <span className="font-medium text-slate-800">{template.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {CATEGORIES.find(c => c.id === template.category)?.name || template.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{template.uses.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(template.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {template.isActive ? '已上架' : '已下架'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{template.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyTemplate(template)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          title="复制"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 添加/编辑弹窗 */}
      <Dialog open={showAddDialog || !!editingTemplate} onOpenChange={() => {
        setShowAddDialog(false);
        setEditingTemplate(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? '编辑模板' : '添加模板'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
              <Input 
                defaultValue={editingTemplate?.name || ''} 
                placeholder="请输入模板名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
              <select 
                defaultValue={editingTemplate?.category || 'avatar'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">标签</label>
              <Input 
                defaultValue={editingTemplate?.tags.join(', ') || ''} 
                placeholder="多个标签用逗号分隔，如：热门,推荐"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">缩略图</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors cursor-pointer">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">点击或拖拽上传图片</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">颜色渐变</label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  'from-pink-100 to-rose-100',
                  'from-sky-100 to-blue-100',
                  'from-orange-100 to-amber-100',
                  'from-green-100 to-emerald-100',
                  'from-purple-100 to-pink-100',
                  'from-cyan-100 to-sky-100',
                ].map(color => (
                  <div
                    key={color}
                    className={`h-8 rounded-lg bg-gradient-to-br ${color} cursor-pointer border-2 border-transparent hover:border-orange-400`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingTemplate(null);
            }}>
              取消
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                showToast(editingTemplate ? '保存成功' : '添加成功');
                setShowAddDialog(false);
                setEditingTemplate(null);
              }}
            >
              {editingTemplate ? '保存' : '添加'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
