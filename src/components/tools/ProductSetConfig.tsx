'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ShoppingBag, Palette, Layers, Zap, Settings, Image, Check } from 'lucide-react';

// ============================================================
// 配置常量 - 可后台管理
// ============================================================

/** 目标平台选项 */
const PLATFORM_OPTIONS = [
  { id: 'amazon', name: '亚马逊', icon: '📦' },
  { id: 'taobao', name: '淘宝', icon: '🛒' },
  { id: 'jd', name: '京东', icon: '📱' },
  { id: 'pdd', name: '拼多多', icon: '💰' },
  { id: 'shein', name: 'SHEIN', icon: '👗' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

/** 生图类型选项 */
const IMAGE_TYPE_OPTIONS = [
  { id: 'main', name: '主图+辅图', desc: '标准电商套图' },
  { id: 'scene', name: '场景图', desc: '带环境氛围' },
  { id: 'detail', name: '详情图', desc: '细节特写展示' },
];

/** 生成模式选项 */
const MODE_OPTIONS = [
  { 
    id: 'standard', 
    name: '标准模式', 
    tag: '性价比',
    desc: '快速生成，适合日常使用',
    icon: '💡'
  },
  { 
    id: 'premium', 
    name: '高级模式', 
    tag: '效果好',
    desc: '精细优化，品质更佳',
    icon: '✨'
  },
  { 
    id: 'vip', 
    name: '会员模式', 
    tag: '会员',
    desc: 'AI增强，高清输出',
    icon: '👑'
  },
];

/** 清晰度选项 */
const QUALITY_OPTIONS = [
  { id: '1k', name: '1K标清', desc: '适合快速预览' },
  { id: '2k', name: '2K高清', desc: '主流电商标准' },
  { id: '4k', name: '4K超清', desc: '高清展示要求' },
];

/** 图像比例选项 */
const RATIO_OPTIONS = [
  { id: '1:1', name: '1:1', desc: '方形' },
  { id: '3:4', name: '3:4', desc: '竖版' },
  { id: '4:3', name: '4:3', desc: '横版' },
  { id: '16:9', name: '16:9', desc: '宽屏' },
];

// ============================================================
// 示例套图数据
// ============================================================

const SAMPLE_IMAGES = [
  { id: 1, type: '主图', url: 'https://picsum.photos/400/400?random=1' },
  { id: 2, type: '辅图1', url: 'https://picsum.photos/400/400?random=2' },
  { id: 3, type: '辅图2', url: 'https://picsum.photos/400/400?random=3' },
  { id: 4, type: '辅图3', url: 'https://picsum.photos/400/400?random=4' },
];

const SAMPLE_ICONS = [
  { icon: '🎯', text: '精准打光' },
  { icon: '✨', text: '高清质感' },
  { icon: '📐', text: '规范尺寸' },
  { icon: '⚡', text: '快速出图' },
];

const SAMPLE_TAGS = ['甄选头层牛皮', 'RETRO RUNNER', 'SOFT LEATHER', '适配多场景'];

// ============================================================
// 类型定义
// ============================================================

interface ConfigState {
  platform: string;
  imageType: string;
  smartCopy: string;
  extraDesc: string;
  mode: string;
  quality: string;
  ratio: string;
  count: number;
}

// ============================================================
// 主组件
// ============================================================

export default function ProductSetConfig() {
  // 配置状态
  const [config, setConfig] = useState<ConfigState>({
    platform: 'amazon',
    imageType: 'main',
    smartCopy: '',
    extraDesc: '',
    mode: 'standard',
    quality: '1k',
    ratio: '1:1',
    count: 4,
  });

  // 重置配置
  const handleReset = () => {
    setConfig({
      platform: 'amazon',
      imageType: 'main',
      smartCopy: '',
      extraDesc: '',
      mode: 'standard',
      quality: '1k',
      ratio: '1:1',
      count: 4,
    });
  };

  // 更新配置项
  const updateConfig = <K extends keyof ConfigState>(key: K, value: ConfigState[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 获取当前选中模式的信息
  const currentMode = MODE_OPTIONS.find(m => m.id === config.mode);
  const currentPlatform = PLATFORM_OPTIONS.find(p => p.id === config.platform);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 页面标题 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          电商AI商品套图生成
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          告别繁琐拍摄，一键生成全套电商视觉
        </p>
      </div>

      {/* 左右分栏主内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ==================== 左侧：预览区 ==================== */}
        <div className="space-y-4">
          {/* 套图预览卡片 */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
            <CardContent className="p-0">
              {/* 标题 */}
              <div className="py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-base font-bold text-slate-800 dark:text-white text-center">
                  商品套图
                </h2>
              </div>

              {/* 商品图预览 */}
              <div className="p-4">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden">
                  <img
                    src={SAMPLE_IMAGES[0].url}
                    alt="商品主图"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 图标区 */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-center gap-6">
                  {SAMPLE_ICONS.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 推荐示例 - 横向滚动 */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {SAMPLE_IMAGES.map((img) => (
                    <div
                      key={img.id}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-600 hover:border-orange-400 transition-colors cursor-pointer"
                    >
                      <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 套图说明标签 */}
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {SAMPLE_TAGS.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用途说明 */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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

        {/* ==================== 右侧：配置区 ==================== */}
        <div className="space-y-4">
          {/* 生成配置卡片 */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
                  <Image className="w-4 h-4" />
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
                  className="w-full h-24 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm resize-none focus:border-orange-500 transition-colors"
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
                  className="h-11"
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
                        <div>
                          <div className="font-medium">{mode.name}</div>
                          <div className={`text-xs ${config.mode === mode.id ? 'text-orange-100' : 'text-slate-400'}`}>
                            {mode.desc}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          config.mode === mode.id
                            ? 'bg-white/20 text-white border-white/40'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                        }`}
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

              {/* 图像比例 & 生成张数 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 图像比例 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    图像比例
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {RATIO_OPTIONS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => updateConfig('ratio', ratio.id)}
                        className={`px-2 py-2 rounded-lg text-sm transition-all ${
                          config.ratio === ratio.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {ratio.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 生成张数 */}
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
                      className="h-10 text-center"
                    />
                    <span className="text-sm text-slate-500">张</span>
                  </div>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 h-12 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重置
                </Button>
                <Button
                  disabled
                  className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                >
                  确认配置
                </Button>
              </div>

              {/* 提示 */}
              <p className="text-xs text-slate-400 text-center">
                当前为配置预览模式，完整功能请升级会员
              </p>
            </CardContent>
          </Card>

          {/* 平台适配说明 */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-500" />
                {currentPlatform?.name} 平台适配
              </h3>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>主图尺寸：</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">1000×1000px (1:1)</span>
                </div>
                <div className="flex justify-between">
                  <span>辅图尺寸：</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">1000×1000px</span>
                </div>
                <div className="flex justify-between">
                  <span>场景图：</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">2000×1500px (4:3)</span>
                </div>
                <div className="flex justify-between">
                  <span>详情图：</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">750×1000px (3:4)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部说明 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          告别繁琐拍摄，一键生成全套电商视觉，适配多种电商平台
        </p>
      </div>
    </div>
  );
}
