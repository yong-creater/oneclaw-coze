'use client';

import { useState, useRef } from 'react';
import { 
  Globe, Loader2, Wand2, Download, Upload,
  Settings, Image, Check, AlertCircle, Copy, Sparkles,
  ChevronDown, ChevronUp, Eye, Trash2, Star, Package,
  Shield, Palette, FileText, Zap, RefreshCw, X
} from 'lucide-react';
import UtilityHeader from './UtilityHeader';
import { PrimaryButton, ActionButton } from './UtilityComponents';
import LoginButton from '@/components/LoginButton';

// ==================== 类型定义 ====================
interface GeneratedImage {
  id: string;
  type: 'main' | 'detail' | 'scene' | 'comparison';
  url: string;
  prompt: string;
  complianceScore: number;
  complianceNotes: string[];
  violations: string[];
}

interface ComplianceReport {
  score: number;
  violations: {
    type: string;
    description: string;
    suggestion: string;
  }[];
  regionAdaptation: string[];
  culturalNotes: string[];
}

// ==================== 常量 ====================
const PLATFORMS = [
  { value: 'amazon', label: '亚马逊', rules: '白底主图，1500x1500px，JPEG/PNG格式，禁止水印' },
  { value: 'tiktok', label: 'TikTok Shop', rules: '1:1或9:16比例，PNG/JPG，最大5MB' },
  { value: 'aliexpress', label: '速卖通', rules: '800x800px，支持白底/透明底，禁止文字遮挡' },
  { value: 'independent', label: '独立站', rules: '1200x1200px，建议PNG格式，可带背景' },
];

const REGIONS = [
  { 
    value: 'eu', 
    label: '欧盟', 
    regulations: ['CE标识(强制)', '禁止夸大宣传', '无侵权元素', '多语言标注'],
    culture: '简洁大气、色调柔和、注重环保元素展示'
  },
  { 
    value: 'us', 
    label: '美国', 
    regulations: ['FDA认证标识', '尺寸合规', '禁止敏感图案', '英文为主'],
    culture: '简约实用、光影自然、突出商品质感'
  },
  { 
    value: 'uk', 
    label: '英国', 
    regulations: ['UKCA标识', '英文标注', '合规细则', '退换政策'],
    culture: '经典优雅、色调沉稳、英伦风格'
  },
  { 
    value: 'jp', 
    label: '日本', 
    regulations: ['PSE标识', '日文标注', '禁止暴力内容', '素雅色调'],
    culture: '简约细腻、色调素雅、贴合本土审美'
  },
  { 
    value: 'sea', 
    label: '东南亚', 
    regulations: ['无宗教敏感元素', '本地语言标注', '价格含税标识'],
    culture: '色彩鲜艳、场景生活化、融入本土元素'
  },
];

const CATEGORIES = [
  { value: '3c', label: '3C电子', features: ['细节图突出', '参数展示', '包装展示'] },
  { value: 'home', label: '家居园艺', features: ['场景图为主', '功能展示', '材质说明'] },
  { value: 'beauty', label: '美妆个护', features: ['使用场景', '成分展示', '效果对比'] },
  { value: 'clothing', label: '服装鞋帽', features: ['模特展示', '细节特写', '尺码说明'] },
  { value: 'outdoor', label: '户外用品', features: ['使用场景', '功能展示', '防护性能'] },
  { value: 'other', label: '其他', features: ['通用详情图', '卖点展示', '规格说明'] },
];

const IMAGE_TYPES = [
  { value: 'main', label: '白底主图', desc: '适配所有平台要求' },
  { value: 'detail', label: '细节图', desc: '突出商品材质/工艺' },
  { value: 'scene', label: '场景图', desc: '贴合目标地区人文场景' },
  { value: 'comparison', label: '对比图', desc: '突出商品优势' },
];

const QUALITY_OPTIONS = [
  { value: '512', label: '标清', desc: '512x512px，快速生成' },
  { value: '1024', label: '高清', desc: '1024x1024px，推荐使用' },
  { value: '2048', label: '超清', desc: '2048x2048px，AI补全细节' },
];

