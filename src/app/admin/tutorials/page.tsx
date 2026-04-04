'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye, ThumbsUp, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';

interface Tutorial {
  id: number;
  title: string;
  content: string;
  tool_id: number | null;
  category: string;
  difficulty: string;
  cover_image: string | null;
  author: string | null;
  status: string;
  views: number;
  likes: number;
  created_at: string;
  tools?: { id: number; name: string; logo: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const CATEGORIES = [
  '视频生成', '数字人', '视频编辑', 'AI绘画', 'AI聊天', 
  'AI配音', 'AI写作', 'AI编程', 'AI音频', 'AI办公', 
  'AI搜索', 'AI营销', 'AI学习', '其他'
];

const DIFFICULTY_COLORS: Record<string, string> = {
  '入门': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '进阶': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '高级': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const STATUS_COLORS: Record<string, string> = {
  'published': 'bg-green-100 text-green-700',
  'draft': 'bg-slate-100 text-slate-700',
};

export default function TutorialsAdminPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });
  
  // 编辑弹窗
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    difficulty: '入门',
    cover_image: '',
    author: '',
    status: 'published'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.status) params.set('status', filters.status);
      
      const res = await fetch(`/api/admin/tutorials?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTutorials(data.data);
        setPagination(prev => ({ ...prev, total: data.pagination.total, total_pages: data.pagination.total_pages }));
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个教程吗？')) return;
    
    try {
      const res = await fetch(`/api/admin/tutorials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchData();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const openEditDialog = (tutorial?: Tutorial) => {
    if (tutorial) {
      setEditingTutorial(tutorial);
      setFormData({
        title: tutorial.title,
        content: tutorial.content,
        category: tutorial.category,
        difficulty: tutorial.difficulty,
        cover_image: tutorial.cover_image || '',
        author: tutorial.author || '',
        status: tutorial.status
      });
    } else {
      setEditingTutorial(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        difficulty: '入门',
        cover_image: '',
        author: '',
        status: 'published'
      });
    }
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('请填写必填项');
      return;
    }

    try {
      const url = '/api/admin/tutorials';
      const method = editingTutorial ? 'PUT' : 'POST';
      const body = editingTutorial 
        ? { ...formData, id: editingTutorial.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowEditDialog(false);
        fetchData();
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">教程管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            共 {pagination.total} 个教程
          </p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          添加教程
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索标题、作者..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="dark:bg-slate-700"
              />
            </div>
            <Select value={filters.category} onValueChange={(v) => setFilters(prev => ({ ...prev, category: v }))}>
              <SelectTrigger className="w-[150px] dark:bg-slate-700">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
              <SelectTrigger className="w-[120px] dark:bg-slate-700">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({ search: '', category: '', status: '' })}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : tutorials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无教程数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">标题</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">分类</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">难度</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">作者</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300">浏览/点赞</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {tutorials.map(tutorial => (
                    <tr key={tutorial.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {tutorial.cover_image ? (
                            <img src={tutorial.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-orange-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white line-clamp-1">{tutorial.title}</p>
                            {tutorial.tools && (
                              <p className="text-xs text-slate-500">{tutorial.tools.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{tutorial.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${DIFFICULTY_COLORS[tutorial.difficulty] || ''}`}>
                          {tutorial.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {tutorial.author || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-300">
                        <span className="flex items-center justify-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {tutorial.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {tutorial.likes}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[tutorial.status] || ''}`}>
                          {tutorial.status === 'published' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(tutorial)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tutorial.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500">
            {pagination.page} / {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.total_pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTutorial ? '编辑教程' : '添加教程'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                标题 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="教程标题"
                className="dark:bg-slate-700"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                内容 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="支持HTML格式..."
                rows={10}
                className="dark:bg-slate-700"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  分类 <span className="text-red-500">*</span>
                </label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="dark:bg-slate-700">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  难度 <span className="text-red-500">*</span>
                </label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}>
                  <SelectTrigger className="dark:bg-slate-700">
                    <SelectValue placeholder="选择难度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="入门">入门</SelectItem>
                    <SelectItem value="进阶">进阶</SelectItem>
                    <SelectItem value="高级">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  封面图
                </label>
                <Input
                  value={formData.cover_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                  placeholder="封面图URL"
                  className="dark:bg-slate-700"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  作者
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="作者名称"
                  className="dark:bg-slate-700"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                状态
              </label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="dark:bg-slate-700 w-[150px]">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
