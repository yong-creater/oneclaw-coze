'use client';

import { useState, useCallback } from 'react';
import { 
  Megaphone, Download, Loader2, 
  Image as ImageIcon, PartyPopper,
  Copy, Check, RefreshCw, Wand2, Star,
  Plus, Type, Trash2, Upload, 
  Gift, Calendar, MapPin, Phone,
  Clock, Percent, Store, QrCode,
  Printer, FileText, Sun, Moon,
  Flower, Crown, Sparkles, User, Palette
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
interface Scene {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface Festival {
  id: string;
  name: string;
  date: string;
  daysLeft: number;
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
  scene: string;
  festival: string;
  style: string;
  timestamp: number;
}

// ==================== 常量 ====================
const SCENES: Scene[] = [
  { id: 'opening', name: '开业大吉', icon: <Store className="w-5 h-5" />, description: '新店开业、门店开张' },
  { id: 'promotion', name: '促销引流', icon: <Percent className="w-5 h-5" />, description: '打折、满减、优惠活动' },
  { id: 'new-product', name: '新品上市', icon: <Gift className="w-5 h-5" />, description: '新品推出、爆款推荐' },
  { id: 'member', name: '会员专享', icon: <Crown className="w-5 h-5" />, description: '会员日、积分兑换' },
  { id: 'store-event', name: '门店活动', icon: <Calendar className="w-5 h-5" />, description: '店庆、节日、沙龙活动' },
  { id: 'recruit', name: '招聘启事', icon: <User className="w-5 h-5" />, description: '招聘人才、职位空缺' },
];

const FESTIVALS: Festival[] = [
  { id: 'spring', name: '春节', date: '正月初一', daysLeft: 90, icon: <Sun className="w-4 h-4" /> },
  { id: 'lantern', name: '元宵节', date: '正月十五', daysLeft: 104, icon: <Moon className="w-4 h-4" /> },
  { id: 'qixi', name: '七夕节', date: '七月初七', daysLeft: 168, icon: <Flower className="w-4 h-4" /> },
  { id: 'mid_autumn', name: '中秋节', date: '八月十五', daysLeft: 150, icon: <Moon className="w-4 h-4" /> },
  { id: 'national', name: '国庆节', date: '十月一日', daysLeft: 160, icon: <Crown className="w-4 h-4" /> },
  { id: 'double11', name: '双十一', date: '11月11日', daysLeft: 200, icon: <Percent className="w-4 h-4" /> },
  { id: 'christmas', name: '圣诞节', date: '12月25日', daysLeft: 240, icon: <Gift className="w-4 h-4" /> },
  { id: 'new_year', name: '元旦', date: '1月1日', daysLeft: 250, icon: <Sparkles className="w-4 h-4" /> },
];

const POSTER_STYLES: PosterStyle[] = [
  { id: 'modern', name: '现代简约', description: '简洁大气，高级感强', colors: ['#1a1a2e', '#e94560', '#0f3460'] },
  { id: 'warm', name: '温暖喜庆', description: '暖色调，亲切热闹', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
  { id: 'fresh', name: '清新自然', description: '绿色系，健康活力', colors: ['#00b894', '#55efc4', '#81ecec'] },
  { id: 'luxury', name: '轻奢高级', description: '金色系，品质感强', colors: ['#2d3436', '#d63031', '#fdcb6e'] },
  { id: 'playful', name: '活泼可爱', description: '彩色系，趣味性强', colors: ['#6c5ce7', '#fd79a8', '#00cec9'] },
  { id: 'traditional', name: '传统中国', description: '红色系，喜庆大气', colors: ['#c0392b', '#f39c12', '#2c3e50'] },
];

const POSTER_SIZES = [
  { value: 'instagram', label: '朋友圈/小红书', ratio: '1:1', size: '1080×1080' },
  { value: 'story', label: '抖音/快手封面', ratio: '9:16', size: '1080×1920' },
  { value: 'a4', label: '宣传单页', ratio: '3:4', size: 'A4打印' },
  { value: 'a3', label: '展架海报', ratio: '3:4', size: 'A3印刷' },
  { value: 'banner', label: '横版Banner', ratio: '16:9', size: '1920×1080' },
];

// ==================== 主组件 ====================
export default function FestivalPosterGenerator() {
  const [activeTab, setActiveTab] = useState<'scene' | 'festival'>('scene');
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [selectedSize, setSelectedSize] = useState<string>('instagram');
  
  const [activityTitle, setActivityTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [activityTime, setActivityTime] = useState('');
  
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [uploadedQrCode, setUploadedQrCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);

  // 生成海报
  const handleGenerate = async () => {
    if (!activityTitle && !storeName) {
      alert('请输入活动主题或店铺名称');
      return;
    }

    setGenerating(true);
    
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const newPoster: GeneratedPoster = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/800/1200`,
      scene: selectedScene,
      festival: selectedFestival,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedPosters([newPoster, ...generatedPosters]);
    setGenerating(false);
  };

  // 导出海报
  const handleDownload = useCallback((poster: GeneratedPoster) => {
    const link = document.createElement('a');
    link.href = poster.url;
    link.download = `海报_${poster.style}_${poster.timestamp}.png`;
    link.click();
  }, []);

  const currentScene = SCENES.find(s => s.id === selectedScene);
  const currentFestival = FESTIVALS.find(f => f.id === selectedFestival);
  const currentStyle = POSTER_STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<Megaphone className="w-4 h-4" />}
        toolName="节日营销海报生成器"
        toolDescription="节日/门店营销活动海报一键生成，助力门店快速落地营销推广"
        gradient="from-red-500 to-orange-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 活动场景选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            选择活动场景
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => {
                  setSelectedScene(scene.id);
                  setActiveTab('scene');
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedScene === scene.id && activeTab === 'scene'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                }`}
              >
                <div className={`mb-2 ${selectedScene === scene.id ? 'text-red-500' : 'text-slate-400'}`}>
                  {scene.icon}
                </div>
                <p className={`text-sm font-medium ${
                  selectedScene === scene.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {scene.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">{scene.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 节日专题 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-red-500" />
            节日专题
            <Badge variant="outline" className="ml-2 text-xs border-red-200 text-red-500">
              提前15天更新
            </Badge>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FESTIVALS.map((festival) => (
              <button
                key={festival.id}
                onClick={() => {
                  setSelectedFestival(festival.id);
                  setActiveTab('festival');
                }}
                className={`p-4 rounded-xl border-2 transition-all relative ${
                  selectedFestival === festival.id && activeTab === 'festival'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                }`}
              >
                <div className={`mb-2 ${selectedFestival === festival.id ? 'text-red-500' : 'text-slate-400'}`}>
                  {festival.icon}
                </div>
                <p className={`text-sm font-medium ${
                  selectedFestival === festival.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {festival.name}
                </p>
                <p className="text-xs text-slate-500">{festival.date}</p>
                {festival.daysLeft <= 30 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5">
                    🔥 {festival.daysLeft}天
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 活动信息 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Type className="w-4 h-4 text-red-500" />
            填写活动信息
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  活动主题 *
                </label>
                <Input
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="如：全场8折、会员专享、新品上市"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  优惠信息
                </label>
                <Input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="如：满100减20、5折起"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  店铺名称
                </label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="请输入店铺名称"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  联系电话
                </label>
                <Input
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="请输入联系电话"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  店铺地址
                </label>
                <Input
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="请输入店铺地址"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  活动时间
                </label>
                <Input
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  placeholder="如：2024.1.1-1.7"
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Logo和二维码 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  店铺Logo
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-red-400 transition-colors cursor-pointer">
                  {uploadedLogo ? (
                    <div className="relative">
                      <img src={uploadedLogo} alt="Logo" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                      <button
                        onClick={() => setUploadedLogo(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">点击上传Logo</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  团购/外链二维码
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-red-400 transition-colors cursor-pointer">
                  {uploadedQrCode ? (
                    <div className="relative">
                      <img src={uploadedQrCode} alt="二维码" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                      <button
                        onClick={() => setUploadedQrCode(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <QrCode className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">点击上传二维码</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 风格与尺寸 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 风格选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-red-500" />
              选择海报风格
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {POSTER_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {style.colors.map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className={`text-sm font-medium ${
                    selectedStyle === style.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {style.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 尺寸选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Printer className="w-4 h-4 text-red-500" />
              选择导出尺寸
            </h3>
            <div className="space-y-3">
              {POSTER_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedSize === size.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-16 rounded-lg flex items-center justify-center ${
                      selectedSize === size.value ? 'bg-red-100' : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        selectedSize === size.value ? 'text-red-500' : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${
                        selectedSize === size.value ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {size.label}
                      </p>
                      <p className="text-xs text-slate-500">{size.ratio} · {size.size}</p>
                    </div>
                  </div>
                  {selectedSize === size.value && (
                    <Check className="w-5 h-5 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || (!activityTitle && !storeName)}
          className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl text-base font-medium shadow-lg shadow-red-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在生成营销海报...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成海报
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedPosters.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-500" />
              生成的海报
              <Badge variant="secondary" className="ml-2">{generatedPosters.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedPosters.map((poster) => (
                <div key={poster.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group">
                  <img
                    src={poster.url}
                    alt="生成的海报"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="bg-white/90" onClick={() => handleDownload(poster)}>
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90" onClick={handleGenerate}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        重新生成
                      </Button>
                    </div>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    {POSTER_STYLES.find(s => s.id === poster.style)?.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 提示 */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            使用提示
          </h4>
          <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
            <li>• 节日海报模板提前15天更新，建议提前规划营销活动</li>
            <li>• 添加店铺Logo和二维码可提升转化效果</li>
            <li>• 支持多种尺寸导出，适配线上发布和线下印刷</li>
            <li>• 批量生成多版本海报，可用于不同渠道推广</li>
          </ul>
        </div>

        {/* 登录提示 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录后解锁批量生成</p>
              <p className="text-xs text-slate-500">高清无水印下载、商用授权、批量导出</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
