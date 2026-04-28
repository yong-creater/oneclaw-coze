'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Wand2, Loader2, Image as ImageIcon, Layers, Settings, Globe, Download, RefreshCw } from 'lucide-react';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';

// ============================================================
// 配置常量
// ============================================================

const PLATFORM_OPTIONS = [
  { id: 'taobao', name: '淘宝', color: 'bg-orange-500' },
  { id: 'jd', name: '京东', color: 'bg-red-500' },
  { id: 'pdd', name: '拼多多', color: 'bg-orange-600' },
  { id: 'shein', name: 'SHEIN', color: 'bg-pink-500' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
];

const MODE_OPTIONS = [
  { id: 'smart', name: '智能套图', desc: 'AI自动匹配最优方案' },
  { id: 'custom', name: '自定义套图', desc: '手动选择细节参数', isNew: true },
];

const IMAGE_TYPE_OPTIONS = [
  { id: 'main', name: '主图辅图', desc: '标准电商套图' },
];

const GENERATE_MODE_OPTIONS = [
  { id: 'standard', name: '标准模式', tag: '性价比', icon: '💡' },
  { id: 'premium', name: '高级模式', tag: '效果好', icon: '✨' },
  { id: 'vip', name: '会员模式', tag: '会员专享', icon: '👑' },
];

const QUALITY_OPTIONS = [
  { id: '1k', name: '1K', desc: '标清' },
  { id: '2k', name: '2K', desc: '高清' },
  { id: '4k', name: '4K', desc: '超清' },
];

const RATIO_OPTIONS = [
  { id: '4:3', name: '4:3' },
  { id: '3:4', name: '3:4' },
  { id: '9:16', name: '9:16' },
  { id: '16:9', name: '16:9' },
  { id: '1:1', name: '1:1' },
  { id: '3:2', name: '3:2' },
  { id: '2:3', name: '2:3' },
  { id: '21:9', name: '21:9' },
];

// 示例图片
const EXAMPLE_IMAGES = [
  'https://aka.doubaocdn.com/s/NUtX1wKGZw',
  'https://aka.doubaocdn.com/s/iyDx1wKGZw',
  'https://aka.doubaocdn.com/s/H2Fi1wKGZw',
  'https://aka.doubaocdn.com/s/JUDE1wKGZw',
  'https://aka.doubaocdn.com/s/kVmn1wKGZw',
];

// 生成结果示例
const GENERATED_EXAMPLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  url: 'https://via.placeholder.com/300x300/f5f5f5/999999?text=' + (i + 1),
}));

// ============================================================
// 页面组件
// ============================================================

