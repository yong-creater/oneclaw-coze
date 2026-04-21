'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  type?: string;
}

export function ImageUploader({ value, onChange, className = '', type = 'images' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
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
      formData.append('type', type);

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

  const handleUrlConfirm = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setPreview(urlInput.trim());
      setUrlInputOpen(false);
      setUrlInput('');
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="预览" 
            className="w-48 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600" 
            onError={() => setPreview(undefined)}
          />
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
              title="上传新图片"
            >
              <Upload className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setUrlInputOpen(true)}
              className="w-6 h-6 bg-slate-500 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
              title="输入图片URL"
            >
              <LinkIcon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              title="删除图片"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-400 dark:hover:border-orange-400 transition-colors",
            uploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-slate-400 mb-1 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-slate-400 mb-1" />
          )}
          <span className="text-xs text-slate-500">点击上传/拖拽图片</span>
        </div>
      )}

      {/* URL输入弹窗 */}
      <Dialog open={urlInputOpen} onOpenChange={setUrlInputOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>输入图片地址</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="请输入图片URL，如 https://example.com/image.jpg"
              className="dark:bg-slate-700"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
            />
            <p className="text-xs text-slate-500 mt-2">
              支持任意公开可访问的图片URL
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUrlInputOpen(false)}>取消</Button>
            <Button onClick={handleUrlConfirm} className="bg-orange-500 hover:bg-orange-600">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