const TONE_OPTIONS = [
  { value: 'soft', label: '柔和' },
  { value: 'vivid', label: '鲜艳' },
  { value: 'steady', label: '沉稳' },
  { value: 'simple', label: '素雅' },
];

// ==================== 主组件 ====================
export default function ProductPageGenerator() {
  // 配置状态
  const [platform, setPlatform] = useState('amazon');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['us']);
  const [category, setCategory] = useState('3c');
  
  // 输入状态
  const [sellingPoints, setSellingPoints] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [extraRequirements, setExtraRequirements] = useState('');
  
  // 图片配置
  const [selectedImageTypes, setSelectedImageTypes] = useState<string[]>(['main', 'detail', 'scene']);
  const [imageCount, setImageCount] = useState(3);
  const [quality, setQuality] = useState('1024');
  const [tone, setTone] = useState('soft');
  const [detailOptions, setDetailOptions] = useState({
    highlightMaterial: true,
    strengthenCompliance: true,
    optimizeScene: false,
  });
  
  // 生成状态
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState('');
  
  // UI状态
  const [showConfig, setShowConfig] = useState(true);
  const [showHelper, setShowHelper] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理地区选择
  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // 处理图片类型选择
  const toggleImageType = (type: string) => {
    setSelectedImageTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // AI提炼卖点
  const handleExtractPoints = async () => {
    if (!sellingPoints.trim()) {
      alert('请先输入商品卖点');
      return;
    }
    
    try {
      const response = await fetch('/api/product-page/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sellingPoints, category }),
      });
      
      const data = await response.json();
      if (data.content) {
        setSellingPoints(data.content);
      }
    } catch (error) {
      console.error('提炼卖点失败:', error);
    }
  };

  // 上传参考图
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 生成商品详情图
  const handleGenerate = async () => {
    if (!sellingPoints.trim()) {
      alert('请输入商品卖点');
      return;
    }
    if (selectedRegions.length === 0) {
      alert('请选择至少一个目标地区');
      return;
    }
    
    setGenerating(true);
    setGeneratingProgress('正在分析商品信息...');
    setGeneratedImages([]);
    setComplianceReport(null);
    
    try {
      const response = await fetch('/api/product-page/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          regions: selectedRegions,
          category,
          sellingPoints,
          referenceImage,
          imageTypes: selectedImageTypes,
          imageCount,
          quality,
          tone,
          detailOptions,
          extraRequirements,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 保存使用记录
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'product_page',
          input_data: { 
            platform,
            regions: selectedRegions,
            category,
            selling_points_length: sellingPoints.length,
            image_types: selectedImageTypes,
            quality,
          },
          output_data: { 
            images_count: data.images?.length || 0,
            has_compliance: !!data.compliance,
          },
          status: 'success',
        }),
      }).catch(console.error);
      
      setGeneratingProgress('正在生成商品详情图...');
      setGeneratedImages(data.images || []);
      setComplianceReport(data.compliance || null);
      
    } catch (error: any) {
      console.error('生成失败:', error);
      
      // 保存失败记录
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'product_page',
          input_data: { platform, regions: selectedRegions, category },
          status: 'failed',
          error_message: error.message || '生成失败',
        }),
      }).catch(console.error);
      
      alert(error.message || '生成失败，请重试');
    } finally {
      setGenerating(false);
      setGeneratingProgress('');
    }
  };

  // 合规检测
  const handleComplianceCheck = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/product-page/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          region: selectedRegions[0],
          platform,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('合规检测失败:', error);
      return null;
    }
  };

  // 一键修复违规
  const handleFixViolation = async (imageId: string, violation: string) => {
    setGenerating(true);
    setGeneratingProgress('正在修复违规内容...');
    
    try {
      const response = await fetch('/api/product-page/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId,
          violation,
          platform,
          region: selectedRegions[0],
          category,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        setGeneratedImages(prev => 
          prev.map(img => img.id === imageId ? { ...img, url: data.url } : img)
        );
      }
    } catch (error) {
      console.error('修复失败:', error);
      alert('修复失败，请重试');
    } finally {
      setGenerating(false);
      setGeneratingProgress('');
    }
  };

  // 下载单张图片
  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `product_${image.type}_${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 复制提示词
  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 重新生成单张
  const handleRegenerateSingle = async (imageType: string) => {
    setGenerating(true);
    setGeneratingProgress(`正在重新生成${IMAGE_TYPES.find(t => t.value === imageType)?.label}...`);
    
    try {
      const response = await fetch('/api/product-page/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          region: selectedRegions[0],
          category,
          sellingPoints,
          referenceImage,
          imageType,
          quality,
          tone,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        setGeneratedImages(prev => {
          const existing = prev.filter(img => img.type !== imageType);
          return [...existing, data];
        });
      }
    } catch (error) {
      console.error('重新生成失败:', error);
      alert('重新生成失败，请重试');
    } finally {
      setGenerating(false);
      setGeneratingProgress('');
    }
  };

  // 清空输入
  const handleClear = () => {
    setSellingPoints('');
    setReferenceImage(null);
    setExtraRequirements('');
    setGeneratedImages([]);
    setComplianceReport(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 统一头部 */}
      <UtilityHeader
        toolIcon={<Globe />}
        toolName="出海详情页"
        toolDescription="合规适配 · 人文贴合 · 多平台兼容"
        gradient="from-emerald-500 to-teal-500"
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧配置区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 核心配置 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div 
                className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                onClick={() => setShowConfig(!showConfig)}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-semibold text-slate-800 dark:text-white">核心配置</h2>
                </div>
                {showConfig ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
              
              {showConfig && (
                <div className="p-6 space-y-6">
                  {/* 目标平台 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      目标平台
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      {PLATFORMS.find(p => p.value === platform)?.rules}
                    </p>
                  </div>

                  {/* 目标地区 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      目标地区（可多选）
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {REGIONS.map(region => (
                        <button
                          key={region.value}
                          onClick={() => toggleRegion(region.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedRegions.includes(region.value)
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {region.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 类目选择 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      商品类目
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      特点：{CATEGORIES.find(c => c.value === category)?.features.join('、')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 商品卖点输入 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-semibold text-slate-800 dark:text-white">商品卖点</h2>
                </div>
                <button
                  onClick={handleExtractPoints}
                  className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                >
                  <Zap className="w-4 h-4" />
                  AI提炼卖点
                </button>
              </div>
              
              <textarea
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                placeholder="请输入商品核心卖点（功能、材质、优势、场景等），越详细，生成的图片越精准..."
                className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              
              {/* 参考图上传 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  参考图（可选）
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">上传参考图</span>
                  </button>
                  {referenceImage && (
                    <div className="relative">
                      <img 
                        src={referenceImage} 
                        alt="参考图" 
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() => setReferenceImage(null)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">支持JPG/PNG格式，单个文件不超过10MB</p>
              </div>
            </div>

            {/* 图片配置 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-emerald-500" />
                图片配置
              </h2>
              
              {/* 图片类型 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  图片类型
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {IMAGE_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => toggleImageType(type.value)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedImageTypes.includes(type.value)
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 画质设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  画质设置
                </label>
                <div className="flex gap-2">
                  {QUALITY_OPTIONS.map(q => (
                    <button
                      key={q.value}
                      onClick={() => setQuality(q.value)}
                      className={`flex-1 p-3 rounded-xl text-center transition-all ${
                        quality === q.value
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{q.label}</div>
                      <div className="text-xs opacity-80">{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 色调调整 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  色调调整
                </label>
                <div className="flex gap-2">
                  {TONE_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        tone === t.value
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 细节优化 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  细节优化
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailOptions.highlightMaterial}
                      onChange={(e) => setDetailOptions(prev => ({ ...prev, highlightMaterial: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">突出材质细节</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailOptions.strengthenCompliance}
                      onChange={(e) => setDetailOptions(prev => ({ ...prev, strengthenCompliance: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">强化合规标识</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailOptions.optimizeScene}
                      onChange={(e) => setDetailOptions(prev => ({ ...prev, optimizeScene: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">优化场景真实感</span>
                  </label>
                </div>
              </div>

              {/* 额外要求 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  额外要求（可选）
                </label>
                <textarea
                  value={extraRequirements}
                  onChange={(e) => setExtraRequirements(e.target.value)}
                  placeholder="输入图片细节需求，如：合规标识放置在右下角、场景图融入当地生活元素..."
                  className="w-full h-20 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="flex gap-4">
              <PrimaryButton 
                onClick={handleGenerate}
                disabled={generating || !sellingPoints.trim()}
                loading={generating}
                icon={<Wand2 />}
                className="flex-1"
              >
                {generatingProgress || '立即生成'}
              </PrimaryButton>
              <ActionButton variant="secondary" onClick={handleClear} icon={<Trash2 />}>
                清空
              </ActionButton>
            </div>

            {/* 生成结果 */}
            {generatedImages.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  生成结果 ({generatedImages.length}张)
                </h2>
                
                {/* 合规评分 */}
                {complianceReport && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">合规评分</span>
                      <span className={`text-lg font-bold ${
                        complianceReport.score >= 90 ? 'text-green-500' :
                        complianceReport.score >= 70 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {complianceReport.score}分
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          complianceReport.score >= 90 ? 'bg-green-500' :
                          complianceReport.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${complianceReport.score}%` }}
                      />
                    </div>
                    
                    {complianceReport.violations.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {complianceReport.violations.map((v, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-red-600 dark:text-red-400">{v.description}</p>
                              <p className="text-xs text-slate-500 mt-1">{v.suggestion}</p>
                            </div>
                            <button
                              onClick={() => handleFixViolation(generatedImages[0]?.id || '', v.type)}
                              className="text-xs text-emerald-500 hover:text-emerald-600 whitespace-nowrap"
                            >
                              一键修复
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 图片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedImages.map((image) => (
                    <div 
                      key={image.id}
                      className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group"
                    >
                      <img 
                        src={image.url}
                        alt={image.type}
                        className="w-full aspect-square object-cover"
                      />
                      
                      {/* 操作栏 */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(image)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="下载"
                        >
                          <Download className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(image.prompt, image.id)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="复制提示词"
                        >
                          {copiedId === image.id ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-slate-700" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRegenerateSingle(image.type)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="重新生成"
                        >
                          <RefreshCw className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="预览"
                        >
                          <Eye className="w-5 h-5 text-slate-700" />
                        </button>
                      </div>
                      
                      {/* 类型标签 */}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                        {IMAGE_TYPES.find(t => t.value === image.type)?.label || image.type}
                      </div>
                      
                      {/* 合规评分 */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {image.complianceScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧辅助区域 */}
          <div className="space-y-6">
            {/* 核心卖点 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" />
                核心优势
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, text: '合规适配' },
                  { icon: Globe, text: '人文贴合' },
                  { icon: Palette, text: '多地区适配' },
                  { icon: Package, text: '批量生成' },
                  { icon: Image, text: '高清无水印' },
                  { icon: Sparkles, text: '风格统一' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 地区合规说明 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                合规规则
              </h3>
              <div className="space-y-3">
                {REGIONS.map(region => (
                  <div 
                    key={region.value}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    onClick={() => setActiveRegion(activeRegion === region.value ? null : region.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{region.label}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeRegion === region.value ? 'rotate-180' : ''}`} />
                    </div>
                    {activeRegion === region.value && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-500">法规要求：</p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {region.regulations.map((r, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-500" />
                              {r}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-slate-500 mt-2">人文风情：</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{region.culture}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 平台规则 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                平台规则
              </h3>
              <div className="space-y-3">
                {PLATFORMS.map(p => (
                  <div 
                    key={p.value}
                    className={`p-3 rounded-xl transition-colors ${
                      platform === p.value 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.rules}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
