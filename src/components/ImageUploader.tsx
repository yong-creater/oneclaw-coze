'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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

  return (
    <div className={className}>
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="预览" 
            className="w-48 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600" 
            onError={() => setPreview('/placeholder.png')}
          />
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => setUrlInputOpen(true)}
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
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
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUrlInputOpen(true)}
            className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-400 dark:hover:border-orange-400 transition-colors"
          >
            <LinkIcon className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-xs text-slate-500">输入URL</span>
          </button>
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
