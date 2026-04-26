'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { 
  Image, Sparkles, Upload, Loader2, Download, 
  RefreshCw, ZoomIn, Check, Wand2, Sun, Shirt, SparklesIcon
} from 'lucide-react';
import { toast } from 'sonner';

type EnhanceType = 'brightness' | 'wrinkle' | 'shadow' | 'color';

interface EnhanceOption {
  type: EnhanceType;
  label: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

export default function ProductPhotoPage() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [enhanceOptions, setEnhanceOptions] = useState<EnhanceOption[]>([
    { type: 'brightness', label: '提亮优化', icon: <Sun className="w-4 h-4" />, description: '智能调整明暗度，让商品更突出', enabled: true },
    { type: 'wrinkle', label: '去褶皱', icon: <Shirt className="w-4 h-4" />, description: '自动抚平衣物褶皱', enabled: true },
    { type: 'shadow', label: '阴影优化', icon: <SparklesIcon className="w-4 h-4" />, description: '自然阴影效果', enabled: true },
    { type: 'color', label: '色彩增强', icon: <Wand2 className="w-4 h-4" />, description: '色彩校正，饱和度优化', enabled: true },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过10MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setProcessedUrl(null);
      setUploading(false);
      toast.success('图片上传成功');
    };
    reader.onerror = () => {
      toast.error('图片读取失败');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleOption = (type: EnhanceType) => {
    setEnhanceOptions(prev => 
      prev.map(opt => 
        opt.type === type ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  const handleProcess = async () => {
    if (!imageUrl) {
      toast.error('请先上传图片');
      return;
    }

    setProcessing(true);
    
    // 模拟AI处理
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // 模拟处理后的图片（添加滤镜效果）
    setProcessedUrl(imageUrl);
    setProcessing(false);
    toast.success('图片精修完成！');
  };

  const handleDownload = async () => {
    if (!processedUrl) return;
    
    try {
      const response = await fetch(processedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `product-enhanced-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('图片下载成功');
    } catch {
      toast.error('下载失败');
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setProcessedUrl(null);
  };

  const enabledCount = enhanceOptions.filter(o => o.enabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Image className="w-4 h-4" />}
        toolName="商品图精修"
        toolDescription="AI智能电商商品图精修"
        gradient="from-amber-500 to-orange-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            商品图精修
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            AI智能电商商品图一键精修
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            去褶皱 / 提亮度 / 去瑕疵 / 优化背景
          </p>
        </div>

        {/* 上传区域 */}
        <Card className="mb-6 border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {/* 预览区域 */}
              <div className={`relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${!imageUrl ? 'border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg m-6' : ''}`}>
                {uploading ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-500">上传中...</p>
                  </div>
                ) : imageUrl ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={processedUrl || imageUrl} 
                      alt="预览" 
                      className={`w-full h-full object-contain ${processedUrl ? 'contrast-110 brightness-105' : ''}`}
                    />
                    {processedUrl && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        已精修
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">点击或拖拽上传商品图片</p>
                    <p className="text-sm text-slate-400">支持 JPG、PNG，最大 10MB</p>
                  </div>
                )}
              </div>
              
              {/* 上传按钮 */}
              {!processedUrl && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    选择图片
                  </Button>
                  {imageUrl && (
                    <Button 
                      variant="outline"
                      onClick={handleReset}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新上传
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 精修选项 */}
        {imageUrl && !processedUrl && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-amber-500" />
                  精修选项 ({enabledCount} / {enhanceOptions.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {enhanceOptions.map(option => (
                  <button
                    key={option.type}
                    onClick={() => toggleOption(option.type)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      option.enabled 
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        option.enabled ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {option.icon}
                      </div>
                      <span className={`font-medium ${option.enabled ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'}`}>
                        {option.label}
                      </span>
                      {option.enabled && <Check className="w-4 h-4 text-amber-500 ml-auto" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                  </button>
                ))}
              </div>
              
              <Button 
                onClick={handleProcess}
                disabled={processing || enabledCount === 0}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI精修中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始精修
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 处理完成 */}
        {processedUrl && (
          <Card className="mb-6 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-700 dark:text-green-400">精修完成</h3>
                  <p className="text-sm text-slate-500">图片已优化处理完成</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载精修图片
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReset}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  处理新图片
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 功能说明 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { title: '服饰精修', desc: '抚平褶皱、提亮色彩', icon: <Shirt className="w-5 h-5" /> },
            { title: '美妆优化', desc: '提亮色彩、修正肤色', icon: <SparklesIcon className="w-5 h-5" /> },
            { title: '智能识别', desc: '自动识别商品品类', icon: <ZoomIn className="w-5 h-5" /> },
          ].map((item, i) => (
            <Card key={i} className="border-amber-100 dark:border-amber-900/30">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
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
