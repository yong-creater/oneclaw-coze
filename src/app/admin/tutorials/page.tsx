'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Tutorial {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  view_count: number;
  is_published: boolean;
}

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const res = await fetch('/api/admin/tutorials');
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tutorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          tags: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTutorials();
        setShowForm(false);
        setFormData({ title: '', summary: '', content: '', category: '' });
      }
    } catch (error) {
      console.error('Failed to create tutorial:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">教程管理</h1>
          <p className="text-sm text-[var(--muted-foreground)]">管理AI教程内容</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          添加教程
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>添加新教程</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="教程标题"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">简介</label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="简短介绍"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">内容</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="教程正文内容..."
                  required
                  className="mt-1 min-h-[200px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">分类</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="如：入门、进阶、实战"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">保存</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{tutorial.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {tutorial.summary || '暂无简介'}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                      <span>浏览 {tutorial.view_count || 0} 次</span>
                      <span>分类: {tutorial.category || '未分类'}</span>
                      <span className={tutorial.is_published ? 'text-green-500' : 'text-amber-500'}>
                        {tutorial.is_published ? '已发布' : '草稿'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
