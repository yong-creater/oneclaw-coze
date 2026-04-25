'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Star, Crown, Upload, Download, 
  Loader2, Check, Wand2, Image as ImageIcon,
  AlignLeft, Smartphone, Palette, Grid3X3, Hash
} from 'lucide-react';
import Footer from '@/components/common/Footer';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

// 自媒体功能列表
const SOCIAL_FUNCTIONS = [
  { id: 'cover', name: '小红书封面', icon: ImageIcon, color: 'from-pink-400 to-rose-500', desc: '爆款笔记封面一键生成', vip: false },
  { id: 'style', name: '风格统一', icon: Palette, color: 'from-violet-400 to-purple-500', desc: '批量配图色调风格统一', vip: true },
  { id: 'resize', name: '尺寸适配', icon: Smartphone, color: 'from-emerald-400 to-teal-500', desc: '一键适配多平台尺寸', vip: false },
  { id: 'layout', name: '图文排版', icon: AlignLeft, color: 'from-amber-400 to-orange-500', desc: '精美笔记长图排版', vip: false },
];

function FunctionCard({ func, onClick }: { func: typeof SOCIAL_FUNCTIONS[0]; onClick: () => void }) {
  const Icon = func.icon;
  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${func.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{func.name}</h3>
          <p className="text-xs text-slate-500">{func.desc}</p>
        </div>
        {func.vip ? (
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-full flex items-center gap-0.5">
            <Crown className="w-3 h-3" /> VIP
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full">
            免费
          </span>
        )}
      </div>
    </button>
  );
}

