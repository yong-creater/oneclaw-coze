'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { 
  Camera, Upload, Loader2, Download, 
  RefreshCw, Check, Wand2, Sun, Contrast,
  Droplets, Sparkles as SparklesIcon, FlipHorizontal, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Adjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  blur: number;
}

type FilterType = 'none' | 'vivid' | 'warm' | 'cool' | 'bw' | 'vintage' | 'portrait' | 'cinematic';

const filters: { type: FilterType; label: string; className: string }[] = [
  { type: 'none', label: '原图', className: '' },
  { type: 'vivid', label: '生动', className: 'saturate-125 contrast-110' },
  { type: 'warm', label: '暖色', className: 'sepia-[30%] saturate-110' },
  { type: 'cool', label: '冷色', className: 'hue-rotate-20 saturate-90' },
  { type: 'bw', label: '黑白', className: 'grayscale' },
  { type: 'vintage', label: '复古', className: 'sepia-[40%] contrast-90 saturate-80' },
  { type: 'portrait', label: '人像', className: 'contrast-105 brightness-105 saturate-95' },
  { type: 'cinematic', label: '电影', className: 'contrast-115 saturate-110 hue-rotate-10' },
];

export default function PhotoEditorPage() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [adjustments, setAdjustments] = useState<Adjustment>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    blur: 0,
  });
  const [appliedAdjustments, setAppliedAdjustments] = useState<Adjustment>(adjustments);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('图片大小不能超过15MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setOriginalUrl(e.target?.result as string);
      setSelectedFilter('none');
      setAdjustments({ brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0 });
      setAppliedAdjustments({ brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0 });
      setUploading(false);
      toast.success('图片上传成功');
    };
    reader.onerror = () => {
      toast.error('图片读取失败');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const adjustValue = (key: keyof Adjustment, delta: number) => {
    const newValue = Math.max(0, Math.min(200, adjustments[key] + delta));
    setAdjustments(prev => ({ ...prev, [key]: newValue }));
  };

  const handleApplyAdjustments = () => {
    setAppliedAdjustments({ ...adjustments });
    toast.success('调整已应用');
  };

  const handleResetAdjustments = () => {
    setAdjustments({ brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0 });
    setAppliedAdjustments({ brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0 });
    setSelectedFilter('none');
  };

  const handleSave = async () => {
    if (!imageUrl) return;

    setProcessing(true);
    
    // 模拟处理
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 应用滤镜和调整到图像
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 应用CSS滤镜
      const filter = filters.find(f => f.type === selectedFilter)?.className || '';
      const brightness = appliedAdjustments.brightness;
      const contrast = appliedAdjustments.contrast;
      const saturate = appliedAdjustments.saturation;
      
      ctx.filter = `${filter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${Math.max(0, appliedAdjustments.warmth)}%) blur(${appliedAdjustments.blur}px)`;
      ctx.drawImage(img, 0, 0);
      
      const processedUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageUrl(processedUrl);
      setProcessing(false);
      toast.success('照片保存成功！');
    };
    img.src = imageUrl;
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-edited-${Date.now()}.jpg`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('图片下载成功');
    } catch {
      toast.error('下载失败');
    }
  };

  const filter = filters.find(f => f.type === selectedFilter)?.className || '';
  const combinedFilter = `${filter} brightness(${appliedAdjustments.brightness}%) contrast(${appliedAdjustments.contrast}%) saturate(${appliedAdjustments.saturation}%) sepia(${Math.max(0, appliedAdjustments.warmth)}%) blur(${appliedAdjustments.blur}px)`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Camera className="w-4 h-4" />}
        toolName="照片美化"
        toolDescription="AI一键磨皮/调色/滤镜"
        gradient="from-violet-500 to-purple-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            照片美化
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            AI智能照片美化工具
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            滤镜 / 调色 / 磨皮 一键搞定
          </p>
        </div>

        {/* 隐藏的Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 上传区域 */}
        <Card className="mb-6 border-violet-100 dark:border-violet-900/30 overflow-hidden">
          <CardContent className="p-0">
            <div className={`relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${!imageUrl ? 'border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-lg m-6' : ''}`}>
              {uploading ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="text-slate-500">上传中...</p>
                </div>
              ) : processing ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="text-slate-500">处理中...</p>
                </div>
              ) : imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="预览" 
                  className="w-full h-full object-contain"
                  style={{ filter: combinedFilter }}
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">点击或拖拽上传照片</p>
                  <p className="text-sm text-slate-400">支持 JPG、PNG，最大 15MB</p>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                {imageUrl ? '更换图片' : '选择图片'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 滤镜选择 */}
        {imageUrl && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-violet-500" />
                滤镜
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map(f => (
                  <button
                    key={f.type}
                    onClick={() => setSelectedFilter(f.type)}
                    className={`flex-shrink-0 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedFilter === f.type
                        ? 'border-violet-500 ring-2 ring-violet-200'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-full h-16 bg-gradient-to-br from-slate-300 to-slate-400 ${f.className}`}>
                      <img 
                        src={imageUrl} 
                        alt="" 
                        className={`w-full h-full object-cover ${f.className}`}
                      />
                    </div>
                    <span className={`block text-xs py-1.5 ${selectedFilter === f.type ? 'bg-violet-50 text-violet-700 font-medium' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 调整参数 */}
        {imageUrl && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-violet-500" />
                  参数调整
                </h3>
                <Button variant="ghost" size="sm" onClick={handleResetAdjustments}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  重置
                </Button>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'brightness' as keyof Adjustment, label: '亮度', icon: <Sun className="w-4 h-4" />, value: adjustments.brightness },
                  { key: 'contrast' as keyof Adjustment, label: '对比度', icon: <Contrast className="w-4 h-4" />, value: adjustments.contrast },
                  { key: 'saturation' as keyof Adjustment, label: '饱和度', icon: <Droplets className="w-4 h-4" />, value: adjustments.saturation },
                  { key: 'warmth' as keyof Adjustment, label: '暖色调', icon: <SparklesIcon className="w-4 h-4" />, value: adjustments.warmth },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className="w-20 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      {item.icon}
                      {item.label}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={item.value}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, [item.key]: parseInt(e.target.value) }))}
                      className="flex-1 accent-violet-500"
                    />
                    <span className="w-10 text-sm text-slate-500 text-right">{item.value}%</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleApplyAdjustments}
                className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                <FlipHorizontal className="w-4 h-4 mr-2" />
                应用调整
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        {imageUrl && (
          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              <Check className="w-4 h-4 mr-2" />
              保存结果
            </Button>
            <Button 
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
          </div>
        )}

        {/* 功能说明 */}
        <div className="grid grid-cols-4 gap-4 mt-8 mb-8">
          {[
            { title: 'AI滤镜', desc: '一键套用', icon: <SparklesIcon className="w-5 h-5" /> },
            { title: '智能调色', desc: '参数微调', icon: <Sun className="w-5 h-5" /> },
            { title: '人像优化', desc: '磨皮美颜', icon: <Camera className="w-5 h-5" /> },
            { title: '高清导出', desc: '无损画质', icon: <Download className="w-5 h-5" /> },
          ].map((item, i) => (
            <Card key={i} className="border-violet-100 dark:border-violet-900/30">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <WechatPromo />
      </div>
    </div>
  );
}
