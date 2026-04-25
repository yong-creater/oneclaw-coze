'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

interface Tutorial {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  type: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/tutorials/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTutorials(tutorials.filter(t => t.id !== deleteId));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(search.toLowerCase()) ||
    tutorial.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">教程管理</h2>
          <p className="text-sm text-muted-foreground">管理 AI 教程内容</p>
        </div>
        <Link href="/admin/tutorials/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加教程
          </Button>
        </Link>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索教程..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">教程列表 ({filteredTutorials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredTutorials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">暂无教程</p>
              <Link href="/admin/tutorials/new">
                <Button variant="outline">添加第一个教程</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{tutorial.title}</span>
                        {tutorial.is_featured && <Badge variant="default" className="text-xs">精选</Badge>}
                        {tutorial.type && <Badge variant="outline" className="text-xs">{tutorial.type}</Badge>}
                        {tutorial.category && <Badge variant="secondary" className="text-xs">{tutorial.category}</Badge>}
                        {tutorial.is_active ? (
                          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">已发布</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">草稿</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{tutorial.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/admin/tutorials/${tutorial.id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(tutorial.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认 */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">确定要删除这个教程吗？此操作无法撤销。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
