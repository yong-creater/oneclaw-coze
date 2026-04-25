'use client';

import { useState, useCallback } from 'react';
import { 
  Smartphone, Download, Loader2, Upload,
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
  { id: 'trendy', name: '潮流炫酷', colors: ['#ff0080', '#00ffff', '#ffff00'] },
  { id: 'funny', name: '搞笑有趣', colors: ['#ff6b6b', '#ffd93d', '#6bcb77'] },
  { id: 'tech', name: '科技感', colors: ['#0c4a6e', '#06b6d4', '#164e63'] },
  { id: 'viral', name: '爆款文案', colors: ['#ff4757', '#2f3542', '#ffa502'] },
  { id: 'food', name: '美食诱人', colors: ['#ff6348', '#ffc312', '#ffffff'] },
  { id: 'beauty', name: '美妆时尚', colors: ['#fd79a8', '#a29bfe', '#fdcb6e'] },
];

const SIZES = [
  { value: 'cover', label: '视频封面 9:16' },
  { value: 'square', label: '方形封面 1:1' },
  { value: 'banner', label: '横版 16:9' },
];

export default function DouyinGenerator() {
  const [title, setTitle] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['#抖音', '#热门', '#推荐']);
  const [selectedStyle, setSelectedStyle] = useState('trendy');
  const [selectedSize, setSelectedSize] = useState('cover');
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
      alert('请输入视频标题');
      return;
    }

    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/600/1067`,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedImages([newImage, ...generatedImages]);
    setGenerating(false);
  };

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `抖音_${image.style}_${image.timestamp}.png`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<Smartphone className="w-4 h-4" />}
        toolName="抖音封面生成"
        toolDescription="输入标题，一键生成抖音爆款视频封面图"
        gradient="from-cyan-500 to-blue-500"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 输入标题 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-cyan-500" />
            输入视频标题
          </h3>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：这个太绝了！忍不住分享给大家"
            className="w-full text-base"
          />

          {/* 话题标签 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              话题标签
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 cursor-pointer" onClick={() => handleRemoveHashtag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="添加话题，如：搞笑"
                className="flex-1"
              />
              <Button onClick={handleAddHashtag} variant="outline" size="sm" className="border-cyan-300 text-cyan-500">
                <Hash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 风格选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            选择风格
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  {style.colors.map((color, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  selectedStyle === style.id ? 'text-cyan-600' : 'text-slate-700 dark:text-slate-300'
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
            选择封面尺寸
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedSize === size.value
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                }`}
              >
                <p className={`text-sm font-medium ${
                  selectedSize === size.value ? 'text-cyan-600' : 'text-slate-700 dark:text-slate-300'
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
          className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl text-base font-medium shadow-lg shadow-cyan-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成爆款封面
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-500" />
              生成结果
              <Badge variant="secondary" className="ml-2">{generatedImages.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group">
                  <img src={image.url} alt="生成的封面" className="w-full aspect-[9/16] object-cover max-w-xs mx-auto" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(image)}
                      className="p-2 bg-white rounded-full hover:bg-cyan-50 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-2 bg-white rounded-full hover:bg-cyan-50 transition-colors"
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
            <Smartphone className="w-8 h-8 text-cyan-500" />
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
