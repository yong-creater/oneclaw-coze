'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Loader2, Download, X, Check, ArrowRight, Zap, RefreshCw, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UtilityHeader from '@/components/common/UtilityHeader';

// 图片槽位类型（与后端对齐）
type ImageSlot = 'main' | 'selling' | 'scene1' | 'scene2';

interface GeneratedImage {
  slot: ImageSlot;
  url: string;
  label: string;
  order: number;
}

// 槽位配置
const SLOT_CONFIG: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'main', label: '主图', order: 1 },
  { slot: 'selling', label: '卖点图', order: 2 },
  { slot: 'scene1', label: '场景图 1', order: 3 },
  { slot: 'scene2', label: '场景图 2', order: 4 },
];

// 加载状态文案
const LOADING_STEPS = [
  '正在分析商品特征...',
  '正在生成主图...',
  '正在生成卖点图...',
  '正在生成场景图...',
  '正在拼合详情页...',
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
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  // 全屏预览状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

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
    setShowResults(false);
    setGeneratedImages([]);

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

  // 下载全部图片
  const handleDownloadAll = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      const img = generatedImages[i];
      await handleDownloadImage(img.url, `${productName || '商品'}_${img.label}.png`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  // 获取某张图
  const getImage = (slot: ImageSlot): string | null => {
    return generatedImages.find(img => img.slot === slot)?.url || null;
  };

  // 全屏预览：键盘缩放
  useEffect(() => {
    if (!previewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setPreviewOpen(false); setPreviewScale(1); }
      else if (e.key === '+' || e.key === '=') setPreviewScale(s => Math.min(s + 0.25, 5));
      else if (e.key === '-') setPreviewScale(s => Math.max(s - 0.25, 0.5));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewOpen]);

  // 打开预览
  const openPreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewScale(1);
    setPreviewOpen(true);
  };

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
          <span className="text-orange-600 font-bold">完整商品详情页</span>
        </div>

        {/* 左右布局主体区 */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* ==================== 左侧：输入表单 ==================== */}
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
                <span>完整详情页</span>
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
                  生成完整商品详情页长图
                </span>
              </div>
            </div>
          </div>

          {/* ==================== 右侧：商品详情页预览 ==================== */}
          <div>
            {/* 标题区 */}
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                商品详情页预览
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                一键生成完整商品详情页长图
              </p>
            </div>

            {!showResults ? (
              /* ====== 未生成时的占位 ====== */
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center mb-4">
                    <Package className="w-9 h-9 text-orange-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    上传商品图后，将生成可直接用于电商的商品详情页素材
                  </p>
                </div>
              </div>
            ) : (
              /* ====== 生成结果：商品详情页预览 ====== */
              <div>
                {/* --- 封面模块 --- */}
                {getImage('main') && (
                  <div className="mb-4">
                    <img
                      src={getImage('main')!}
                      alt="主图"
                      className="w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openPreview(getImage('main')!)}
                    />
                    {/* 标题占位 */}
                    <div className="px-1 pt-3 pb-1">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-snug">
                        {productName || '商品标题'}
                      </h2>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 font-medium">
                        {productBenefit || '核心卖点短句'}
                      </p>
                    </div>
                  </div>
                )}

                {/* --- 卖点模块 --- */}
                {getImage('selling') && (
                  <div className="mb-4">
                    <img
                      src={getImage('selling')!}
                      alt="卖点图"
                      className="w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openPreview(getImage('selling')!)}
                    />
                    {/* 卖点文案占位 */}
                    <div className="px-1 pt-3 pb-1 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {i === 1 && (productBenefit ? productBenefit.split(/[，,；;]/)[0] : '卖点文案 1')}
                            {i === 2 && (productBenefit && productBenefit.split(/[，,；;]/).length > 1 ? productBenefit.split(/[，,；;]/)[1] : '卖点文案 2')}
                            {i === 3 && '卖点文案 3'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 场景模块 1 --- */}
                {getImage('scene1') && (
                  <div className="mb-4">
                    <img
                      src={getImage('scene1')!}
                      alt="场景图 1"
                      className="w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openPreview(getImage('scene1')!)}
                    />
                  </div>
                )}

                {/* --- 场景模块 2 --- */}
                {getImage('scene2') && (
                  <div className="mb-4">
                    <img
                      src={getImage('scene2')!}
                      alt="场景图 2"
                      className="w-full h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openPreview(getImage('scene2')!)}
                    />
                  </div>
                )}

                {/* --- 底部操作区 --- */}
                <div className="mt-2 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownloadAll}
                      disabled={generatedImages.length === 0}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      下载整套图片
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-600 dark:text-slate-300 text-sm rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      重新生成
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                      可直接用于详情页
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                      淘宝/小红书
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== 全屏预览 ====== */}
      {previewOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => { setPreviewOpen(false); setPreviewScale(1); }}
        >
          {/* 顶部栏 */}
          <div className="flex items-center justify-between px-4 py-3 text-white/90">
            <span className="text-sm font-medium">{productName || '商品详情页'}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewScale(s => Math.min(s + 0.25, 5)); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors text-lg"
                title="放大"
              >
                +
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewScale(s => Math.max(s - 0.25, 0.5)); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors text-lg"
                title="缩小"
              >
                -
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const img = generatedImages.find(i => i.url === previewUrl);
                  handleDownloadImage(previewUrl, `${productName || '商品'}_${img?.label || '图片'}.png`);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); setPreviewScale(1); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 图片区域 */}
          <div
            className="flex-1 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-h-full flex items-start justify-center p-4">
              <img
                src={previewUrl}
                alt="预览"
                className="max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}
              />
            </div>
          </div>
        </div>
      )}

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
