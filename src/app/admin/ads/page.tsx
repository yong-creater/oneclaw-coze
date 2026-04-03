'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus, Edit, Trash2, Eye, ExternalLink, Calendar,
  Image as ImageIcon, ToggleLeft, ToggleRight
} from 'lucide-react';
import Link from 'next/link';
import AnimatedLobster from '@/components/AnimatedLobster';

// 广告位类型
const AD_POSITIONS = [
  { value: 'home_banner', label: '首页横幅' },
  { value: 'sidebar', label: '侧边栏' },
  { value: 'tool_detail', label: '工具详情页' },
  { value: 'category_top', label: '分类顶部' },
];

interface Advertisement {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  priority: number;
  clicks: number;
  impressions: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // 表单状态
  const [form, setForm] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'home_banner',
    priority: 0,
    starts_at: '',
    ends_at: '',
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads');
      const data = await res.json();
      if (data.success) {
        setAds(data.data || []);
      }
    } catch (error) {
      console.error('获取广告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads';
      const method = editingAd ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (data.success) {
        fetchAds();
        setDialogOpen(false);
        setEditingAd(null);
        resetForm();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('保存广告失败:', error);
      alert('保存失败');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      priority: ad.priority,
      starts_at: ad.starts_at.slice(0, 16),
      ends_at: ad.ends_at.slice(0, 16),
    });
    setDialogOpen(true);
  };

  const handleToggle = async (ad: Advertisement) => {
    try {
      await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !ad.is_active }),
      });
      fetchAds();
    } catch (error) {
      console.error('切换状态失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个广告吗？')) return;
    
    try {
      await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
      fetchAds();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      image_url: '',
      link_url: '',
      position: 'home_banner',
      priority: 0,
      starts_at: '',
      ends_at: '',
    });
  };

  const getPositionLabel = (position: string) => {
    return AD_POSITIONS.find(p => p.value === position)?.label || position;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw Admin
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">广告管理</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">前台首页</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题和操作 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">广告管理</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              管理全站广告位，支持多种展示位置
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingAd(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加广告
          </Button>
        </div>

        {/* 广告列表 */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">加载中...</div>
        ) : ads.length > 0 ? (
          <div className="space-y-4">
            {ads.map(ad => (
              <Card key={ad.id} className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* 广告图片 */}
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                      {ad.image_url ? (
                        <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* 广告信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {ad.title}
                        </h3>
                        <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                          {ad.is_active ? '启用' : '禁用'}
                        </Badge>
                        <Badge variant="outline">{getPositionLabel(ad.position)}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">
                        {ad.link_url}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          展示 {ad.impressions}
                        </span>
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          点击 {ad.clicks}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}
                        </span>
                        <span>优先级: {ad.priority}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(ad)}
                      >
                        {ad.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ad.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">暂无广告</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">点击上方按钮添加广告</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAd ? '编辑广告' : '添加广告'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">广告标题</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="输入广告标题"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">广告图片URL</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/ad.jpg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">跳转链接</label>
              <Input
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">展示位置</label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_POSITIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">优先级</label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">开始时间</label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">结束时间</label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {editingAd ? '保存' : '添加'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
