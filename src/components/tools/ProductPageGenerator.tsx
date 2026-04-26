'use client';

import { useState, useRef } from 'react';
import { 
  Globe, Loader2, Wand2, Download, Upload,
  Settings, Image, Check, Copy, Sparkles,
  ChevronDown, ChevronUp, Eye, Trash2, Package,
  Shield, Palette, FileText, Zap, RefreshCw, X,
  Layers, Target, EyeIcon, Info, BarChart3, 
  CheckCircle2, AlertTriangle, ChevronRight,
  Grid3X3, Maximize2, Sparkle
} from 'lucide-react';
import UtilityHeader from '../common/UtilityHeader';
import { PrimaryButton, ActionButton } from '../common/UtilityComponents';
import LoginButton from '@/components/common/LoginButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ==================== 类型定义 ====================
interface GeneratedImage {
  id: string;
  type: 'main' | 'scene' | 'model' | 'detail' | 'feature' | 'spec' | 'process' | 'brand';
  url: string;
  prompt: string;
  complianceScore: number;
  complianceNotes: string[];
  violations: string[];
  platform?: string;
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

// ==================== 常量 - 5大必选模块 + 3个可选模块 ====================

// 平台配置（亚马逊为核心）
const PLATFORMS = [
  { 
    value: 'amazon', 
    label: '亚马逊（核心）', 
    rules: '白底主图1:1，≥2000×2000px，JPG+PNG双版本，禁止水印/文字/模特',
    mainImage: '1:1 (2000×2000px)',
    detailImage: '1:1 或 3:4',
    compliance: ['纯白底RGB #FFFFFF', '商品占比≥80%', '无配件/赠品', '无文字/水印']
  },
  { 
    value: 'shopify', 
    label: 'Shopify', 
    rules: '支持个性化场景图，PNG/JPG，最大5MB',
    mainImage: '1:1 或 4:3',
    detailImage: '3:4（竖屏推荐）',
    compliance: ['高清无模糊', '无侵权元素', '可带背景/文字']
  },
  { 
    value: 'etsy', 
    label: 'Etsy', 
    rules: '支持个性化，JPEG/PNG，最大5MB',
    mainImage: '1:1',
    detailImage: '1:1 或 4:3',
    compliance: ['白底推荐', '可添加logo/文字', '无侵权']
  },
  { 
    value: 'ebay', 
    label: 'eBay', 
    rules: '支持白色或透明背景，PNG/JPG，最大7MB',
    mainImage: '1:1 (1600×1600px)',
    detailImage: '4:3 或 3:4',
    compliance: ['白色或透明底', '商品居中', '无边框/水印']
  },
  { 
    value: 'tmall', 
    label: '天猫/京东', 
    rules: '主图800×800px，支持logo/促销文字（合规）',
    mainImage: '1:1 (800×800px)',
    detailImage: '3:4（竖屏）',
    compliance: ['支持左上角logo', '促销文字合规', '高清无模糊']
  },
];

// 目标地区
const REGIONS = [
  { 
    value: 'us', 
    label: '美国',
    icon: '🇺🇸',
    regulations: ['FDA认证标识', '英文标注', 'FTC合规'],
    culture: '简约实用、光影自然、突出商品质感'
  },
  { 
    value: 'eu', 
    label: '欧盟',
    icon: '🇪🇺',
    regulations: ['CE标识(强制)', '多语言标注', '禁止夸大'],
    culture: '简洁大气、色调柔和、注重环保元素'
  },
  { 
    value: 'uk', 
    label: '英国',
    icon: '🇬🇧',
    regulations: ['UKCA标识', '英文标注', '退换政策'],
    culture: '经典优雅、色调沉稳、英伦风格'
  },
  { 
    value: 'jp', 
    label: '日本',
    icon: '🇯🇵',
    regulations: ['PSE标识', '日文标注', '素雅色调'],
    culture: '简约细腻、色调素雅、贴合本土审美'
  },
  { 
    value: 'sea', 
    label: '东南亚',
    icon: '🌏',
    regulations: ['本地语言', '无宗教元素', '价格标注'],
    culture: '色彩鲜艳、场景生活化、本土元素'
  },
];

// 商品类目
const CATEGORIES = [
  { 
    value: '3c', 
    label: '3C电子',
    icon: '📱',
    features: ['细节图突出', '参数展示', '功能演示'],
    recommendedModules: ['main', 'detail', 'feature', 'spec']
  },
  { 
    value: 'home', 
    label: '家居日用',
    icon: '🏠',
    features: ['场景图为主', '材质说明', '功能展示'],
    recommendedModules: ['main', 'scene', 'detail', 'feature']
  },
  { 
    value: 'beauty', 
    label: '美妆护肤',
    icon: '💄',
    features: ['使用场景', '成分展示', '效果对比'],
    recommendedModules: ['main', 'model', 'detail', 'feature']
  },
  { 
    value: 'clothing', 
    label: '服饰鞋帽',
    icon: '👕',
    features: ['模特展示', '细节特写', '尺码说明'],
    recommendedModules: ['main', 'model', 'detail', 'spec']
  },
  { 
    value: 'outdoor', 
    label: '户外用品',
    icon: '🏕️',
    features: ['使用场景', '功能展示', '防护性能'],
    recommendedModules: ['main', 'scene', 'detail', 'feature']
  },
  { 
    value: 'appliance', 
    label: '家用电器',
    icon: '🔌',
    features: ['功能展示', '细节说明', '参数对比'],
    recommendedModules: ['main', 'scene', 'detail', 'feature', 'spec']
  },
];

// 5大必选模块 + 3个可选模块
const IMAGE_MODULES = [
  // 必选模块
  { 
    id: 'main', 
    label: '主图', 
    type: 'required',
    icon: Target,
    desc: '白底合规主图，1:1正方形，≥2000×2000px',
    compliance: ['纯白底 RGB#FFFFFF', '商品占比75%-85%', '无文字/水印/模特', '双版本JPG+PNG']
  },
  { 
    id: 'scene', 
    label: '场景展示图', 
    type: 'required',
    icon: EyeIcon,
    desc: '营造使用氛围，3:4竖屏，≥1500×2000px',
    compliance: ['场景与商品匹配', '商品占比≥60%', '光影自然', '可添加英文标语']
  },
  { 
    id: 'model', 
    label: '模特场景图', 
    type: 'required', // 服饰/美妆强推
    icon: Grid3X3,
    desc: '展示上身效果，3:4竖屏，≥1500×2000px',
    compliance: ['模特不露脸', '商品展示完整', '场景匹配', '无肖像权风险']
  },
  { 
    id: 'detail', 
    label: '细节说明图', 
    type: 'required',
    icon: Maximize2,
    desc: '展示材质工艺，1:1或4:3，≥2000×2000px',
    compliance: ['近距离特写', '对焦清晰', '可添加标注', '突出品质细节']
  },
  { 
    id: 'feature', 
    label: '卖点详解图', 
    type: 'required',
    icon: Sparkle,
    desc: '可视化核心卖点，3:4或1:1，≥1500×2000px',
    compliance: ['图标+短句结构', '卖点≤4个', '中英双语', '排版整洁对称']
  },
  // 可选模块
  { 
    id: 'spec', 
    label: '参数/尺寸图', 
    type: 'optional',
    icon: BarChart3,
    desc: '展示规格参数，跨境平台必选',
    compliance: ['长宽高+重量', '中英双单位', '线框图简洁', '参数准确']
  },
  { 
    id: 'process', 
    label: '功能/使用流程图', 
    type: 'optional',
    icon: Layers,
    desc: '展示使用步骤或功能对比',
    compliance: ['步骤清晰', '逻辑明确', '图标统一', '无冗余信息']
  },
  { 
    id: 'brand', 
    label: '品牌/售后保障图', 
    type: 'optional',
    icon: Shield,
    desc: '提升品牌信任度',
    compliance: ['质保期限', '认证标识', '排版简洁', '无虚假承诺']
  },
];

// 画质选项
const QUALITY_OPTIONS = [
  { value: '1024', label: '标清', desc: '1024×1024px，快速生成' },
  { value: '1536', label: '高清', desc: '1536×1536px，推荐使用' },
  { value: '2048', label: '超清', desc: '2048×2048px，AI补全细节' },
];

// 色调选项
const TONE_OPTIONS = [
  { value: 'natural', label: '自然光', color: 'bg-amber-100' },
  { value: 'warm', label: '暖色调', color: 'bg-orange-100' },
  { value: 'cool', label: '冷色调', color: 'bg-sky-100' },
  { value: 'neutral', label: '中性', color: 'bg-slate-100' },
];

// ==================== 主组件 ====================
export default function ProductPageGenerator() {
  // 配置状态
  const [platform, setPlatform] = useState('amazon');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['us']);
  const [category, setCategory] = useState('3c');
  
