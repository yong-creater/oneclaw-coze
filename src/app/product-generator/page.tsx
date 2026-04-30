'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Loader2, Download, RefreshCw, X, Check, ArrowRight, Zap, RotateCw, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UtilityHeader from '@/components/common/UtilityHeader';

// 图片槽位类型
type ImageSlot = 'cover' | 'selling1' | 'selling2' | 'scene1' | 'scene2' | 'feature' | 'specs';

interface GeneratedImage {
  slot: ImageSlot;
  url: string;
  label: string;
  order: number;
}

// 槽位配置（顺序即展示顺序）
const SLOT_CONFIG: { slot: ImageSlot; label: string; order: number; color: string }[] = [
  { slot: 'cover', label: '封面图', order: 1, color: 'bg-rose-500' },
  { slot: 'selling1', label: '卖点图 1', order: 2, color: 'bg-amber-500' },
  { slot: 'selling2', label: '卖点图 2', order: 3, color: 'bg-amber-500' },
  { slot: 'scene1', label: '场景图 1', order: 4, color: 'bg-emerald-500' },
  { slot: 'scene2', label: '场景图 2', order: 5, color: 'bg-emerald-500' },
  { slot: 'feature', label: '功能拆解图', order: 6, color: 'bg-blue-500' },
  { slot: 'specs', label: '参数图', order: 7, color: 'bg-violet-500' },
];

// 加载状态文案
const LOADING_STEPS = [
  '正在分析商品特征...',
  '正在生成封面图...',
  '正在生成卖点图...',
  '正在生成场景图...',
  '正在生成功能拆解图...',
  '正在生成参数图...',
  '即将完成...',
];

