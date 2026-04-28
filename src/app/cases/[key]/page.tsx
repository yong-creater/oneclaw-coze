'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Settings, Image as ImageIcon, Zap, Layers, Globe } from 'lucide-react';
import { ProductCase, PRODUCT_CASES } from '@/data/caseStudies';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';

// ============================================================
// 配置常量
// ============================================================

const PLATFORM_OPTIONS = [
  { id: 'amazon', name: '亚马逊', icon: '📦' },
  { id: 'taobao', name: '淘宝', icon: '🛒' },
  { id: 'jd', name: '京东', icon: '📱' },
  { id: 'pdd', name: '拼多多', icon: '💰' },
  { id: 'shein', name: 'SHEIN', icon: '👗' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

const IMAGE_TYPE_OPTIONS = [
  { id: 'main', name: '主图+辅图', desc: '标准电商套图' },
  { id: 'scene', name: '场景图', desc: '带环境氛围' },
  { id: 'detail', name: '详情图', desc: '细节特写展示' },
];

const MODE_OPTIONS = [
  { id: 'standard', name: '标准模式', tag: '性价比', icon: '💡' },
  { id: 'premium', name: '高级模式', tag: '效果好', icon: '✨' },
  { id: 'vip', name: '会员模式', tag: '会员', icon: '👑' },
];

const QUALITY_OPTIONS = [
  { id: '1k', name: '1K', desc: '标清' },
  { id: '2k', name: '2K', desc: '高清' },
  { id: '4k', name: '4K', desc: '超清' },
];

const RATIO_OPTIONS = [
  { id: '1:1', name: '1:1' },
  { id: '3:4', name: '3:4' },
  { id: '4:3', name: '4:3' },
];

// ============================================================
// 页面组件
// ============================================================

export default function CaseDetailPage() {
  const params = useParams();
  const key = params.key as string;
  
  // 查找匹配的案例
  const productCase = PRODUCT_CASES.find(c => c.id === key);
  
  if (!productCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">案例不存在</h1>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return <ProductCaseStudy caseData={productCase} />;
}

// ============================================================
// 案例详情页组件
// ============================================================

interface ProductCaseStudyProps {
  caseData: ProductCase;
}

function ProductCaseStudy({ caseData }: ProductCaseStudyProps) {
  const [activeRegion, setActiveRegion] = useState<string>('eu');
  const [showOriginal, setShowOriginal] = useState(false);
  const [config, setConfig] = useState({
    platform: 'amazon',
    imageType: 'main',
    smartCopy: '',
    extraDesc: '',
    mode: 'standard',
    quality: '1k',
    ratio: '1:1',
    count: 4,
  });

  const regionColors: Record<string, string> = {
    eu: 'from-blue-500 to-indigo-500',
    us: 'from-green-500 to-emerald-500',
    jp: 'from-rose-500 to-pink-500',
    sea: 'from-yellow-500 to-orange-500'
  };

  const currentRegion = caseData.regions.find(r => r.id === activeRegion);

  const updateConfig = <K extends keyof typeof config>(key: K, value: typeof config[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 获取平台信息
  const getPlatformInfo = (platformId: string) => {
    const platforms: Record<string, { name: string; specs: string }> = {
      amazon: { name: '亚马逊', specs: '主图: 1000×1000px | 辅图: 1000×1000px | 场景图: 1464×987px' },
      taobao: { name: '淘宝', specs: '主图: 800×800px | 详情图: 750×高度不限' },
      jd: { name: '京东', specs: '主图: 800×800px | 详情图: 790×高度不限' },
      pdd: { name: '拼多多', specs: '主图: 800×800px | 详情图: 750×高度不限' },
      shein: { name: 'SHEIN', specs: '主图: 1000×1333px | 辅图: 1000×1333px' },
      tiktok: { name: 'TikTok', specs: '主图: 1080×1080px | 视频封面: 1080×1920px' },
    };
    return platforms[platformId] || { name: platformId, specs: '' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* ==================== 顶部标题 ==================== */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">电商AI商品套图</h2>
              <p className="text-sm text-white/80">一键生成全套电商视觉素材</p>
            </div>
          </div>
          <BackToHome />
        </div>
      </div>

      {/* ==================== 左右分栏主内容 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================== 左侧：预览区 (5份) ==================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* 商品套图卡片 */}
          <Card className="bg-white dark:bg-slate-800 overflow-hidden">
            <CardContent className="p-0">
              {/* 标题栏 */}
              <div className="py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">
                  商品套图
                </h3>
              </div>

              {/* 商品图预览 */}
              <div className="p-4">
                <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden">
                  {showOriginal ? (
                    <Image 
                      src={caseData.originalImage} 
                      alt="原始详情图"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : currentRegion && (
                    <Image 
                      src={currentRegion.image} 
                      alt={`${currentRegion.name}详情图`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {/* 标签 */}
                  <div className="absolute top-3 left-3">
                    {showOriginal ? (
                      <Badge className="bg-red-500 text-white">原始版本</Badge>
                    ) : currentRegion && (
                      <Badge className={`bg-gradient-to-r ${regionColors[currentRegion.id]} text-white`}>
                        {currentRegion.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* 图标区 */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-center gap-6">
                  {[
                    { icon: '🎯', text: '精准打光' },
                    { icon: '✨', text: '高清质感' },
                    { icon: '📐', text: '规范尺寸' },
                    { icon: '⚡', text: '快速出图' },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 地区/版本切换 */}
              <div className="px-4 pb-3">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setShowOriginal(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      showOriginal
                        ? 'bg-slate-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    原始图
                  </button>
                  {caseData.regions.map(region => (
                    <button
                      key={region.id}
                      onClick={() => { setActiveRegion(region.id); setShowOriginal(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        !showOriginal && activeRegion === region.id
                          ? `bg-gradient-to-r ${regionColors[region.id]} text-white`
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 套图标签 */}
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentRegion?.marks.map((mark, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {mark}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 适用场景卡片 */}
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                适用场景
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['主图', '辅图', '首屏海报', '详情页', '静物场景图', '材质细节图'].map((scene, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Check className="w-3 h-3 text-green-500" />
                    {scene}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==================== 右侧：配置区 (7份) ==================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* 生成配置卡片 */}
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-5 space-y-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                生成配置
              </h3>

              {/* 目标平台 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  目标平台
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => updateConfig('platform', platform.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.platform === platform.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <span className="mr-1">{platform.icon}</span>
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 生图类型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  生图类型
                </label>
                <div className="flex gap-2">
                  {IMAGE_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => updateConfig('imageType', type.id)}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        config.imageType === type.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-medium">{type.name}</div>
                      <div className={`text-xs ${config.imageType === type.id ? 'text-orange-100' : 'text-slate-400'}`}>
                        {type.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 智能文案 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  智能文案
                </label>
                <textarea
                  value={config.smartCopy}
                  onChange={(e) => updateConfig('smartCopy', e.target.value)}
                  placeholder="输入商品卖点，如：头层牛皮、复古风格、柔软舒适..."
                  className="w-full h-20 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm resize-none hover:border-orange-400 dark:hover:border-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* 额外描述 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  额外描述 <span className="text-xs text-slate-400">(非必填)</span>
                </label>
                <Input
                  value={config.extraDesc}
                  onChange={(e) => updateConfig('extraDesc', e.target.value)}
                  placeholder="补充说明，如：需要展示五金配件"
                  className="h-11 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500"
                />
              </div>

              {/* 生成模式 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  生成模式
                </label>
                <div className="space-y-2">
                  {MODE_OPTIONS.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => updateConfig('mode', mode.id)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center justify-between ${
                        config.mode === mode.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{mode.icon}</span>
                        <div className="font-medium">{mode.name}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          config.mode === mode.id
                            ? 'bg-white/20 text-white border-white/40'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                        }
                      >
                        {mode.tag}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* 清晰度 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  清晰度
                </label>
                <div className="flex gap-2">
                  {QUALITY_OPTIONS.map((quality) => (
                    <button
                      key={quality.id}
                      onClick={() => updateConfig('quality', quality.id)}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        config.quality === quality.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-medium">{quality.name}</div>
                      <div className={`text-xs ${config.quality === quality.id ? 'text-orange-100' : 'text-slate-400'}`}>
                        {quality.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 比例 & 张数 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    图像比例
                  </label>
                  <div className="flex gap-1">
                    {RATIO_OPTIONS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => updateConfig('ratio', ratio.id)}
                        className={`flex-1 px-2 py-2 rounded-lg text-sm transition-all ${
                          config.ratio === ratio.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {ratio.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    生成张数
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={config.count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        if (val >= 1 && val <= 10) {
                          updateConfig('count', val);
                        }
                      }}
                      className="h-10 text-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500"
                    />
                    <span className="text-sm text-slate-500">张</span>
                  </div>
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setConfig({
                    platform: 'amazon',
                    imageType: 'main',
                    smartCopy: '',
                    extraDesc: '',
                    mode: 'standard',
                    quality: '1k',
                    ratio: '1:1',
                    count: 4,
                  })}
                  className="flex-1 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500"
                >
                  重置
                </Button>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                  确认配置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== 底部平台适配信息 ==================== */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-700 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-white">{getPlatformInfo(config.platform).name}平台适配</h4>
                <p className="text-xs text-slate-400">{getPlatformInfo(config.platform).specs}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Check className="w-3 h-3 mr-1" />
                合规通过率 98%+
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {config.quality} · {config.ratio} · {config.count}张
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==================== 底部slogan ==================== */}
      <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
        告别繁琐拍摄，一键生成全套电商视觉，适配多种电商平台
      </div>

      {/* 效果数据卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-2xl font-bold mb-1">{caseData.result.conversion}</p>
            <p className="text-xs opacity-80">转化率提升</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500 to-purple-500 border-violet-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-2xl font-bold mb-1">{caseData.result.regions.split('/').length}个</p>
            <p className="text-xs opacity-80">覆盖地区</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 border-orange-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-2xl font-bold mb-1">3分钟</p>
            <p className="text-xs opacity-80">生成一套素材</p>
          </CardContent>
        </Card>
      </div>

      {/* 公众号推广 */}
      <WechatPromo />
    </div>
  );
}