  // 输入状态
  const [sellingPoints, setSellingPoints] = useState('');
  const [productName, setProductName] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [extraRequirements, setExtraRequirements] = useState('');
  
  // 模块选择（默认5个必选）
  const [selectedModules, setSelectedModules] = useState<string[]>(['main', 'detail', 'feature']);
  
  // 生成配置
  const [quality, setQuality] = useState('1536');
  const [tone, setTone] = useState('natural');
  const [language, setLanguage] = useState('en');
  
  // 生成状态
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState('');
  
  // UI状态
  const [showConfig, setShowConfig] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('config');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理地区选择
  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // 处理模块选择
  const toggleModule = (moduleId: string) => {
    const module = IMAGE_MODULES.find(m => m.id === moduleId);
    if (!module) return;
    
    // 如果是必选模块，不能取消
    if (module.type === 'required' && selectedModules.includes(moduleId)) {
      return;
    }
    
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  // 根据类目推荐模块
  const getRecommendedModules = () => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.recommendedModules || [];
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

  // 生成商品详情套图
  const handleGenerate = async () => {
    if (!sellingPoints.trim()) {
      alert('请输入商品卖点');
      return;
    }
    if (selectedRegions.length === 0) {
      alert('请选择至少一个目标地区');
      return;
    }
    if (selectedModules.length === 0) {
      alert('请至少选择一个图片模块');
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
          productName,
          sellingPoints,
          referenceImage,
          modules: selectedModules,
          quality,
          tone,
          language,
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
            modules: selectedModules,
            quality,
          },
          output_data: { 
            images_count: data.images?.length || 0,
            has_compliance: !!data.compliance,
          },
          status: 'success',
        }),
      }).catch(console.error);
      
      setGeneratingProgress('正在生成商品详情套图...');
      setGeneratedImages(data.images || []);
      setComplianceReport(data.compliance || null);
      setActiveTab('preview');
      
    } catch (error: any) {
      console.error('生成失败:', error);
      alert(error.message || '生成失败，请重试');
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
    setGeneratingProgress(`正在重新生成...`);
    
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
    setProductName('');
    setReferenceImage(null);
    setExtraRequirements('');
    setGeneratedImages([]);
    setComplianceReport(null);
  };

  const currentPlatform = PLATFORMS.find(p => p.value === platform);
  const recommendedModules = getRecommendedModules();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 统一头部 */}
      <UtilityHeader
        toolIcon={<Globe />}
        toolName="出海详情页套图"
        toolDescription="5+3模块体系 · 亚马逊合规 · 多平台适配"
        gradient="from-slate-700 to-slate-900"
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 顶部标签切换 */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl mb-6 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            配置生成
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            disabled={generatedImages.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            } ${generatedImages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Eye className="w-4 h-4" />
            预览套图
            {generatedImages.length > 0 && (
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">
                {generatedImages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            disabled={!complianceReport}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'compliance'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            } ${!complianceReport ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Shield className="w-4 h-4" />
            合规报告
            {complianceReport && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                complianceReport.score >= 90 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : complianceReport.score >= 70
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {complianceReport.score}%
              </span>
            )}
          </button>
        </div>

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧配置区域 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 核心配置 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                <div 
                  className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => setShowConfig(!showConfig)}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">目标平台与地区</h2>
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
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/60 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentPlatform && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-2">{currentPlatform.rules}</p>
                          <div className="flex flex-wrap gap-2">
                            {currentPlatform.compliance.map((c, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            <span className="mr-1">{region.icon}</span>
                            {region.label}
                          </button>
                        ))}
                      </div>
                      {selectedRegions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedRegions.map(r => {
                            const region = REGIONS.find(reg => reg.value === r);
                            return (
                              <div key={r} className="text-xs text-slate-500">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{region?.label}</span>: 
                                {region?.culture}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 类目选择 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        商品类目
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/60 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>
                              <span>{c.icon} {c.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {category && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {CATEGORIES.find(c => c.value === category)?.features.map((f, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700/80 rounded-lg text-slate-600 dark:text-slate-400">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 商品信息 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-slate-500" />
                  <h2 className="font-semibold text-slate-800 dark:text-white">商品信息</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      商品名称（可选）
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="输入商品名称，用于文件命名"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  
                  {/* 卖点输入 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        商品卖点
                      </label>
                      <button
                        onClick={handleExtractPoints}
                        className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        AI优化
                      </button>
                    </div>
                    <textarea
                      value={sellingPoints}
                      onChange={(e) => setSellingPoints(e.target.value)}
                      placeholder="请输入商品核心卖点（功能、材质、优势、场景等），越详细，生成的图片越精准..."
                      className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors resize-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  
                  {/* 参考图上传 */}
                  <div>
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
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">上传商品图</span>
                      </button>
                      {referenceImage && (
                        <div className="relative">
                          <img 
                            src={referenceImage} 
                            alt="参考图" 
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                          />
                          <button
                            onClick={() => setReferenceImage(null)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">支持JPG/PNG格式，AI将自动抠图去背景</p>
                  </div>
                </div>
              </div>

              {/* 模块选择 - 5+3体系 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-slate-500" />
                  <h2 className="font-semibold text-slate-800 dark:text-white">套图模块</h2>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 rounded text-slate-500">5必选 + 3可选</span>
                </div>
                
                {/* 必选模块 */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-3">必选模块（至少选择）</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {IMAGE_MODULES.filter(m => m.type === 'required').map(module => {
                      const Icon = module.icon;
                      const isRecommended = recommendedModules.includes(module.id);
                      const isSelected = selectedModules.includes(module.id);
                      
                      return (
                        <button
                          key={module.id}
                          onClick={() => toggleModule(module.id)}
                          disabled={module.type === 'required'}
                          className={`p-4 rounded-xl text-left transition-all border-2 ${
                            isSelected
                              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-800 dark:border-slate-200'
                              : 'bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-white dark:text-slate-800' : 'text-slate-500'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{module.label}</span>
                                {isRecommended && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
                                    推荐
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs mt-1 ${isSelected ? 'text-white/70 dark:text-slate-600' : 'text-slate-400'}`}>
                                {module.desc}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white dark:text-slate-800" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* 可选模块 */}
                <div>
                  <p className="text-xs text-slate-500 mb-3">可选模块</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {IMAGE_MODULES.filter(m => m.type === 'optional').map(module => {
                      const Icon = module.icon;
                      const isSelected = selectedModules.includes(module.id);
                      
                      return (
                        <button
                          key={module.id}
                          onClick={() => toggleModule(module.id)}
                          className={`p-4 rounded-xl text-left transition-all border-2 ${
                            isSelected
                              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-800 dark:border-slate-200'
                              : 'bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-white dark:text-slate-800' : 'text-slate-500'}`} />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{module.label}</span>
                              <p className={`text-xs mt-1 ${isSelected ? 'text-white/70 dark:text-slate-600' : 'text-slate-400'}`}>
                                {module.desc}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 生成配置 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
                <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-slate-500" />
                  生成配置
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* 画质 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      图片画质
                    </label>
                    <div className="space-y-2">
                      {QUALITY_OPTIONS.map(q => (
                        <button
                          key={q.value}
                          onClick={() => setQuality(q.value)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            quality === q.value
                              ? 'bg-slate-100 dark:bg-slate-700/80 ring-2 ring-slate-800 dark:ring-slate-200'
                              : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{q.label}</div>
                          <div className="text-xs text-slate-400">{q.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 色调 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      色调风格
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TONE_OPTIONS.map(t => (
                        <button
                          key={t.value}
                          onClick={() => setTone(t.value)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            tone === t.value
                              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 ring-2 ring-slate-800 dark:ring-slate-200'
                              : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className={`w-8 h-8 mx-auto mb-1 rounded-lg ${t.color}`} />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 语言 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      文案语言
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          language === 'en'
                            ? 'bg-slate-100 dark:bg-slate-700/80 ring-2 ring-slate-800 dark:ring-slate-200'
                            : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">🇺🇸 英文</div>
                        <div className="text-xs text-slate-400">适配亚马逊等跨境平台</div>
                      </button>
                      <button
                        onClick={() => setLanguage('cn')}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          language === 'cn'
                            ? 'bg-slate-100 dark:bg-slate-700/80 ring-2 ring-slate-800 dark:ring-slate-200'
                            : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">🇨🇳 中文</div>
                        <div className="text-xs text-slate-400">适配天猫/京东等国内平台</div>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 额外要求 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    额外要求（可选）
                  </label>
                  <textarea
                    value={extraRequirements}
                    onChange={(e) => setExtraRequirements(e.target.value)}
                    placeholder="输入特殊需求，如：合规标识放置位置、场景偏好、文案风格等..."
                    className="w-full h-20 px-4 py-3 bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors resize-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !sellingPoints.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-xl font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {generatingProgress || '生成中...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      生成套图
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 右侧说明区域 */}
            <div className="space-y-6">
              {/* 规范说明 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-500" />
                  {currentPlatform?.label}规范
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">主图规格</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{currentPlatform?.mainImage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">副图规格</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{currentPlatform?.detailImage}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <p className="text-xs text-slate-500 mb-2">合规要点</p>
                    <ul className="space-y-1">
                      {currentPlatform?.compliance.map((c, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 模块说明 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-500" />
                  套图模块说明
                </h3>
                <div className="space-y-3">
                  {IMAGE_MODULES.slice(0, 5).map(module => {
                    const Icon = module.icon;
                    const isSelected = selectedModules.includes(module.id);
                    return (
                      <div key={module.id} className="flex items-start gap-3">
                        <div className={`p-1.5 rounded ${isSelected ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-100 dark:bg-slate-700'}`}>
                          <Icon className={`w-3 h-3 ${isSelected ? 'text-white dark:text-slate-800' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{module.label}</p>
                          <p className="text-xs text-slate-400">{module.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    已选择 {selectedModules.length} 个模块
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* 生成结果概览 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">生成结果</h2>
                  <p className="text-sm text-slate-500">共 {generatedImages.length} 张图片，已适配 {platform} 平台</p>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-xl text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  重新生成
                </button>
              </div>
              
              {/* 图片网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {generatedImages.map(image => (
                  <div 
                    key={image.id}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="relative aspect-square">
                      <img 
                        src={image.url} 
                        alt={image.type}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-white/90 dark:bg-slate-800/90 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
                          {IMAGE_MODULES.find(m => m.id === image.type)?.label || image.type}
                        </span>
                      </div>
                      {image.complianceScore < 80 && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-amber-500/90 text-white rounded-lg text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            待优化
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyPrompt(image.prompt, image.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                            title="复制提示词"
                          >
                            {copiedId === image.id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownload(image)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                            title="下载图片"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRegenerateSingle(image.type)}
                          disabled={generating}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                          title="重新生成"
                        >
                          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {generatedImages.length === 0 && (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500">暂无生成的图片</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && complianceReport && (
          <div className="space-y-6">
            {/* 合规概览 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-100 dark:text-slate-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${complianceReport.score * 2.51} 251`}
                      className={complianceReport.score >= 90 
                        ? 'text-emerald-500' 
                        : complianceReport.score >= 70 
                        ? 'text-amber-500' 
                        : 'text-red-500'
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                      {complianceReport.score}%
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">合规评分</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {complianceReport.score >= 90 
                      ? '合规性优秀，可直接上传平台'
                      : complianceReport.score >= 70 
                      ? '存在轻微问题，建议优化后上传'
                      : '存在严重违规，需要修复后上传'
                    }
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {complianceReport.regionAdaptation.length} 项合规
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {complianceReport.violations.length} 项待优化
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 违规项 */}
            {complianceReport.violations.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  待优化项
                </h3>
                <div className="space-y-3">
                  {complianceReport.violations.map((v, i) => (
                    <div key={i} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300">{v.type}</p>
                          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">{v.description}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {v.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 合规项 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                已合规项
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {complianceReport.regionAdaptation.map((item, i) => (
                  <div key={i} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
