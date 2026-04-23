'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Skill {
  id: number;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  usage_count: number;
  is_featured: boolean;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    tags: '',
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/admin/skills');
      const data = await res.json();
      if (data.success) {
        setSkills(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSkills();
        setShowForm(false);
        setFormData({ title: '', description: '', prompt: '', tags: '' });
      }
    } catch (error) {
      console.error('Failed to create skill:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">技能管理</h1>
          <p className="text-sm text-[var(--muted-foreground)]">管理AI技能和提示词</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          添加技能
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>添加新技能</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="技能标题"
                  required
                  className="mt-1"
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
                <label className="text-sm font-medium">标签（逗号分隔）</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="写作, 代码, 图像"
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
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{skill.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {skill.description || '暂无描述'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {skill.tags?.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--secondary)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      使用 {skill.usage_count || 0} 次
                    </span>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
