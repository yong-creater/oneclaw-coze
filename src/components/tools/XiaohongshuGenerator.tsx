'use client';

import { useState, useCallback } from 'react';
import { 
  BookOpen, Download, Loader2, Upload,
  Image as ImageIcon, Wand2, RefreshCw, 
  Check, Star, Sparkles, Hash, ArrowLeft
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface GeneratedImage {
  id: string;
  url: string;
  style: string;
  timestamp: number;
}

const STYLES = [
  { id: 'ins', name: 'Ins氛围感', colors: ['#f5f5f5', '#d4af37', '#333333'] },
  { id: 'warm', name: '温暖治愈', colors: ['#fff5e6', '#ff9a56', '#ff6b6b'] },
  { id: 'fresh', name: '清新自然', colors: ['#e8f5e9', '#81c784', '#2e7d32'] },
  { id: 'vintage', name: '复古文艺', colors: ['#faf3e0', '#8b7355', '#4a4a4a'] },
  { id: 'minimal', name: '简约高级', colors: ['#ffffff', '#000000', '#666666'] },
  { id: 'playful', name: '活泼可爱', colors: ['#ffd1dc', '#87ceeb', '#98fb98'] },
];

const SIZES = [
  { value: 'cover_34', label: '封面图 3:4' },
  { value: 'cover_11', label: '封面图 1:1' },
  { value: 'content', label: '内页图 1:1' },
];

export default function XiaohongshuGenerator() {
  const [title, setTitle] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['#分享', '#种草', '#好物推荐']);
  const [selectedStyle, setSelectedStyle] = useState('ins');
  const [selectedSize, setSelectedSize] = useState('cover_34');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleAddHashtag = () => {
    if (hashtag && !hashtags.includes(hashtag) && hashtags.length < 10) {
      setHashtags([...hashtags, hashtag.startsWith('#') ? hashtag : `#${hashtag}`]);
      setHashtag('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleGenerate = useCallback(async () => {
    if (!title.trim()) return;
    
    setGenerating(true);
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImages: GeneratedImage[] = [
      {
        id: Date.now().toString(),
        url: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=800&fit=crop&t=${Date.now()}`,
        style: selectedStyle,
        timestamp: Date.now()
      }
    ];
    
    setGeneratedImages(newImages);
    setGenerating(false);
  }, [title, selectedStyle]);

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `xiaohongshu-${image.id}.jpg`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* 工具头部 */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/tools" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回工具
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">小红书配图生成</h1>
              <p className="text-white/80 text-sm">输入标题，一键生成小红书爆款封面图</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 输入标题 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-pink-500" />
            输入笔记标题
          </h3>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：这家奶茶店也太好喝了吧！必点清单"
            className="w-full text-base"
          />

          {/* 话题标签 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              话题标签
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-pink-100 text-pink-600 cursor-pointer" onClick={() => handleRemoveHashtag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="添加话题，如：美食推荐"
                className="flex-1"
              />
              <Button onClick={handleAddHashtag} variant="outline" size="sm" className="border-pink-300 text-pink-500">
                <Hash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 选择风格 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            选择风格
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-slate-100 hover:border-pink-200'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {style.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600">{style.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 选择尺寸 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-pink-500" />
            选择尺寸
          </h3>
          <div className="flex gap-3">
            {SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  selectedSize === size.value 
                    ? 'border-pink-500 bg-pink-50 text-pink-600' 
                    : 'border-slate-100 text-slate-600 hover:border-pink-200'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={!title.trim() || generating}
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-pink-500/30"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI 正在生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成封面图
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              生成完成
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Generated"
                    className="w-full rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Button
                      onClick={() => handleDownload(image)}
                      className="bg-white text-slate-800 hover:bg-white/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleGenerate}
              variant="outline"
              className="w-full border-pink-300 text-pink-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
