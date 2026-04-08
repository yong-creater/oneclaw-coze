'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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
}

const CATEGORIES = [
  '入门教程', '进阶技巧', '案例分享', 'API对接', '最佳实践', '常见问题', '其他'
];

export default function EditTutorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    difficulty: '入门',
    cover_image: '',
    author: '',
    status: 'published'
  });

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const res = await fetch(`/api/admin/tutorials?id=${id}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const t = data.data;
          setTutorial(t);
          setFormData({
            title: t.title,
            content: t.content,
            category: t.category,
            difficulty: t.difficulty,
            cover_image: t.cover_image || '',
            author: t.author || '',
            status: t.status
          });
        } else {
          toast.error('教程不存在');
          router.push('/admin/tutorials');
        }
      } catch (error) {
        console.error('获取教程失败:', error);
        toast.error('获取教程失败');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTutorial();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      toast.error('请填写必填项');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/admin/tutorials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: parseInt(id) })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('教程保存成功');
        router.push('/admin/tutorials');
      } else {
        toast.error('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个教程吗？')) return;
    
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/tutorials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('教程删除成功');
        router.push('/admin/tutorials');
      } else {
        toast.error('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!tutorial) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tutorials">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">编辑教程</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              编辑教程基本信息
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            删除
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">
                  <BookOpen className="w-4 h-4" />
                </span>
                保存中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={15}
                className="dark:bg-slate-700 font-mono text-sm"
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
                    <SelectItem value="初级">初级</SelectItem>
                    <SelectItem value="中级">中级</SelectItem>
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
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>数据统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">浏览量</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{tutorial.views}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">点赞数</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{tutorial.likes}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">创建时间</p>
                <p className="text-lg font-medium text-slate-800 dark:text-white">
                  {new Date(tutorial.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