// 小红书封面生成
function CoverGeneratorFunction({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('meiti');
  const [size, setSize] = useState('9:16');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const categories = [
    { id: 'meiti', name: '美妆穿搭' },
    { id: 'haowu', name: '好物推荐' },
    { id: 'meishi', name: '美食探店' },
    { id: 'shenghuo', name: '生活日常' },
    { id: 'zhichang', name: '职场干货' },
  ];

  const templates = [
    { name: '清新文艺风', bg: 'bg-gradient-to-br from-pink-100 to-purple-100' },
    { name: '高级感简约', bg: 'bg-gradient-to-br from-slate-100 to-zinc-200' },
    { name: '活力撞色', bg: 'bg-gradient-to-br from-orange-400 to-pink-400' },
    { name: '奶油ins风', bg: 'bg-gradient-to-br from-amber-50 to-pink-100' },
  ];

  const handleGenerate = async () => {
    if (!topic || !title) { setToast('请填写笔记主题和标题'); return; }
    setGenerating(true);
    setToast('正在生成封面...');
    await new Promise(r => setTimeout(r, 2500));
    setResults(Array(4).fill(''));
    setGenerating(false);
    setToast('生成完成！');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">小红书爆款封面生成</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* 输入区域 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">笔记信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">笔记主题</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：春季穿搭分享"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-400 focus:border-pink-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">核心关键词</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例如：韩系、显白、春装"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-400 focus:border-pink-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">标题文案</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：这件衬衫太绝了！通勤约会都能穿"
                  rows={2}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-400 focus:border-pink-500 transition-colors text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">笔记赛道</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-400 focus:border-pink-500 transition-colors text-sm"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">封面尺寸</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-400 focus:border-pink-500 transition-colors text-sm"
                  >
                    <option value="9:16">小红书 (9:16)</option>
                    <option value="1:1">正方形 (1:1)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 模板选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">选择封面风格</h3>
            <div className="grid grid-cols-4 gap-3">
              {templates.map((t, idx) => (
                <div key={idx} className={`aspect-[9/16] ${t.bg} rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 ring-pink-400 transition-all`}>
                  <span className="text-xs text-slate-600 font-medium">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <div className="flex items-center justify-center">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-lg flex items-center gap-3 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
              {generating ? '生成中...' : '生成4张封面'}
            </button>
          </div>

          {/* 结果展示 */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {results.map((_, idx) => (
                <div key={idx} className="bg-gradient-to-br from-pink-100 to-purple-100 aspect-[9/16] rounded-2xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-2xl font-bold text-slate-800 mb-2">{title || '封面示例'}</p>
                    <p className="text-sm text-slate-500">{topic}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">爆款封面技巧</h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>标题要有悬念或共鸣，激发用户好奇心</span>
              </div>
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>关键词突出，让用户一眼看懂内容</span>
              </div>
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>选择与内容匹配的风格色调</span>
              </div>
              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>爆款元素：emoji、数字、对比、反差</span>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-2xl p-5 border border-pink-100 dark:border-pink-900">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold text-pink-700 dark:text-pink-400">热门标题公式</h3>
            </div>
            <div className="space-y-2 text-sm text-pink-600 dark:text-pink-400">
              <p>❶ 这件XXX太绝了！必须分享</p>
              <p>❷ 答应我！一定要试试这个</p>
              <p>❸ XXX元拿下！性价比超高</p>
              <p>❹ 闺蜜追着问的链接来了</p>
              <p>❺ 答应我！看完这篇再买</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 图文排版功能
function LayoutDesignFunction({ onBack }: { onBack: () => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string].slice(0, 9));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const layouts = [
    { name: '左图右文', cols: 1, rows: 1 },
    { name: '右图左文', cols: 1, rows: 1 },
    { name: '上方图下方文', cols: 1, rows: 2 },
    { name: '多图网格', cols: 2, rows: 2 },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <AlignLeft className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">图文排版美化</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* 图片上传 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">上传图片 (最多9张)</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg text-sm"
              >
                添加图片
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            
            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-amber-400"
              >
                <Upload className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500">点击上传笔记配图</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <img src={img} alt={`配图 ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 文案输入 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">输入正文内容</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入你的笔记正文..."
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-amber-400 focus:border-amber-500 transition-colors text-sm resize-none"
            />
          </div>

          {/* 布局选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">选择排版模板</h3>
            <div className="grid grid-cols-4 gap-3">
              {layouts.map((l, idx) => (
                <div key={idx} className="border-2 border-slate-200 rounded-xl p-3 cursor-pointer hover:border-amber-400">
                  <div className="aspect-square bg-slate-100 rounded mb-2" />
                  <p className="text-xs text-center text-slate-600">{l.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              生成排版长图
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>一键生成精美的小红书笔记长图：</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>多种精美排版模板</li>
                <li>自动优化图文比例</li>
                <li>添加装饰元素</li>
                <li>支持水印设置</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-3">排版小技巧</h3>
            <div className="space-y-2 text-sm text-amber-600 dark:text-amber-500">
              <p>✓ 图片与文字比例建议 3:2</p>
              <p>✓ 每段文字不超过100字</p>
              <p>✓ 添加emoji增加趣味性</p>
              <p>✓ 使用分隔符划分段落</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 尺寸适配功能
function SizeAdapterFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [target, setTarget] = useState('xiaohongshu');
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms = [
    { id: 'xiaohongshu', name: '小红书', size: '9:16 (337×600)' },
    { id: 'douyin', name: '抖音', size: '9:16 (1080×1920)' },
    { id: 'wechat', name: '微信公众号', size: '2.35:1 (1080×460)' },
    { id: 'weibo', name: '微博', size: '3:4 (1080×1440)' },
    { id: 'instagram', name: 'Instagram', size: '1:1 (1080×1080)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">自媒体图片尺寸适配</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400"
          >
            {image ? (
              <img src={image} alt="预览" className="w-full h-full object-contain" />
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Upload className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500">点击上传图片</p>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">目标平台</h3>
            <div className="space-y-2">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setTarget(p.id)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${
                    target === p.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-slate-800 dark:text-white">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.size}</div>
                  </div>
                  {target === p.id && <Check className="w-5 h-5 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              一键适配尺寸
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">支持的平台</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>小红书：9:16 竖版封面、1:1 方图</p>
              <p>抖音：9:16 竖版视频封面</p>
              <p>微信公众号：2.35:1 横幅</p>
              <p>微博：3:4 配图、16:9 头图</p>
              <p>Instagram：1:1 方图、4:5 竖图</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);

  const renderFunction = () => {
    switch (activeFunction) {
      case 'cover':
        return <CoverGeneratorFunction onBack={() => setActiveFunction(null)} />;
      case 'resize':
        return <SizeAdapterFunction onBack={() => setActiveFunction(null)} />;
      case 'layout':
        return <LayoutDesignFunction onBack={() => setActiveFunction(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">自媒体专区</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {activeFunction ? (
          renderFunction()
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">自媒体图片处理中心</h1>
              <p className="text-slate-500">专为小红书、抖音创作者打造的内容配图解决方案</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOCIAL_FUNCTIONS.map(func => (
                <FunctionCard 
                  key={func.id} 
                  func={func} 
                  onClick={() => {
                    if (['cover', 'resize', 'layout'].includes(func.id)) {
                      setActiveFunction(func.id);
                    }
                  }}
                />
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">爆款封面技巧</h3>
                </div>
                <p className="text-sm opacity-80 mb-4">掌握这些技巧，让你的笔记更容易获得曝光</p>
                <button className="px-4 py-2 bg-white text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-50">
                  查看教程
                </button>
              </div>

              <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Grid3X3 className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">风格统一指南</h3>
                </div>
                <p className="text-sm opacity-80 mb-4">打造账号视觉一致性，提升专业感</p>
                <button className="px-4 py-2 bg-white text-violet-600 rounded-lg text-sm font-medium hover:bg-violet-50">
                  了解更多
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
