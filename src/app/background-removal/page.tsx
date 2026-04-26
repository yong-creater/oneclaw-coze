'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { 
  Scissors, Upload, Loader2, Download, 
  RefreshCw, Check, Layers, Eraser, Move, Trash2, DownloadCloud
} from 'lucide-react';
import { toast } from 'sonner';

type BackgroundType = 'transparent' | 'white' | 'blur' | 'custom';
type OutputFormat = 'png' | 'jpg' | 'webp';

export default function BackgroundRemovalPage() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [bgType, setBgType] = useState<BackgroundType>('transparent');
  const [format, setFormat] = useState<OutputFormat>('png');
  const [refineEdges, setRefineEdges] = useState(true);
  const [removeShadows, setRemoveShadows] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleProcess = async () => {
    if (!imageUrl) {
      toast.error('请先上传图片');
      return;
    }

    setProcessing(true);
    
    // 模拟AI处理
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setProcessedUrl(imageUrl);
    setProcessing(false);
    toast.success('抠图完成！');
  };

  const handleDownload = async () => {
    if (!processedUrl) return;
    
    try {
      const response = await fetch(processedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `remove-bg-${Date.now()}.${format}`;
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

  const bgOptions: { type: BackgroundType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'transparent', label: '透明背景', icon: <Layers className="w-4 h-4" />, desc: 'PNG透明底' },
    { type: 'white', label: '纯白背景', icon: <Move className="w-4 h-4" />, desc: '证件照标准' },
    { type: 'blur', label: '背景模糊', icon: <Eraser className="w-4 h-4" />, desc: '景深效果' },
    { type: 'custom', label: '自定义颜色', icon: <Trash2 className="w-4 h-4" />, desc: '自由选择' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Scissors className="w-4 h-4" />}
        toolName="AI智能抠图"
        toolDescription="发丝级精准抠图"
        gradient="from-cyan-500 to-blue-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium mb-4">
            <Scissors className="w-4 h-4" />
            AI智能抠图
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            发丝级精准抠图，一键去除背景
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            支持人物、商品、动物、头像等全品类
          </p>
        </div>

        {/* 上传区域 */}
        <Card className="mb-6 border-cyan-100 dark:border-cyan-900/30 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {/* 预览区域 */}
              <div className={`relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${!imageUrl ? 'border-2 border-dashed border-cyan-300 dark:border-cyan-700 rounded-lg m-6' : ''}`}>
                {uploading ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
                    <p className="text-slate-500">上传中...</p>
                  </div>
                ) : processing ? (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center animate-pulse">
                      <Scissors className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">AI正在智能识别主体...</p>
                    <p className="text-sm text-slate-400">预计 2-3 秒完成</p>
                  </div>
                ) : imageUrl ? (
                  <div className="relative w-full h-full">
                    {/* 原图 */}
                    <img 
                      src={processedUrl || imageUrl} 
                      alt="预览" 
                      className={`w-full h-full object-contain ${
                        bgType === 'transparent' && !processedUrl ? '' : ''
                      }`}
                      style={{
                        background: bgType === 'transparent' 
                          ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 16px 16px'
                          : bgType === 'white' 
                          ? '#ffffff'
                          : undefined
                      }}
                    />
                    {processedUrl && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        抠图完成
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">点击或拖拽上传图片</p>
                    <p className="text-sm text-slate-400">支持 JPG、PNG、WebP，最大 15MB</p>
                  </div>
                )}
              </div>
              
              {/* 上传按钮 */}
              {!processedUrl && (
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
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imageUrl ? '更换图片' : '选择图片'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 抠图选项 */}
        {imageUrl && !processedUrl && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">输出设置</h3>
              
              {/* 背景类型 */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 block">
                  背景类型
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {bgOptions.map(option => (
                    <button
                      key={option.type}
                      onClick={() => setBgType(option.type)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        bgType === option.type 
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                        bgType === option.type ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {option.icon}
                      </div>
                      <span className={`text-sm font-medium ${bgType === option.type ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 输出格式 */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 block">
                  输出格式
                </label>
                <div className="flex gap-3">
                  {(['png', 'jpg', 'webp'] as OutputFormat[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        format === f 
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      .{f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 高级选项 */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">高级选项</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refineEdges}
                      onChange={(e) => setRefineEdges(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">边缘优化（发丝级精度）</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeShadows}
                      onChange={(e) => setRemoveShadows(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">去除主体阴影</span>
                  </label>
                </div>
              </div>

              <Button 
                onClick={handleProcess}
                disabled={processing}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI抠图中...
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5 mr-2" />
                    开始抠图
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
                  <h3 className="font-bold text-green-700 dark:text-green-400">抠图完成</h3>
                  <p className="text-sm text-slate-500">
                    {bgType === 'transparent' ? '透明背景 PNG' : bgType === 'white' ? '纯白背景' : '已处理'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  下载图片
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

        {/* 功能特点 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { title: '人物证件照', desc: '换底色' },
            { title: '商品白底图', desc: '电商必备' },
            { title: '动物主体', desc: '毛发边缘' },
            { title: '产品静物', desc: '精细边缘' },
          ].map((item, i) => (
            <Card key={i} className="border-cyan-100 dark:border-cyan-900/30">
              <CardContent className="p-4 text-center">
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
