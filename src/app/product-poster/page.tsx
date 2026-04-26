'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Sparkles, Download, Loader2, ChevronDown, ChevronUp, Image, ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PosterType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const POSTER_TYPES: PosterType[] = [
  { id: 'conversion', name: '转化型', icon: '🛒', description: '电商主图，高转化率' },
  { id: 'grass', name: '种草型', icon: '🌿', description: '小红书风格，真实感' },
  { id: 'brand', name: '品牌型', icon: '✨', description: '高级感，品牌调性' },
];

export default function ProductPosterPage() {
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [style, setStyle] = useState('auto');
  const [posters, setPosters] = useState<{ type: string; url: string }[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  // 从 URL 参数读取模板数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    const templateName = params.get('template_name');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        console.log('收到商品海报模板数据:', data, '模板名称:', templateName);
        
        // 如果模板有商品名称，预填表单
        if (data.productName || data.product_name || data.name) {
          setProductName(data.productName || data.product_name || data.name);
        }
        
        // 如果模板有风格设置，应用风格
        if (data.style) {
          setStyle(data.style);
        }
        
        if (templateName) {
          toast.success('已加载模板 "' + templateName + '"，请确认信息后点击生成');
        }
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  // 生成海报
  const generatePosters = async () => {
    if (!productName.trim()) {
      toast.error('请输入商品名称');
      return;
    }

    setLoading(true);
    setPosters([]);

    try {
      // 同时生成3张不同风格的海报
      const posterPromises = POSTER_TYPES.map(async (type) => {
        const prompt = type.id === 'conversion'
          ? `电商主图海报，商品「${productName}」，专业摄影棚风格，高清质感，商业广告级，干净背景，产品突出，价格标签醒目，高转化率设计`
          : type.id === 'grass'
          ? `小红书种草风格海报，商品「${productName}」，自然生活场景，温馨氛围，高清摄影风格，真实感强，吸引年轻女性用户，适合社交媒体分享`
          : `高级品牌海报，商品「${productName}」，极简主义风格，高级感设计，黑白或莫兰迪色调，商业大片质感，适合品牌宣传`;

        const response = await fetch('/api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (response.ok) {
          const data = await response.json();
          // 兼容新旧API格式
          const imageUrl = data.imageUrls?.[0] || data.image_url;
          return { type: type.id, url: imageUrl };
        }
        return null;
      });

      setGeneratingImage(true);
      const results = await Promise.all(posterPromises);
      setPosters(results.filter(Boolean) as { type: string; url: string }[]);

      if (results.filter(Boolean).length > 0) {
        toast.success('生成成功！');
      } else {
        toast.error('生成失败，请重试');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('生成失败，请重试');
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  // 下载海报
  const downloadPoster = async (url: string, type: string) => {
    setDownloading(type);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${productName}-${type}.jpg`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('下载成功！');
    } catch (error) {
      toast.error('下载失败');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<ShoppingBag className="w-4 h-4" />}
        toolName="商品海报生成器"
        toolDescription="AI驱动的电商海报设计"
        gradient="from-emerald-500 to-teal-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        {/* 标题区 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            商品海报生成器
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            输入商品名称，生成卖货海报
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            3张海报 · 3种策略 · 直接可用
          </p>
        </div>

        {/* 输入区 */}
        <Card className="mb-8 border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 主输入 */}
              <div className="relative">
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="输入商品名称，如：新款运动鞋、护肤套装..."
                  className="h-14 text-base px-4 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      generatePosters();
                    }
                  }}
                />
              </div>

              {/* 高级选项 */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-500 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  高级选项
                </button>
                
                {showAdvanced && (
                  <div className="mt-3">
                    <label className="text-xs text-slate-500 mb-1 block">风格</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    >
                      <option value="auto">自动匹配</option>
                      <option value="modern">现代简约</option>
                      <option value="luxury">轻奢高级</option>
                      <option value="youth">年轻活力</option>
                      <option value="warm">温馨生活</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={generatePosters}
                disabled={loading || !productName.trim()}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    正在生成海报...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    生成3张海报
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 海报展示 */}
        {(posters.length > 0 || generatingImage) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                生成的商品海报
              </h2>
              {generatingImage && (
                <span className="text-sm text-emerald-600 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> 生成中...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POSTER_TYPES.map((type, index) => {
                const poster = posters.find(p => p.type === type.id);
                
                return (
                  <Card key={type.id} className="border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
                    <div className="relative">
                      {poster ? (
                        <div className="relative group">
                          <img
                            src={poster.url}
                            alt={type.name}
                            className="w-full aspect-square object-cover"
                          />
                          {/* 水印 */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
                            <span className="text-white/0 group-hover:text-white/80 text-xs bg-black/50 px-2 py-1 rounded transition-all">
                              水印版 · 付费下载高清
                            </span>
                          </div>
                        </div>
                      ) : generatingImage ? (
                        <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Image className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{type.icon}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{type.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{type.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => poster && downloadPoster(poster.url, type.id)}
                        disabled={!poster || downloading === type.id}
                      >
                        {downloading === type.id ? (
                          <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 下载中</>
                        ) : (
                          <><Download className="w-4 h-4 mr-1" /> 下载</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 商业提示 */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">提示</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      当前为免费预览版，图片带有水印。
                      <strong>付费9.9元</strong>可下载高清无水印原图，
                      <strong>套餐29元</strong>可获得50张高清海报。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 使用说明 */}
        {posters.length === 0 && !generatingImage && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">海报类型说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {POSTER_TYPES.map((type) => (
                  <div key={type.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{type.name}</span>
                    </div>
                    <p className="text-sm text-slate-500">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部 */}
        <div className="mt-12">
          <WechatPromo />
        </div>
      </div>
    </div>
  );
}
