'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Loader2, Download, X, Check, ArrowRight, Zap, RefreshCw, Package, GripVertical, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UtilityHeader from '@/components/common/UtilityHeader';

// 图片槽位类型（与后端对齐）
type ImageSlot = 'cover' | 'selling' | 'feature' | 'scene' | 'comparison' | 'parameter';

interface GeneratedImage {
  slot: ImageSlot;
  url: string;
  label: string;
  order: number;
}

// 槽位配置
const SLOT_CONFIG: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'cover', label: '封面图', order: 1 },
  { slot: 'selling', label: '卖点图', order: 2 },
  { slot: 'feature', label: '功能拆解图', order: 3 },
  { slot: 'scene', label: '使用场景图', order: 4 },
  { slot: 'comparison', label: '对比图', order: 5 },
  { slot: 'parameter', label: '参数图', order: 6 },
];

// 加载状态文案
const LOADING_STEPS = [
  '正在分析商品特征...',
  '正在生成封面图...',
  '正在生成卖点图...',
  '正在生成功能拆解图...',
  '正在生成使用场景图...',
  '正在生成对比图...',
  '正在生成参数图...',
  '正在拼合详情页...',
];

// 最大上传数量
const MAX_IMAGES = 5;

export default function ProductDetailGeneratorPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== 多图上传 =====
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - uploadedImages.length;
    if (remaining <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remaining);

    const readPromises = filesToProcess.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImages) => {
      setUploadedImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    });

    // 重置 input 以便重复选择同一文件
    e.target.value = '';
  };

  // 删除单张图片
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      setUploadedImages((prev) => {
        const newImages = [...prev];
        const [draggedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dragOverIndex, 0, draggedItem);
        return newImages;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ===== 分析卖点 =====
  const handleAnalyzeBenefit = async () => {
    if (uploadedImages.length === 0 && !productName) {
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
          productImage: uploadedImages[0] || undefined,
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

  // ===== 生成详情页 =====
  const handleGenerate = async () => {
    if (uploadedImages.length === 0 && !productName) {
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
          images: uploadedImages,
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
    setUploadedImages([]);
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
            <div className="mb-3">
              {/* 点击上传区 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors bg-gradient-to-br from-slate-50 to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 ${
                  uploadedImages.length >= MAX_IMAGES
                    ? 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  上传商品多角度图片（建议3-5张效果更好）
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  支持 JPG / PNG，最多{MAX_IMAGES}张 · 可拖拽排序
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* 缩略图列表 + 拖拽排序 */}
            {uploadedImages.length > 0 && (
              <div className="mb-3">
                {/* 横向缩略图 */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {uploadedImages.map((img, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragLeave={() => setDragOverIndex(null)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing group ${
                        dragOverIndex === index && dragIndex !== index
                          ? 'border-orange-500 scale-105'
                          : index === 0
                          ? 'border-orange-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-600'
                      } ${dragIndex === index ? 'opacity-40 scale-95' : ''}`}
                    >
                      <img
                        src={img}
                        alt={`商品图${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* 主图标签 */}
                      {index === 0 && (
                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg">
                          主图
                        </div>
                      )}
                      {/* 序号 + 拖拽把手 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-between px-1 py-0.5">
                        <span className="text-[9px] text-white/80 font-medium">#{index + 1}</span>
                        <GripVertical className="w-3 h-3 text-white/60" />
                      </div>
                      {/* 删除按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* 继续添加按钮 */}
                  {uploadedImages.length < MAX_IMAGES && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-slate-400 mb-0.5" />
                      <span className="text-[9px] text-slate-400">添加</span>
                    </div>
                  )}
                </div>

                {/* 图片用途说明 */}
                <div className="mt-2 p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-4 bg-orange-500 text-white text-[8px] font-bold rounded text-center leading-4">1</span>
                      <span className="font-medium text-orange-700 dark:text-orange-400">第一张 → 主图</span>
                      <span className="text-slate-400">（最重要，决定整体效果）</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-4 bg-slate-300 dark:bg-slate-500 text-white text-[8px] font-bold rounded text-center leading-4">+</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">其他图 → 补充细节</span>
                      <span className="text-slate-400">（结构/角度/使用方式）</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  disabled={isAnalyzing || (uploadedImages.length === 0 && !productName)}
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
                <span>6张详情图</span>
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
                  生成6张完整商品详情页素材
                </span>
              </div>
            </div>
          </div>

          {/* ==================== 右侧：电商详情页预览 ==================== */}
          <div>
            {!showResults ? (
              /* ====== 未生成时的占位 ====== */
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center py-24 text-center border border-slate-100 dark:border-slate-700/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  上传商品图后，将生成可直接用于电商的商品详情页素材
                </p>
                <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-2">
                  封面图 · 卖点图 · 功能拆解 · 使用场景 · 对比图 · 参数图
                </p>
              </div>
            ) : (
              /* ====== 生成结果：沉浸式详情页 ====== */
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* 详情页顶部商品信息条 */}
                <div className="px-5 pt-5 pb-3">
                  <h2 className="text-lg font-bold text-slate-800 leading-snug">
                    {productName || '商品标题'}
                  </h2>
                  <p className="text-sm text-orange-600 mt-1 font-medium">
                    {productBenefit || '核心卖点短句'}
                  </p>
                </div>

                {/* 单列大图流：封面 → 卖点 → 功能 → 场景 → 对比 → 参数 */}
                <div className="px-0">
                  {SLOT_CONFIG.map(({ slot }) => {
                    const url = getImage(slot);
                    if (!url) return null;
                    return (
                      <div key={slot} className="relative group cursor-pointer" onClick={() => openPreview(url)}>
                        <img
                          src={url}
                          alt={SLOT_CONFIG.find(s => s.slot === slot)?.label || ''}
                          className="w-full h-auto block"
                        />
                        {/* hover遮罩：点击查看大图 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">
                            点击查看大图
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 底部操作区 */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4">
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
                      className="px-5 py-3 border-2 border-slate-200 hover:border-orange-400 text-slate-600 text-sm rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      重新生成
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                      可直接用于详情页
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                      淘宝/小红书
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                      可截图使用
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