export default function ProductSetPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [productInfo, setProductInfo] = useState('');
  const [smartCopy, setSmartCopy] = useState('');
  const [extraDesc, setExtraDesc] = useState('');
  const [mode, setMode] = useState('smart');
  const [imageType, setImageType] = useState('main');
  const [generateMode, setGenerateMode] = useState('standard');
  const [quality, setQuality] = useState('1k');
  const [ratio, setRatio] = useState('1:1');
  const [count, setCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<typeof GENERATED_EXAMPLES>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => {
            if (prev.length < 5) {
              return [...prev, event.target!.result as string];
            }
            return prev;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // 选择示例图片
  const selectExample = (url: string) => {
    setUploadedImages(prev => {
      if (prev.length < 5 && !prev.includes(url)) {
        return [...prev, url];
      }
      return prev;
    });
  };
  
  // AI帮写
  const handleAISwrite = async () => {
    if (!productInfo.trim()) return;
    setSmartCopy('正在生成智能文案...');
    // 模拟AI生成
    setTimeout(() => {
      setSmartCopy(`${productInfo}。精选优质面料，工艺精湛，款式时尚，百搭耐看，适合多种场合穿着。`);
    }, 1500);
  };
  
  // 生成图片
  const handleGenerate = async () => {
    if (uploadedImages.length === 0) {
      alert('请上传商品图片');
      return;
    }
    
    setIsGenerating(true);
    // 模拟生成过程
    setTimeout(() => {
      setGeneratedImages(GENERATED_EXAMPLES.slice(0, count));
      setIsGenerated(true);
      setIsGenerating(false);
    }, 3000);
  };
  
  // 重置
  const handleReset = () => {
    setUploadedImages([]);
    setProductInfo('');
    setSmartCopy('');
    setExtraDesc('');
    setMode('smart');
    setImageType('main');
    setGenerateMode('standard');
    setQuality('1k');
    setRatio('1:1');
    setCount(4);
    setIsGenerated(false);
    setGeneratedImages([]);
  };
  
  // 下载单张图片
  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `商品套图_${index + 1}.png`;
    link.click();
  };
  
  // 下载全部
  const handleDownloadAll = () => {
    generatedImages.forEach((img, index) => {
      setTimeout(() => handleDownload(img.url, index), index * 300);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">商品套图</h1>
              <p className="text-xs text-slate-500">一键生成全套电商视觉素材</p>
            </div>
          </div>
          <BackToHome />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!isGenerated ? (
          // ================================================
          // 配置界面
          // ================================================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：商品图上传 */}
            <div className="lg:col-span-5 space-y-4">
              {/* 上传区域 */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-orange-500" />
                      商品图
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      最多5张
                    </Badge>
                  </div>
                  
                  {/* 上传区域 */}
                  <div 
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">上传 / 拖拽【多视角商品图】</p>
                    <p className="text-xs text-slate-400 mt-1">支持多图(最多5张)</p>
                  </div>
                  
                  {/* 已上传图片预览 */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <Image src={img} alt={`上传图片${i + 1}`} fill className="object-cover" />
                          <button
                            onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 推荐示例 */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">推荐示例</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {EXAMPLE_IMAGES.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => selectExample(url)}
                          className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            uploadedImages.includes(url) 
                              ? 'border-orange-500 ring-2 ring-orange-200' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-orange-400'
                          }`}
                        >
                          <Image src={url} alt={`示例${i + 1}`} fill className="object-cover" />
                          {uploadedImages.includes(url) && (
                            <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 提示 */}
                  <p className="text-xs text-slate-400 mt-3">
                    建议上传多角度商品图，以获得更理想的结果
                  </p>
                </CardContent>
              </Card>
              
              {/* 商品信息 */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 dark:text-white">商品信息（非必填）</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleAISwrite}
                      disabled={!productInfo.trim() || smartCopy.includes('正在生成')}
                      className="h-8 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI帮写
                    </Button>
                  </div>
                  <textarea
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="描述商品特点，如：头层牛皮手提包、复古棕色"
                    className="w-full h-20 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent text-sm resize-none focus:outline-none focus:border-orange-500"
                    maxLength={2000}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{productInfo.length}/2000</p>
                </CardContent>
              </Card>
            </div>
            
            {/* 右侧：配置 */}
            <div className="lg:col-span-7 space-y-4">
              {/* 创作模式 */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-500" />
                    创作模式
                  </h3>
                  <div className="flex gap-3">
                    {MODE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setMode(option.id)}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all relative ${
                          mode === option.id
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {option.name}
                        {option.isNew && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 h-5">
                            New
                          </Badge>
                        )}
                        <p className={`text-xs mt-1 ${mode === option.id ? 'text-orange-100' : 'text-slate-400'}`}>
                          {option.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                  
                  {/* 生图类型 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      生图类型
                    </label>
                    <div className="flex gap-2">
                      {IMAGE_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setImageType(option.id)}
                          className={`px-4 py-2.5 rounded-lg text-sm transition-all ${
                            imageType === option.id
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 智能文案 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      智能文案
                    </label>
                    <textarea
                      value={smartCopy}
                      onChange={(e) => setSmartCopy(e.target.value)}
                      placeholder="输入商品卖点，AI将自动匹配最优文案"
                      className="w-full h-20 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-transparent text-sm resize-none focus:outline-none focus:border-orange-500"
                      maxLength={2000}
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">{smartCopy.length}/2000</p>
                  </div>
                  
                  {/* 额外描述 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      额外描述（非必填）
                    </label>
                    <Input
                      value={extraDesc}
                      onChange={(e) => setExtraDesc(e.target.value)}
                      placeholder="补充说明，如：需要展示五金配件"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* 生成参数 */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-5 space-y-4">
                  {/* 生成模式 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      生成模式
                    </label>
                    <div className="space-y-2">
                      {GENERATE_MODE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setGenerateMode(option.id)}
                          className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center justify-between ${
                            generateMode === option.id
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{option.icon}</span>
                            <span className="font-medium">{option.name}</span>
                          </div>
                          <Badge className={
                            generateMode === option.id 
                              ? 'bg-white/20 text-white border-white/40' 
                              : 'bg-slate-200 dark:bg-slate-600'
                          }>
                            {option.tag}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 清晰度 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      清晰度
                    </label>
                    <div className="flex gap-2">
                      {QUALITY_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setQuality(option.id)}
                          className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            quality === option.id
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div className="font-medium">{option.name}{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 图像比例 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      图像比例
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RATIO_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setRatio(option.id)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            ratio === option.id
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 生成张数 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      生成张数
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCount(Math.max(1, count - 1))}
                        className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={count}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 1 && val <= 24) setCount(val);
                        }}
                        className="w-20 text-center rounded-xl"
                      />
                      <span className="text-sm text-slate-500">张</span>
                      <button
                        onClick={() => setCount(Math.min(24, count + 1))}
                        className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* 按钮 */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="flex-1 rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重置
                    </Button>
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || uploadedImages.length === 0}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          开始生成
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // ================================================
          // 生成结果界面
          // ================================================
          <div className="space-y-6">
            {/* 顶部操作栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setIsGenerated(false)} className="rounded-xl">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
              </div>
              <Button onClick={handleDownloadAll} className="bg-green-500 hover:bg-green-600 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                下载全部 ({generatedImages.length}张)
              </Button>
            </div>
            
            {/* 提示语 */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">商品套图生成完成</h4>
                      <p className="text-xs text-slate-500">
                        {quality} · {ratio} · {count}张
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    合规通过率 98%+
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* 生成结果网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generatedImages.map((img, i) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <Image 
                      src={img.url} 
                      alt={`生成图片${i + 1}`} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(img.url, i)}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 提示 */}
            <div className="text-center text-sm text-slate-500">
              告别繁琐拍摄，一键生成全套电商视觉，适配多种电商平台
            </div>
          </div>
        )}
        
        {/* 公众号推广 */}
        <WechatPromo />
      </div>
    </div>
  );
}
