'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 预览本地图片
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success && data.url) {
        onChange(data.url);
        URL.revokeObjectURL(localPreview);
        setPreview(data.url);
      } else {
        alert('上传失败: ' + (data.error || '未知错误'));
        setPreview(value);
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败');
      setPreview(value);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="预览" 
            className="w-48 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600" 
          />
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
              title="更换图片"
            >
              <Upload className="w-3 h-3" />
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
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-400 dark:hover:border-orange-400 transition-colors"
        >
          {uploading ? (
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">点击上传</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
