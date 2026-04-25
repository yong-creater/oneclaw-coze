'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen, FileText, Clipboard, Loader2 } from 'lucide-react';
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
import { ImageUploader } from '@/components/tools/ImageUploader';
import { toast } from 'sonner';

const CATEGORIES = [
  '入门教程', '进阶技巧', '案例分享', 'API对接', '最佳实践', '常见问题', '其他'
];

// 简单的 Markdown 转 HTML
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // 链接
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // 图片
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;" />');
  
  // 列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // 段落
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  
  return html;
}

// 检测内容格式
function detectFormat(content: string): 'html' | 'markdown' | 'plain' {
  if (content.includes('<html') || content.includes('<p>') || content.includes('<div>')) {
    return 'html';
  }
  if (content.includes('# ') || content.includes('**') || content.includes('- ')) {
    return 'markdown';
  }
  return 'plain';
}

// 富文本内容编辑器（支持粘贴图片和拖拽上传）
function RichContentEditor({ 
  value, 
  onChange,
  onFormatChange,
  format 
}: { 
  value: string; 
  onChange: (html: string) => void;
  onFormatChange: (format: 'html' | 'markdown' | 'plain') => void;
  format: 'html' | 'markdown' | 'plain';
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return null;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'tutorials');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success('图片上传成功');
        return data.data.url;
      } else {
        toast.error(data.error || '上传失败');
        return null;
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file && textareaRef.current) {
          const url = await uploadImage(file);
          if (url) {
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const imgHtml = `\n<img src="${url}" alt="图片" style="max-width:100%;border-radius:8px;margin:16px 0;" />\n`;
            const newValue = value.substring(0, start) + imgHtml + value.substring(end);
            onChange(newValue);
            onFormatChange('html');
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + imgHtml.length;
              textarea.focus();
            }, 0);
          }
        }
        break;
      }
    }
  }, [value, onChange, onFormatChange, uploadImage]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadImage(file);
      if (url && textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imgHtml = `\n<img src="${url}" alt="图片" style="max-width:100%;border-radius:8px;margin:16px 0;" />\n`;
        const newValue = value.substring(0, start) + imgHtml + value.substring(end);
        onChange(newValue);
        onFormatChange('html');
      }
    }
  }, [value, onChange, onFormatChange, uploadImage]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="支持粘贴 Markdown 自动转 HTML，或直接粘贴/拖拽图片..."
        rows={25}
        className="dark:bg-slate-700 font-mono text-sm min-h-[500px]"
      />
      
      {/* 上传指示器 */}
      {uploading && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-white bg-slate-800 px-4 py-2 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>图片上传中...</span>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-1">
        提示：可以直接粘贴截图，或拖拽图片上传。支持 Markdown 自动转换。
      </p>
    </div>
  );
}

export default function NewTutorialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    difficulty: '入门',
    cover_image: '',
    author: '数字牧民',
    status: 'published'
  });
  const [contentFormat, setContentFormat] = useState<'html' | 'markdown' | 'plain'>('html');
  const [showFormatHint, setShowFormatHint] = useState(false);

  // 检测内容格式变化
  useEffect(() => {
    if (formData.content) {
      setContentFormat(detectFormat(formData.content));
    }
  }, [formData.content]);

  // 手动转换
  const handleConvert = () => {
    if (contentFormat === 'markdown') {
      const html = markdownToHtml(formData.content);
      setFormData(prev => ({ ...prev, content: html }));
      setContentFormat('html');
      toast.success('已转换为 HTML');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      toast.error('请填写必填项');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/tutorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('教程创建成功');
        router.push('/admin/tutorials');
      } else {
        toast.error('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建失败:', error);
      toast.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">添加教程</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              创建一个新的教程
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading ? (
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  内容 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {contentFormat === 'markdown' && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={handleConvert}
                      className="text-orange-500 border-orange-200 hover:bg-orange-50"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      转换为 HTML
                    </Button>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    contentFormat === 'html' ? 'bg-green-100 text-green-600' :
                    contentFormat === 'markdown' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {contentFormat === 'html' ? 'HTML' : contentFormat === 'markdown' ? 'Markdown' : '纯文本'}
                  </span>
                </div>
              </div>
              <RichContentEditor
                value={formData.content}
                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                onFormatChange={setContentFormat}
                format={contentFormat}
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
                <ImageUploader 
                  value={formData.cover_image}
                  onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
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
      </form>
    </div>
  );
}
