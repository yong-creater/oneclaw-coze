'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
}

const CATEGORIES = [
  'AI创作', 'AI办公', 'AI设计', 'AI开发', 'AI营销', 'AI学习'
];

export default function NewToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    url: '',
    category: '',
    is_featured: false,
    is_active: true,
  });

  // 自动生成 slug
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/admin/tools');
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 返回按钮 */}
      <Link href="/admin/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Link>

      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold">添加工具</h2>
        <p className="text-sm text-muted-foreground">创建新的 AI 工具</p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 名称 */}
            <div>
              <label className="block text-sm font-medium mb-2">工具名称 *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：简历优化"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">URL Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="resume-optimizer"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                访问路径：/tools/{formData.slug || 'slug'}
              </p>
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">描述 *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="工具功能描述..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors text-sm resize-none"
                rows={3}
                required
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium mb-2">分类 *</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm border-2 transition-colors",
                      formData.category === cat
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 图标 */}
            <div>
              <label className="block text-sm font-medium mb-2">图标 (emoji)</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📄"
                className="w-24 text-center text-2xl"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium mb-2">访问链接</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* 设置 */}
            <div className="flex items-center gap-6 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm">精选工具</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm">上线发布</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href="/admin/tools">
            <Button variant="outline" type="button">取消</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  );
}
