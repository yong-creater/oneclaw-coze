'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wand2, Plus, Search, Pencil, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/admin/tools');
      const data = await res.json();
      if (data.success) {
        setTools(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/tools/${deleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setTools(tools.filter(t => t.id !== deleteId));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 工具管理</h2>
          <p className="text-sm text-muted-foreground">管理自建 AI 工具</p>
        </div>
        <Link href="/admin/tools/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加工具
          </Button>
        </Link>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索工具..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 工具列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">工具列表 ({filteredTools.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">暂无工具</p>
              <Link href="/admin/tools/new">
                <Button variant="outline">添加第一个工具</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">{tool.icon || '🔧'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tool.name}</span>
                        {tool.is_featured && (
                          <Badge variant="default" className="text-xs">精选</Badge>
                        )}
                        {tool.is_active ? (
                          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">已上线</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">草稿</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.url && (
                      <a href={tool.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/admin/tools/${tool.id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(tool.id)}
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

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除这个工具吗？此操作无法撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
