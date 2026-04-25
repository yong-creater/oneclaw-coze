'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  MapPin, Upload, Download, Loader2, 
  Image as ImageIcon, Camera, Palette,
  Copy, Check, RefreshCw, Wand2, Star,
  Plus, Trash2, Type, ImagePlus, QrCode,
  MapPinned, Phone, Mail, Clock, Percent,
  Gift, PartyPopper, Coffee, ShoppingBag,
  Sparkles, Crown, DownloadCloud
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
interface IndustryTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  themes: string[];
}

interface FestivalTemplate {
  id: string;
  name: string;
  date: string;
  icon: React.ReactNode;
}

interface PosterStyle {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

interface GeneratedPoster {
  id: string;
  url: string;
  style: string;
  theme: string;
  timestamp: number;
}

// ==================== 常量 ====================
const INDUSTRIES: IndustryTemplate[] = [
  { 
    id: 'food', 
    name: '餐饮美食', 
    icon: <Coffee className="w-5 h-5" />,
    themes: ['开业大吉', '新品上市', '打折促销', '会员专享', '满减活动']
  },
  { 
    id: 'retail', 
    name: '零售便利', 
    icon: <ShoppingBag className="w-5 h-5" />,
    themes: ['限时特惠', '买一送一', '积分兑换', '周年庆', '清仓大促']
  },
  { 
    id: 'beauty', 
    name: '美容美发', 
    icon: <Sparkles className="w-5 h-5" />,
    themes: ['新店开业', '项目体验', '会员日', '节日优惠', '团购套餐']
  },
  { 
    id: 'fitness', 
    name: '健身运动', 
    icon: <MapPin className="w-5 h-5" />,
    themes: ['健身打卡', '私教课程', '会员招募', '团课优惠', '体测福利']
  },
  { 
    id: 'education', 
    name: '教育培训', 
    icon: <Star className="w-5 h-5" />,
    themes: ['课程报名', '试听体验', '学费优惠', '毕业典礼', '亲子活动']
  },
  { 
    id: 'medical', 
    name: '医疗健康', 
    icon: <Plus className="w-5 h-5" />,
    themes: ['义诊活动', '体检套餐', '专家坐诊', '健康讲座', '会员福利']
  },
];

const FESTIVALS: FestivalTemplate[] = [
  { id: 'spring', name: '春节', date: '正月初一', icon: <PartyPopper className="w-5 h-5" /> },
  { id: 'lantern', name: '元宵节', date: '正月十五', icon: <PartyPopper className="w-5 h-5" /> },
  { id: 'qixi', name: '七夕节', date: '七月初七', icon: <Gift className="w-5 h-5" /> },
  { id: 'mid_autumn', name: '中秋节', date: '八月十五', icon: <PartyPopper className="w-5 h-5" /> },
  { id: 'national', name: '国庆节', date: '十月一日', icon: <PartyPopper className="w-5 h-5" /> },
  { id: 'double11', name: '双十一', date: '11月11日', icon: <Percent className="w-5 h-5" /> },
];

const POSTER_STYLES: PosterStyle[] = [
  { id: 'modern', name: '现代简约', description: '简洁大气，高级感强', colors: ['#1a1a2e', '#e94560', '#0f3460'] },
  { id: 'warm', name: '温暖亲切', description: '暖色调，亲和力强', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
  { id: 'fresh', name: '清新自然', description: '绿色系，健康活力', colors: ['#00b894', '#55efc4', '#81ecec'] },
  { id: 'luxury', name: '轻奢高级', description: '金色系，品质感', colors: ['#2d3436', '#d63031', '#fdcb6e'] },
  { id: 'playful', name: '活泼可爱', description: '彩色系，趣味性强', colors: ['#6c5ce7', '#fd79a8', '#00cec9'] },
  { id: 'traditional', name: '传统中国', description: '红色系，喜庆热闹', colors: ['#c0392b', '#f39c12', '#2c3e50'] },
];

const POSTER_SIZES = [
  { value: 'instagram', label: 'Instagram', ratio: '1:1', size: '1080×1080' },
  { value: 'story', label: '朋友圈封面', ratio: '9:16', size: '1080×1920' },
  { value: 'a4', label: 'A4宣传单', ratio: '3:4', size: '2480×3508' },
  { value: 'wide', label: '横版海报', ratio: '16:9', size: '1920×1080' },
];

// ==================== 主组件 ====================
export default function LocalPosterGenerator() {
  const [activeTab, setActiveTab] = useState<'theme' | 'festival' | 'custom'>('theme');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [selectedSize, setSelectedSize] = useState<string>('instagram');
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [discount, setDiscount] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);
  
  // 处理logo上传
  const handleLogoUpload = useCallback((imageData: string) => {
    setUploadedLogo(imageData);
  }, []);

  // 切换行业时清空主题
  const handleIndustryChange = (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedTheme('');
  };

  // 生成海报
  const handleGenerate = async () => {
    if (!selectedTheme && !selectedFestival) {
      alert('请选择营销主题');
      return;
    }
    if (!storeName) {
      alert('请输入店铺名称');
      return;
    }

    setGenerating(true);
    
    try {
      const style = POSTER_STYLES.find(s => s.id === selectedStyle);
      const theme = selectedTheme || selectedFestival;
      
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 生成示例海报
      const newPoster: GeneratedPoster = {
        id: Date.now().toString(),
        url: `https://picsum.photos/seed/${Date.now()}/600/800`,
        style: style?.name || '默认',
        theme: theme,
        timestamp: Date.now(),
      };
      
      setGeneratedPosters(prev => [newPoster, ...prev]);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 下载海报
  const handleDownload = async (poster: GeneratedPoster) => {
    try {
      const response = await fetch(poster.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storeName || '海报'}_${poster.theme}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    for (const poster of generatedPosters) {
      await handleDownload(poster);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // 获取当前主题列表
  const getCurrentThemes = () => {
    if (activeTab === 'festival') {
      return FESTIVALS.map(f => f.name);
    }
    if (selectedIndustry) {
      const industry = INDUSTRIES.find(i => i.id === selectedIndustry);
      return industry?.themes || [];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<MapPin className="w-4 h-4" />}
        toolName="门店营销海报"
        toolDescription="一键生成门店营销海报，支持多种行业和节日主题"
        gradient="from-red-500 to-pink-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：参数设置 */}
          <div className="space-y-6">
            {/* 营销类型选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700 inline-flex">
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'theme'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                主题营销
              </button>
              <button
                onClick={() => setActiveTab('festival')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'festival'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <PartyPopper className="w-4 h-4" />
                节日营销
              </button>
            </div>

            {/* 行业选择 */}
            {activeTab === 'theme' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Store className="w-4 h-4 text-red-500" />
                  选择行业
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => handleIndustryChange(industry.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        selectedIndustry === industry.id
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                        {industry.icon}
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{industry.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 主题选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-red-500" />
                {activeTab === 'theme' ? '选择营销主题' : '选择节日'}
              </h3>
              {activeTab === 'theme' && !selectedIndustry ? (
                <p className="text-slate-500 text-sm">请先选择行业</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getCurrentThemes().map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedTheme === theme || selectedFestival === theme
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-red-300 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 店铺信息 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-red-500" />
                店铺信息
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">店铺名称 *</label>
                  <Input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="请输入店铺名称"
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">店铺标语</label>
                  <Input
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    placeholder="如：好吃不贵，回头客多"
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">优惠信息</label>
                  <Input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="如：全场8折 / 满100减20"
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">联系电话</label>
                    <Input
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      placeholder="电话"
                      className="border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">店铺地址</label>
                    <Input
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="地址"
                      className="border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 风格选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                选择风格
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {POSTER_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      {style.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{style.name}</p>
                    <p className="text-xs text-slate-500">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-500" />
                选择尺寸
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {POSTER_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedSize === size.value
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                    }`}
                  >
                    <p className="font-medium text-slate-700 dark:text-slate-200">{size.label}</p>
                    <p className="text-xs text-slate-500">{size.size}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-red-500/25 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在生成海报...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  一键生成营销海报
                </>
              )}
            </Button>
          </div>

          {/* 右侧：生成结果 */}
          <div className="space-y-6">
            {/* 生成预览 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-500" />
                  海报预览
                </h3>
                {generatedPosters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {generatedPosters.length} 张
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBatchDownload}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <DownloadCloud className="w-4 h-4 mr-1" />
                      批量下载
                    </Button>
                  </div>
                )}
              </div>
              
              {generatedPosters.length === 0 ? (
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center text-slate-400">
                  <MapPin className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">海报预览区</p>
                  <p className="text-sm mt-1">设置参数后点击生成</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedPosters.map((poster) => (
                    <div key={poster.id} className="relative group">
                      <img
                        src={poster.url}
                        alt={poster.theme}
                        className="w-full rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(poster)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Download className="w-4 h-4 text-slate-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                          <RefreshCw className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 模板推荐 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                热门模板
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-lg bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center text-white text-xs cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                  >
                    模板{i}
                  </div>
                ))}
              </div>
            </div>

            {/* 功能特点 */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                功能特点
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• 支持20+行业模板，50+营销场景</li>
                <li>• 节日主题实时更新</li>
                <li>• 多尺寸适配，一键导出</li>
                <li>• 自定义店铺信息，即时生效</li>
              </ul>
            </div>

            {/* 登录提示 */}
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}

// 缺少的图标
const Store = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