export default function ProductDetailGeneratorPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productBenefit, setProductBenefit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [regeneratingSlot, setRegeneratingSlot] = useState<ImageSlot | null>(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeBenefit = async () => {
    if (!uploadedImage && !productName) {
      alert('请上传商品图或输入商品名称');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/product-generator/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName || undefined,
          productImage: uploadedImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '分析失败');
      }

      if (data.benefits) {
        setProductBenefit(data.benefits);
      }
    } catch (error) {
      console.error('卖点分析失败:', error);
      alert(error instanceof Error ? error.message : '卖点分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 解析 API 返回的 images 对象为有序数组
  const parseImages = useCallback((images: Partial<Record<ImageSlot, string>>): GeneratedImage[] => {
    const result: GeneratedImage[] = [];
    for (const config of SLOT_CONFIG) {
      if (images[config.slot]) {
        result.push({
          slot: config.slot,
          url: images[config.slot]!,
          label: config.label,
          order: config.order,
        });
      }
    }
    return result;
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage && !productName) {
      alert('请上传商品图或输入商品名称');
      return;
    }

    setIsGenerating(true);

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % LOADING_STEPS.length;
      setGeneratingStep(LOADING_STEPS[stepIndex]);
    }, 2000);

    try {
      const response = await fetch('/api/product-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          productName: productName || undefined,
          productBenefit: productBenefit || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成失败');
      }

      const images = parseImages(data.images);
      if (images.length === 0) {
        throw new Error('未能生成任何图片');
      }

      setGeneratedImages(images);
      setShowResults(true);
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      clearInterval(stepInterval);
      setGeneratingStep('');
      setIsGenerating(false);
    }
  };

  // 单张重新生成
  const handleRegenerateSlot = async (slot: ImageSlot) => {
    if (!uploadedImage) return;

    setRegeneratingSlot(slot);
    try {
      const response = await fetch('/api/product-generator/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot,
          image: uploadedImage,
          productName: productName || undefined,
          productBenefit: productBenefit || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '重新生成失败');
      }

      // 更新单张图片
      setGeneratedImages(prev => {
        const existing = prev.find(img => img.slot === slot);
        if (existing) {
          return prev.map(img =>
            img.slot === slot ? { ...img, url: data.url } : img
          );
        }
        // 如果之前没有这张图，新增
        const config = SLOT_CONFIG.find(c => c.slot === slot);
        if (config) {
          return [...prev, { slot, url: data.url, label: config.label, order: config.order }]
            .sort((a, b) => a.order - b.order);
        }
        return prev;
      });
    } catch (error) {
      console.error('重新生成失败:', error);
      alert(error instanceof Error ? error.message : '重新生成失败，请稍后重试');
    } finally {
      setRegeneratingSlot(null);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setProductName('');
    setProductBenefit('');
    setShowResults(false);
    setGeneratedImages([]);
  };

  // 下载单张图片
  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // 下载整套图片
  const handleDownloadAll = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      const img = generatedImages[i];
      const filename = `${productName || '商品详情'}_${img.label}.png`;
      await handleDownloadImage(img.url, filename);
      // 短暂延迟避免浏览器拦截
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  // 获取槽位配置
  const getSlotConfig = (slot: ImageSlot) => SLOT_CONFIG.find(c => c.slot === slot);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <UtilityHeader
        toolIcon={<Package className="w-4 h-4 text-white" />}
        toolName="AI商品详情页生成器"
        toolDescription="一键生成完整商品详情页图片"
        gradient="from-orange-500 to-amber-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            上传商品图，AI一键生成完整详情页
          </h1>
        </div>

        {/* 示例说明行 */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <span>普通商品图</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
          <span className="text-rose-600 font-medium">封面</span>
          <span className="text-slate-300">+</span>
          <span className="text-amber-600 font-medium">卖点</span>
          <span className="text-slate-300">+</span>
          <span className="text-emerald-600 font-medium">场景</span>
          <span className="text-slate-300">+</span>
          <span className="text-blue-600 font-medium">功能</span>
          <span className="text-slate-300">+</span>
          <span className="text-violet-600 font-medium">参数</span>
          <span className="text-slate-300">=</span>
          <span className="text-orange-600 font-bold">完整详情页</span>
        </div>

        {/* 左右布局主体区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入表单 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
            {/* 上传区域 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-gradient-to-br from-slate-50 to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 mb-4"
            >
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="上传预览"
                    className="max-h-32 mx-auto rounded-lg object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    上传你的商品图（一键生成完整详情页）
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    支持 JPG / PNG，建议 800x800
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 商品名称 */}
            <div className="mb-3">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="商品名称（可选，用于优化图片效果）"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* 商品卖点 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <textarea
                  value={productBenefit}
                  onChange={(e) => setProductBenefit(e.target.value)}
                  placeholder="商品卖点（强烈建议填写，用于优化图片效果）"
                  rows={3}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 resize-none text-sm"
                />
                <button
                  onClick={handleAnalyzeBenefit}
                  disabled={isAnalyzing || (!uploadedImage && !productName)}
                  className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {isAnalyzing ? '分析中...' : '帮我生成'}
                </button>
              </div>
            </div>

            {/* 生成按钮区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-orange-500" />
                  免费体验
                </span>
                <span className="text-slate-300">|</span>
                <span>7张详情图</span>
                <span className="text-slate-300">|</span>
                <span>淘宝/小红书</span>
              </div>

              <div className="text-center">
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  🔥 今日免费名额仅剩 2 次
                </span>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-[14px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {generatingStep || '正在生成...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    一键生成商品详情页（免费体验）
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[13px] text-slate-400">
                  生成 7 张可直接用于详情页的图片
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：结果/预览 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            {!showResults ? (
              /* 未生成时的示例说明 */
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    生成效果预览
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    一键生成 7 张电商详情页图片
                  </p>
                </div>

                {/* 7 种图片类型卡片 */}
                <div className="grid grid-cols-2 gap-2.5">
                  {SLOT_CONFIG.map((config) => (
                    <div key={config.slot} className="relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <div className="absolute top-1.5 left-1.5">
                        <span className={`${config.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* 最后一列居中 */}
                  <div className="col-span-2 flex justify-center">
                    <div className="w-1/2">
                      <div className="relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div className="absolute top-1.5 left-1.5">
                          <span className={`${SLOT_CONFIG[6].color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none`}>
                            {SLOT_CONFIG[6].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-orange-500 font-medium">
                    👉 上传商品图试一下
                  </span>
                  <span className="text-[10px] text-slate-400">
                    7 张详情图一键生成
                  </span>
                </div>
              </div>
            ) : (
              /* 生成结果：瀑布流展示 */
              <div>
                {/* 头部：数量 + 操作按钮 */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    已生成 {generatedImages.length} / 7 张详情图
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadAll}
                      disabled={generatedImages.length === 0}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      下载整套
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      全部重生成
                    </button>
                  </div>
                </div>

                {/* 瀑布流图片展示 */}
                <div className="columns-2 gap-3 space-y-3">
                  {generatedImages.map((img) => {
                    const config = getSlotConfig(img.slot);
                    const isRegenerating = regeneratingSlot === img.slot;
                    // 封面图跨两列（更宽）
                    const isCover = img.slot === 'cover';

                    return (
                      <div
                        key={img.slot}
                        className={`relative group break-inside-avoid ${isCover ? 'column-span-2' : ''}`}
                      >
                        <div className={`${isCover ? 'aspect-[4/3]' : 'aspect-square'} rounded-xl overflow-hidden shadow-lg`}>
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-full object-cover"
                          />
                          {/* 重新生成时的遮罩 */}
                          {isRegenerating && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                              <span className="text-white text-sm ml-2">重新生成...</span>
                            </div>
                          )}
                        </div>

                        {/* 类型标签 */}
                        <div className="absolute top-2 left-2">
                          <span className={`${config?.color || 'bg-slate-500'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none shadow-sm`}>
                            {img.label}
                          </span>
                        </div>

                        {/* Hover 操作区 */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownloadImage(img.url, `${productName || '商品'}_${img.label}.png`)}
                            className="px-3 py-1.5 bg-white text-slate-800 text-sm rounded-lg flex items-center gap-1 shadow-lg hover:bg-slate-50"
                          >
                            <Download className="w-4 h-4" />
                            下载
                          </button>
                          <button
                            onClick={() => handleRegenerateSlot(img.slot)}
                            disabled={isRegenerating}
                            className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg flex items-center gap-1 shadow-lg hover:bg-orange-600 disabled:opacity-50"
                          >
                            <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                            重新生成
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 底部操作 */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    生成新图片
                  </button>

                  {/* 生成标准 */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">生成标准：</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-500">商业摄影标准 · 高清 · 锐利对焦</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-500">7张详情图 · 封面/卖点/场景/功能/参数</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-500">淘宝/小红书/京东详情页可直接使用</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 解锁高清弹窗 */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="max-w-sm [&>[data-slot=dialog-close]]:opacity-30 [&>[data-slot=dialog-close]]:w-6 [&>[data-slot=dialog-close]]:h-6 [&>[data-slot=dialog-close]]:hover:opacity-50">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">解锁高清详情页图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">更清晰细节（适合电商主图）</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">一键下载整套详情页图片</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">无水印下载 · 可商用</span>
              </div>
            </div>
            <div className="text-center py-2">
              <span className="text-sm text-slate-400 line-through mr-2">原价 ¥29</span>
              <span className="text-2xl font-bold text-orange-600">限时 ¥9.9</span>
              <span className="text-sm text-slate-400 ml-1">/ 10次</span>
            </div>
            <button
              onClick={() => setShowUnlockDialog(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              🔥 立即解锁高清图
            </button>
            <p className="text-[10px] text-center text-slate-400">解锁后可下载高清无水印商品图，支持商用</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
