'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Prompt {
  id: number;
  title: string;
  prompt: string;
  description: string;
  category: string;
  tags: string[];
  usage_count: number;
  likes_count: number;
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    description: '',
    category: '',
    tags: '',
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/admin/prompts');
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPrompts();
        setShowForm(false);
        setFormData({ title: '', prompt: '', description: '', category: '', tags: '' });
      }
    } catch (error) {
      console.error('Failed to create prompt:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">提示词管理</h1>
          <p className="text-sm text-[var(--muted-foreground)]">管理AI提示词库</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          添加提示词
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="提示词标题"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">提示词内容</label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="输入完整的提示词..."
                  required
                  className="mt-1 min-h-[150px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">描述</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简短描述"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">分类</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="如：写作、代码、图像"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">标签（逗号分隔）</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="AI, 写作, 助手"
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
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{prompt.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {prompt.description || '暂无描述'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {prompt.tags?.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--secondary)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                      <span>使用 {prompt.usage_count || 0} 次</span>
                      <span>收藏 {prompt.likes_count || 0} 次</span>
                      <span>分类: {prompt.category || '未分类'}</span>
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
