'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Loader2, Download, X, Check, RefreshCw, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UtilityHeader from '@/components/common/UtilityHeader';

// 图片槽位类型（与后端对齐）
type ImageSlot = 'main' | 'scene' | 'selling';

interface GeneratedImage {
  slot: ImageSlot;
  url: string;
  label: string;
  order: number;
}

// 槽位配置
const SLOT_CONFIG: { slot: ImageSlot; label: string; order: number }[] = [
  { slot: 'main', label: '主图', order: 1 },
  { slot: 'scene', label: '使用场景图', order: 2 },
  { slot: 'selling', label: '卖点图', order: 3 },
];

// 加载状态文案（与右侧生成提示对应）
const LOADING_STEPS = [
  '正在分析商品特征...',
  '正在生成主图...',
  '正在生成场景图...',
  '正在生成卖点图...',
  '即将完成...',
];

// 最大上传数量
const MAX_IMAGES = 5;

// 示例生成结果（默认展示）— 同一商品（白色蓝牙耳机）的不同效果
const DEMO_IMAGES = [
  { slot: 'main' as ImageSlot, url: '/demo-main.jpg', label: '商品主图', order: 1 },
  { slot: 'scene' as ImageSlot, url: '/demo-scene.jpg', label: '使用场景', order: 2 },
  { slot: 'selling' as ImageSlot, url: '/demo-lifestyle.jpg', label: '卖点图', order: 3 },
];

