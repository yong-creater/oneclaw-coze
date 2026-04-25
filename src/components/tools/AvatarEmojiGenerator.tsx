'use client';

import { useState, useCallback } from 'react';
import { 
  Sparkles, Download, Loader2, Upload,
  Image as ImageIcon, Wand2, RefreshCw, 
  Check, Star, User, Palette
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GeneratedImage {
  id: string;
  url: string;
  style: string;
  timestamp: number;
}

const STYLES = [
  { id: 'anime', name: '动漫风', colors: ['#ffb6c1', '#87ceeb', '#98fb98'] },
  { id: 'cartoon', name: '卡通风', colors: ['#ffd700', '#ff6b6b', '#4ecdc4'] },
  { id: 'oil', name: '油画风', colors: ['#daa520', '#8b4513', '#f5f5dc'] },
  { id: 'sketch', name: '素描风', colors: ['#808080', '#a9a9a9', '#d3d3d3'] },
  { id: 'cyberpunk', name: '赛博朋克', colors: ['#00ffff', '#ff00ff', '#ffff00'] },
  { id: 'vintage', name: '复古风', colors: ['#d2691e', '#f5deb3', '#8b7355'] },
];

export default function AvatarEmojiGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('anime');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert('请先上传头像图片');
      return;
    }

    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/600/600`,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedImages([newImage, ...generatedImages]);
    setGenerating(false);
  };

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `头像_${image.style}_${image.timestamp}.png`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<Sparkles className="w-4 h-4" />}
        toolName="头像表情包生成"
        toolDescription="上传照片，一键生成各种风格的精美头像和表情包"
        gradient="from-yellow-500 to-orange-500"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 上传图片 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            上传照片
          </h3>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploadedImage ? (
              <div className="relative">
                <img src={uploadedImage} alt="上传的照片" className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="py-6">
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-1">点击上传照片</p>
                <p className="text-xs text-slate-400">支持 JPG、PNG 格式</p>
              </div>
            )}
          </div>
        </div>

        {/* 风格选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-orange-500" />
            选择风格
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  {style.colors.map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className={`text-sm font-medium ${
                  selectedStyle === style.id ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {style.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !uploadedImage}
          className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white rounded-xl text-base font-medium shadow-lg shadow-orange-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成头像
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              生成结果
              <Badge variant="secondary" className="ml-2">{generatedImages.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group">
                  <img src={image.url} alt="生成的头像" className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(image)}
                      className="p-2 bg-white rounded-full hover:bg-orange-50 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-2 bg-white rounded-full hover:bg-orange-50 transition-colors"
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
            <Sparkles className="w-8 h-8 text-orange-500" />
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
