'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Image as ImageIcon, Upload, X, Loader2, ToggleLeft, ToggleRight, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 广告位类型配置
const AD_POSITIONS = [
  { value: 'home_banner', label: '首页横幅大图', desc: '首页顶部Banner，支持多张轮播', size: '800x200' },
  { value: 'home_inline', label: '首页工具卡片间', desc: '工具列表第8个位置', size: '自适应' },
  { value: 'tool_detail', label: '工具详情页', desc: '工具详情页推荐位', size: '自适应' },
];

interface Advertisement {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url: string;
  position: string;
  priority: number;
  clicks: number;
  impressions: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_highlight?: boolean;
  target_category?: string;
  created_at: string;
}

// 图片上传组件
function ImageUploader({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'ads');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        onChange(data.data.url);
        setPreview(data.data.url);
        toast.success('图片上传成功');
      } else {
        toast.error(data.error || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  };

  const handleUrlConfirm = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setPreview(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {/* 预览区域 */}
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
          <img 
            src={preview} 
            alt="预览" 
            className="w-full h-32 object-cover" 
            onError={() => setPreview('')}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="上传新图片"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="p-1.5 bg-slate-500 text-white rounded-full hover:bg-slate-600 transition-colors"
              title="输入URL"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setPreview(''); onChange(''); }}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="删除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-300 transition-colors",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">点击上传 / 拖拽图片</p>
              <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG、WebP，最大 5MB</p>
            </>
          )}
        </div>
      )}

      {/* URL输入弹窗 */}
      <Dialog open={showUrlInput} onOpenChange={setShowUrlInput}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>输入图片地址</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/ad.jpg"
              className="dark:bg-slate-700"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUrlInput(false)}>取消</Button>
            <Button onClick={handleUrlConfirm} className="bg-slate-1000 hover:bg-slate-700">确认</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // 表单状态
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'home_banner',
    priority: 0,
    starts_at: '',
    ends_at: '',
    is_highlight: false,
    target_category: '',
  });

  // 获取广告列表
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads?t=' + Date.now());
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
    if (!form.title || !form.link_url || !form.position || !form.starts_at || !form.ends_at) {
      toast.error('请填写必填项');
      return;
    }

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
        toast.success(editingAd ? '广告更新成功' : '广告添加成功');
        fetchAds();
        setDialogOpen(false);
        setEditingAd(null);
        resetForm();
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('保存广告失败:', error);
      toast.error('保存失败');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      priority: ad.priority,
      starts_at: ad.starts_at.slice(0, 16),
      ends_at: ad.ends_at.slice(0, 16),
      is_highlight: ad.is_highlight || false,
      target_category: ad.target_category || '',
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
      toast.success(ad.is_active ? '广告已禁用' : '广告已启用');
    } catch (error) {
      console.error('切换状态失败:', error);
      toast.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个广告吗？')) return;
    
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('广告已删除');
        fetchAds();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      position: 'home_banner',
      priority: 0,
      starts_at: '',
      ends_at: '',
      is_highlight: false,
      target_category: '',
    });
  };

  const getPositionConfig = (position: string) => {
    return AD_POSITIONS.find(p => p.value === position);
  };

  // 按位置分组显示
  const groupedAds = AD_POSITIONS.map(pos => ({
    ...pos,
    ads: ads.filter(ad => ad.position === pos.value),
  }));

  return (
    <div className="space-y-6">
      {/* 标题和操作 */}
      <div className="flex items-center justify-between">
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
          className="bg-gradient-to-r slate-600 dark:bg-slate-500 hover:bg-slate-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加广告
        </Button>
      </div>

        {/* 广告位置说明 */}
        <Card className="bg-slate-100 dark:bg-slate-800 mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3">广告位说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {AD_POSITIONS.map(pos => (
                <div key={pos.value} className="flex items-start gap-2">
                  <Badge variant="outline" className="flex-shrink-0 mt-0.5">{pos.value}</Badge>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{pos.label}</p>
                    <p className="text-xs text-slate-500">{pos.desc} ({pos.size})</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 广告列表 - 按位置分组 */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">加载中...</div>
        ) : (
          <div className="space-y-6">
            {groupedAds.map(group => (
              <Card key={group.value} className="bg-white dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{group.label}</CardTitle>
                      <Badge variant="secondary">{group.ads.length} 个广告</Badge>
                    </div>
                    <span className="text-xs text-slate-500">尺寸: {group.size}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{group.desc}</p>
                </CardHeader>
                <CardContent>
                  {group.ads.length > 0 ? (
                    <div className="space-y-3">
                      {group.ads.map(ad => (
                        <div key={ad.id} className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          {/* 预览图 */}
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-600 flex-shrink-0">
                            {ad.image_url ? (
                              <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>

                          {/* 信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                {ad.title}
                              </h4>
                              <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                                {ad.is_active ? '启用' : '禁用'}
                              </Badge>
                              {ad.is_highlight && (
                                <Badge variant="outline" className="text-slate-600 border-slate-300">置顶</Badge>
                              )}
                            </div>
                            {ad.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
                                {ad.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {ad.impressions}
                              </span>
                              <span className="flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                {ad.clicks}
                              </span>
                              <span>优先级: {ad.priority}</span>
                              <span>
                                {new Date(ad.starts_at).toLocaleDateString()} - {new Date(ad.ends_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* 操作 */}
                          <div className="flex items-center gap-2">
                            {/* 开关 */}
                            <button
                              onClick={() => handleToggle(ad)}
                              className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                                ad.is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                              title={ad.is_active ? '点击禁用' : '点击启用'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  ad.is_active ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(ad.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      暂无广告，点击上方按钮添加
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? '编辑广告' : '添加广告'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* 广告图片 */}
            <div>
              <label className="text-sm font-medium mb-2 block">广告图片</label>
              <ImageUploader
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
              <p className="text-xs text-slate-500 mt-1">建议尺寸：{getPositionConfig(form.position)?.size || '自适应'}</p>
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  广告标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="输入广告标题"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">广告描述</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="简短描述（选填）"
                  rows={2}
                  className="dark:bg-slate-700"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  跳转链接 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  广告位置 <span className="text-red-500">*</span>
                </label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_POSITIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
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
                  placeholder="数字越大越靠前"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  开始时间 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  结束时间 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                />
              </div>
            </div>

            {/* 其他选项 */}
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_highlight}
                  onChange={(e) => setForm({ ...form, is_highlight: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm">置顶显示</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r slate-600 dark:bg-slate-500 hover:bg-slate-700"
            >
              {editingAd ? '保存修改' : '添加广告'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