export default function ProductDetailGeneratorPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [productBenefit, setProductBenefit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatingStep, setGeneratingStep] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  // 生成过程：逐步展现状态
  const [revealedSlots, setRevealedSlots] = useState<Set<ImageSlot>>(new Set());
  const [titleRevealed, setTitleRevealed] = useState(false);

  // 全屏预览状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== 多图上传 =====
  // HEIC → JPEG 转换（解决iPhone默认HEIC格式）
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const ext = file.name.toLowerCase().split('.').pop() || '';
    const type = file.type.toLowerCase();
    const isHeic = ext === 'heic' || ext === 'heif' || type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || (type === 'application/octet-stream' && (ext === 'heic' || ext === 'heif'));
    if (!isHeic) return file;

    try {
      // 先尝试浏览器原生支持（Safari/最新Chrome可能直接支持HEIC）
      const nativeTest = await new Promise<boolean>((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        const timeout = setTimeout(() => { URL.revokeObjectURL(url); resolve(false); }, 3000);
        img.onload = () => { clearTimeout(timeout); URL.revokeObjectURL(url); resolve(true); };
        img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); resolve(false); };
        img.src = url;
      });

      if (nativeTest) {
        // 浏览器原生支持HEIC，直接返回原文件让Canvas处理
        console.log('浏览器原生支持HEIC，跳过heic2any转换');
        return new File([file], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
      }

      // 浏览器不支持，使用heic2any转换
      const heic2any = (await import('heic2any')).default;
      const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      const blob = Array.isArray(result) ? result[0] : result;
      const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      return new File([blob], newName, { type: 'image/jpeg' });
    } catch (err) {
      console.error('HEIC转换失败:', err);
      throw new Error('HEIC格式转换失败，请在相册中转为JPG后重新上传');
    }
  };

  // 将任意格式图片转为JPEG base64
  const convertToJpeg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载超时'));
      }, 15000);

      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas创建失败')); return; }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        URL.revokeObjectURL(url);
        resolve(jpegDataUrl);
      };
      img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); reject(new Error('图片加载失败')); };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - uploadedImages.length;
    if (remaining <= 0) {
      setUploadError(`最多支持 ${MAX_IMAGES} 张商品图，推荐上传 3 张`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remaining);

    setIsUploading(true);
    setUploadError(null);
    try {
      // Step 1: HEIC先转JPEG（顺序处理，避免heic2any并行崩溃）
      const convertedFiles: File[] = [];
      const heicFailNames: string[] = [];
      for (const f of filesToProcess) {
        try {
          const converted = await convertHeicToJpeg(f);
          convertedFiles.push(converted);
        } catch (err) {
          console.error('单张HEIC转换失败:', f.name, err);
          heicFailNames.push(f.name);
        }
      }
      if (convertedFiles.length === 0) {
        const heicHint = heicFailNames.length > 0
          ? 'HEIC格式转换失败，请在相册中选择"选项"→"照片"→改为"自动"或"JPG"后重试'
          : '所有图片处理失败，请尝试JPG/PNG格式';
        setUploadError(heicHint);
        return;
      }
      // Step 2: 所有图片转base64 JPEG（并行）
      const results = await Promise.allSettled(
        convertedFiles.map(f => convertToJpeg(f))
      );
      const newImages: string[] = [];
      const failedCount = results.filter(r => r.status === 'rejected').length;
      for (const r of results) {
        if (r.status === 'fulfilled') newImages.push(r.value);
      }
      if (newImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
      }
      if (failedCount > 0 && newImages.length === 0) {
        setUploadError(`图片处理失败（${failedCount}张），请尝试JPG/PNG格式`);
      } else if (failedCount > 0) {
        setUploadError(`${failedCount}张图片处理失败，已成功处理${newImages.length}张`);
      } else if (heicFailNames.length > 0 && newImages.length > 0) {
        setUploadError(`${heicFailNames.length}张HEIC图片转换失败，已成功处理${newImages.length}张`);
      }
    } catch (err) {
      console.error('图片处理异常:', err);
      const msg = err instanceof Error ? err.message : '图片处理异常';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }

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
      clearInterval(stepInterval);

      // 分步展现动画：主图 → 场景图 → 卖点图，每步间隔 0.6s
      setRevealedSlots(new Set());
      setTitleRevealed(false);
      setTimeout(() => setTitleRevealed(true), 300);
      images.forEach((img, idx) => {
        setTimeout(() => {
          setRevealedSlots(prev => new Set([...prev, img.slot]));
        }, 600 + idx * 600);
      });
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
    setRevealedSlots(new Set());
    setTitleRevealed(false);
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

      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* 核心价值标题 */}
        <div className="text-center mb-7">
          <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-0.5 tracking-tight">
            让商品图帮你<span className="text-orange-500">卖货</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            普通商品照 <span className="text-orange-400 mx-0.5">→</span> 能上架的电商详情页
          </p>
        </div>

        {/* 左右布局主体区 */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 items-start">
          {/* ==================== 左侧：卡片式主操作区 ==================== */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 pb-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] flex flex-col gap-4">

            {/* ===== 上传区域 ===== */}
            {uploadedImages.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-[#FAFAFA] dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 border border-dashed border-[#E5E7EB] dark:border-slate-600 hover:border-[#FF7A00] dark:hover:border-[#FF7A00] min-h-[220px] flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF5EB] dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-[#FF7A00]" strokeWidth={2.5} />
                </div>
                <p className="text-slate-800 dark:text-white font-bold text-base mb-1">上传商品图片</p>
                <p className="text-slate-400 text-sm">推荐 3 张，最多 {MAX_IMAGES} 张</p>
              </div>
            ) : (
              <div className="space-y-3">
                  {/* 主图（第一张，大图展示） */}
                  <div
                    draggable
                    onDragStart={() => handleDragStart(0)}
                    onDragOver={(e) => handleDragOver(e, 0)}
                    onDragEnd={handleDragEnd}
                    onDragLeave={() => setDragOverIndex(null)}
                    className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing group ${dragOverIndex === 0 && dragIndex !== 0 ? 'border-orange-500 scale-[1.02]' : 'border-orange-400 shadow-sm'} ${dragIndex === 0 ? 'opacity-40 scale-95' : ''}`}
                  >
                    <img src={uploadedImages[0]} alt="商品图" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(0); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 辅助图（横排小图，最多展示4张） */}
                  {uploadedImages.length > 1 && (
                    <div className="flex gap-2">
                      {uploadedImages.slice(1, 5).map((img, idx) => {
                        const ri = idx + 1;
                        return (
                          <div
                            key={ri}
                            draggable
                            onDragStart={() => handleDragStart(ri)}
                            onDragOver={(e) => handleDragOver(e, ri)}
                            onDragEnd={handleDragEnd}
                            onDragLeave={() => setDragOverIndex(null)}
                            className={`relative flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing group ${dragOverIndex === ri && dragIndex !== ri ? 'border-orange-500 scale-105' : 'border-slate-200 dark:border-slate-600'} ${dragIndex === ri ? 'opacity-40 scale-95' : ''}`}
                          >
                            <img src={img} alt={`图片${ri + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveImage(ri); }}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                      {/* 超出4张时的折叠提示 */}
                      {uploadedImages.length > 5 && (
                        <div className="relative flex-1 aspect-square rounded-lg border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-xs text-slate-400 font-medium">+{uploadedImages.length - 5}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 计数 */}
                  <p className="text-[11px] text-slate-400 text-center">{uploadedImages.length}/{MAX_IMAGES}</p>
                </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" multiple onChange={handleImageUpload} className="hidden" />

            {/* 上传中提示 */}
            {isUploading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-orange-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在处理图片...</span>
              </div>
            )}

            {/* 上传错误提示 */}
            {uploadError && (
              <div className="flex items-center gap-2 mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                <X className="w-3 h-3 flex-shrink-0" />
                <span>{uploadError}</span>
                <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0"><X className="w-3 h-3" /></button>
              </div>
            )}

            {/* 商品名称 */}
            <div>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="商品名称（如：头戴式降噪耳机）" className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 text-sm" />
            </div>

            {/* 商品卖点 */}
            <div>
              <div className="flex gap-2">
                <textarea value={productBenefit} onChange={(e) => setProductBenefit(e.target.value)} placeholder="商品卖点（如：主动降噪 40小时续航 HiFi音质）" rows={2} className="flex-1 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 resize-none text-sm" />
                <button onClick={handleAnalyzeBenefit} disabled={isAnalyzing || (uploadedImages.length === 0 && !productName)} className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-1 self-end">
                  <Sparkles className="w-3 h-3" />{isAnalyzing ? '分析中...' : 'AI写卖点'}
                </button>
              </div>
            </div>

            {/* ===== 生成按钮 ===== */}
            <button onClick={handleGenerate} disabled={isGenerating} className="w-full h-12 mt-5 text-white font-bold text-[15px] rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(255,106,0,0.35)] hover:shadow-[0_8px_24px_rgba(255,106,0,0.5)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_rgba(255,106,0,0.35)] disabled:active:scale-100 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C00)' }}>
              {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" />{generatingStep || '正在生成...'}</>) : (<>🔥 立即生成卖货图</>)}
            </button>


          </div>

          {/* ==================== 右侧：电商详情页预览 ==================== */}
          <div>
            {isGenerating ? (
              /* ====== 生成中：骨架屏 + 分步提示 ====== */
              <div className="space-y-5">
                {/* 主图骨架 */}
                <div className="w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center animate-none">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-orange-400 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium">{generatingStep || '正在生成...'}</p>
                    </div>
                  </div>
                </div>
                {/* 三图骨架 */}
                <div className="grid grid-cols-3 gap-3">
                  {SLOT_CONFIG.map(({ slot, label }) => (
                    <div key={slot} className="h-[140px] rounded-xl bg-stone-50 relative overflow-hidden animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center animate-none">
                        <span className="text-[11px] text-slate-300 font-medium">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !showResults ? (
              /* ====== 示例效果展示：视觉主区域 ====== */
              <div>

                {/* A. 主视觉 Banner（横幅大图，视觉中心） */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#f5f7fa] mb-3">
                  <img
                    src={DEMO_IMAGES[0].url}
                    alt="示例主图"
                    className="w-full h-full object-contain"
                  />

                </div>

                {/* B. 三张能力展示图（不同品类） */}
                <div className="grid grid-cols-3 gap-3">
                  {/* 使用场景 */}
                  <div className="space-y-1">
                    <div className="rounded-xl overflow-hidden">
                      <img src="/demo-card-digital.jpg" alt="使用场景" className="w-full h-[140px] object-cover" />
                    </div>
                    <p className="text-center text-[10px] text-slate-400">使用场景</p>
                  </div>
                  {/* 核心功能 */}
                  <div className="space-y-1">
                    <div className="rounded-xl overflow-hidden">
                      <img src="/demo-card-home.jpg" alt="核心功能" className="w-full h-[140px] object-cover" />
                    </div>
                    <p className="text-center text-[10px] text-slate-400">核心功能</p>
                  </div>
                  {/* 卖点展示 */}
                  <div className="space-y-1">
                    <div className="rounded-xl overflow-hidden">
                      <img src="/demo-card-lifestyle.jpg" alt="卖点展示" className="w-full h-[140px] object-cover" />
                    </div>
                    <p className="text-center text-[10px] text-slate-400">卖点展示</p>
                  </div>
                </div>

                {/* 轻量信任提示 */}
                <p className="text-center text-[11px] text-slate-400 mt-4">
                  已帮助 12,000+ 商家生成卖货素材
                </p>
              </div>
            ) : (
              /* ====== 生成结果：三层结构 ====== */
              <div className="space-y-6">
                {/* 商品信息 */}
                <div className={`transition-all duration-500 ${titleRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  <h2 className="text-lg font-bold text-slate-800 leading-snug">
                    {productName || '商品标题'}
                  </h2>
                  <p className="text-sm text-orange-600 mt-1 font-medium">
                    {productBenefit || '核心卖点短句'}
                  </p>
                </div>

                {/* A. 主视觉区（Hero） */}
                {getImage('main') && (
                  <div className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-500 bg-[#f5f7fa] ${revealedSlots.has('main') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} onClick={() => openPreview(getImage('main')!)}>
                    <img
                      src={getImage('main')!}
                      alt="主图"
                      className="w-full aspect-[16/9] object-contain"
                    />
                  </div>
                )}

                {/* B. 三图卡片区（Cards） */}
                <div className="grid grid-cols-3 gap-4">
                  {SLOT_CONFIG.map(({ slot, label }) => {
                    const url = getImage(slot);
                    if (!url) return null;
                    return (
                      <div key={slot} className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-500 ${revealedSlots.has(slot) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} onClick={() => openPreview(url)}>
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-[150px] object-cover"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 底部操作区 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadAll}
                    disabled={generatedImages.length === 0}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载全部图片
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-3 border-2 border-slate-200 hover:border-orange-400 text-slate-600 text-sm rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    换一张
                  </button>
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
