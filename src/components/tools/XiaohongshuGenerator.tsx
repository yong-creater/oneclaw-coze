'use client';

import { useState, useCallback } from 'react';
import { 
  BookOpen, Download, Loader2, Upload,
  Image as ImageIcon, Wand2, RefreshCw, 
  Check, Star, Sparkles, Hash
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/600/800`,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedImages([newImage, ...generatedImages]);
    setGenerating(false);
  };

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `小红书_${image.style}_${image.timestamp}.png`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<BookOpen className="w-4 h-4" />}
        toolName="小红书配图生成"
        toolDescription="输入标题，一键生成小红书爆款封面图和配图"
        gradient="from-pink-500 to-rose-500"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 输入标题 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              话题标签
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 cursor-pointer" onClick={() => handleRemoveHashtag(tag)}>
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

        {/* 风格选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            选择风格
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  {style.colors.map((color, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  selectedStyle === style.id ? 'text-pink-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {style.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 尺寸选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
            选择图片尺寸
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedSize === size.value
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <p className={`text-sm font-medium ${
                  selectedSize === size.value ? 'text-pink-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {size.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !title.trim()}
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-base font-medium shadow-lg shadow-pink-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成爆款配图
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              生成结果
              <Badge variant="secondary" className="ml-2">{generatedImages.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group">
                  <img src={image.url} alt="生成的配图" className="w-full aspect-[3/4] object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(image)}
                      className="p-2 bg-white rounded-full hover:bg-pink-50 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-2 bg-white rounded-full hover:bg-pink-50 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 登录提示 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-pink-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录解锁高清无水印</p>
              <p className="text-xs text-slate-500">批量生成、商用授权</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
