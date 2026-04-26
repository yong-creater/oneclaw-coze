'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import { Camera, Upload, Loader2, Download, Sparkles, RotateCcw, Check, X, Image } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoStyle {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
}

const PHOTO_STYLES: PhotoStyle[] = [
  { id: 'portrait', name: '高级写真', emoji: '✨', prompt: '高质量人像摄影写真，真实自然，皮肤细腻，光线柔和，专业影棚打光，高级感构图，避免AI痕迹' },
  { id: '证件照', name: '证件照', emoji: '📋', prompt: '专业证件照，白底或蓝底，五官清晰，妆容自然，高清质感，适合正式场合使用' },
  { id: '时尚', name: '时尚大片', emoji: '🔥', prompt: '时尚杂志大片风格，高级感，光影艺术，明星既视感，潮流时尚，年轻活力' },
  { id: '文艺', name: '文艺清新', emoji: '🌿', prompt: '文艺小清新风格，自然光线，森系氛围，电影感，温柔色调，适合文艺青年' },
  { id: '商务', name: '商务形象', emoji: '💼', prompt: '商务职业照，专业形象，西装正装，干练气质，适合LinkedIn或简历使用' },
  { id: '生日', name: '生日氛围', emoji: '🎂', prompt: '生日庆祝氛围照，温馨感人，庆祝氛围，暖色调，精致蛋糕装饰' },
];

export default function AIPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('portrait');
  const [generating, setGenerating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('请上传图片文件');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过10MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhotos([]);
    }
  };

  // 上传区域点击
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 生成写真
  const generatePhotos = async () => {
    if (!selectedFile) {
      toast.error('请先上传照片');
      return;
    }

    setGenerating(true);
    setPhotos([]);
    
    const style = PHOTO_STYLES.find(s => s.id === selectedStyle);
    
    try {
      // 模拟生成4张不同角度的写真
      const photoPromises = Array(4).fill(0).map(async (_, i) => {
        // 实际项目中应该上传原图到服务器
        // 这里使用占位图演示
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // 使用picsum生成占位图（实际应调用AI生图API）
        const seed = Date.now() + i;
        return `https://picsum.photos/seed/${seed}/512/512`;
      });

      const results = await Promise.all(photoPromises);
      setPhotos(results);
      setRetryCount(0);
      toast.success('生成成功！');
    } catch (error) {
      console.error('Generation error:', error);
      // 失败自动重试
      if (retryCount < 2) {
        toast.error('生成失败，正在重试...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => generatePhotos(), 1000);
      } else {
        toast.error('生成失败，请稍后重试');
      }
    } finally {
      setGenerating(false);
    }
  };

  // 下载照片
  const downloadPhoto = async (url: string, index: number) => {
    setDownloading(index);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-photo-${index + 1}.jpg`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('下载成功！');
    } catch (error) {
      toast.error('下载失败');
    } finally {
      setDownloading(null);
    }
  };

  // 重置
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotos([]);
    setSelectedStyle('portrait');
    setRetryCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        {/* 标题区 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            AI写真生成器
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            上传照片，生成高级感写真
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            让你的朋友圈获得更多点赞
          </p>
        </div>

        {/* 上传区 */}
        <Card className="mb-8 border-violet-100 dark:border-violet-900/30">
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!previewUrl ? (
              <button
                onClick={handleUploadClick}
                className="w-full h-48 border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-400 dark:hover:border-violet-600 transition-colors cursor-pointer bg-violet-50/50 dark:bg-violet-900/20"
              >
                <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-violet-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-800 dark:text-white">点击上传照片</p>
                  <p className="text-sm text-slate-500">支持 JPG、PNG，大小不超过 10MB</p>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* 风格选择 */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    选择写真风格
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {PHOTO_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          selectedStyle === style.id
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
                        }`}
                      >
                        <span className="text-xl mb-1 block">{style.emoji}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {style.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 生成按钮 */}
                <Button
                  onClick={generatePhotos}
                  disabled={generating}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      正在生成写真...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      生成4张写真
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 写真展示 */}
        {(photos.length > 0 || generating) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                生成的写真
              </h2>
              {generating && (
                <span className="text-sm text-violet-600 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> 生成中...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => {
                const photo = photos[i];
                return (
                  <Card key={i} className="border-violet-100 dark:border-violet-900/30 overflow-hidden">
                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                      {photo ? (
                        <>
                          <img
                            src={photo}
                            alt={`写真 ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 水印 */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all">
                            <span className="text-white/0 hover:text-white/80 text-xs bg-black/50 px-2 py-1 rounded transition-all">
                              水印版
                            </span>
                          </div>
                        </>
                      ) : generating ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-violet-300 text-violet-600 hover:bg-violet-50"
                        onClick={() => photo && downloadPhoto(photo, i)}
                        disabled={!photo || downloading === i}
                      >
                        {downloading === i ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 商业提示 */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">提示</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      当前为免费预览版，图片带有水印。
                      <strong>付费9.9元</strong>可下载高清无水印原图，
                      <strong>套餐</strong>可获得更多高清写真。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 使用说明 */}
        {photos.length === 0 && !generating && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">写真风格说明</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PHOTO_STYLES.slice(0, 6).map(style => (
                  <div key={style.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                    <span className="text-2xl mb-1 block">{style.emoji}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {style.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部 */}
        <div className="mt-12">
          <WechatPromo />
        </div>
      </div>
    </div>
  );
}
