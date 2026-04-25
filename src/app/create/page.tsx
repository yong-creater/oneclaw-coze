'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Sparkles, Loader2, Palette, FileText, 
  ShoppingCart, TrendingUp, Settings, Copy, Check, Download, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// 生成器类型
type GeneratorType = 'xiaohongshu' | 'product' | 'poster';

interface GeneratorConfig {
  id: GeneratorType;
  name: string;
  icon: any;
  color: string;
  prompt: string;
  inputs: { key: string; label: string; placeholder: string; type: string; options?: string[] }[];
  outputLabels: string[];
}

// 生成器配置
const GENERATORS: GeneratorConfig[] = [
  {
    id: 'xiaohongshu',
    name: '小红书封面生成',
    icon: '📕',
    color: 'from-pink-500 to-rose-500',
    prompt: `viral social media cover about {topic}

style: Xiaohongshu viral aesthetic, trendy lifestyle
emotion: strong curiosity trigger, FOMO
layout: bold typography overlay, collage design
color: high contrast trendy palette, pastel accents
quality: magazine cover level, 4K`,
    inputs: [
      { key: 'topic', label: '主题', placeholder: '例如：职场穿搭｜通勤妆容｜探店打卡', type: 'text' },
      { key: 'style', label: '风格', placeholder: '例如：高级感、INS风、潮酷', type: 'select', options: ['高级感', 'INS风', '潮酷', '小清新', '轻奢'] },
    ],
    outputLabels: ['爆款封面'],
  },
  {
    id: 'product',
    name: '商品主图生成',
    icon: '🛍️',
    color: 'from-emerald-500 to-teal-500',
    prompt: `luxury commercial product photography of {product_name}, {product_type}

scene: premium studio or lifestyle environment
style: high-end e-commerce advertising
composition: centered product, clean layout, professional product shot
lighting: softbox studio lighting with rim lighting
quality: 8k ultra realistic, commercial grade photography
commercial: suitable for Tmall, JD, Amazon listing`,
    inputs: [
      { key: 'product_name', label: '商品名称', placeholder: '例如：精华液、手提包、运动鞋', type: 'text' },
      { key: 'product_type', label: '商品类型', placeholder: '例如：护肤品、配饰、运动装备', type: 'text' },
    ],
    outputLabels: ['白底图', '场景图', '商业广告图'],
  },
  {
    id: 'poster',
    name: '广告海报生成',
    icon: '🎯',
    color: 'from-orange-500 to-red-500',
    prompt: `high-end advertising poster for {product}

style: Apple-style minimal commercial design
composition: strong visual hierarchy, brand focus
lighting: cinematic lighting, dramatic shadows
quality: agency-level advertising photography
elements: brand logo placement, minimalist approach`,
    inputs: [
      { key: 'product', label: '产品名称', placeholder: '例如：新品上市、限时折扣', type: 'text' },
      { key: 'brand', label: '品牌名称', placeholder: '例如：某时尚品牌', type: 'text' },
    ],
    outputLabels: ['品牌海报', '活动海报'],
  },
];

function GeneratorPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as GeneratorType;
  
  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorConfig>(
    GENERATORS.find(g => g.id === type) || GENERATORS[0]
  );
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (type && GENERATORS.find(g => g.id === type)) {
      setSelectedGenerator(GENERATORS.find(g => g.id === type)!);
    }
  }, [type]);

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const generate = async () => {
    // 检查必填项
    const missingFields = selectedGenerator.inputs.filter(
      input => !inputs[input.key]?.trim()
    );
    
    if (missingFields.length > 0) {
      toast.error(`请填写: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setGenerating(true);
    setResults([]);

    try {
      // 构建 prompt
      let prompt = selectedGenerator.prompt;
      selectedGenerator.inputs.forEach(input => {
        prompt = prompt.replace(`{${input.key}}`, inputs[input.key] || '');
      });

      // 调用生成接口（这里使用通用生成接口）
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          type: selectedGenerator.id,
          count: selectedGenerator.outputLabels.length 
        }),
      });

      const data = await res.json();
      
      if (data.success && data.results) {
        setResults(data.results);
        toast.success('生成成功！');
      } else {
        // 如果接口不可用，显示 prompt 预览
        setResults([prompt]);
        toast.info('已生成 Prompt，可复制使用');
      }
    } catch (error) {
      // 降级：直接返回 prompt
      let prompt = selectedGenerator.prompt;
      selectedGenerator.inputs.forEach(input => {
        prompt = prompt.replace(`{${input.key}}`, inputs[input.key] || '');
      });
      setResults([prompt]);
      toast.info('已生成 Prompt，可复制使用');
    } finally {
      setGenerating(false);
    }
  };

  const copyPrompt = () => {
    if (results[0]) {
      navigator.clipboard.writeText(results[0]);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="font-bold text-lg">AI工具生成</h1>
            </div>
            <Link 
              href="/"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 生成器选择 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {GENERATORS.map(gen => (
            <button
              key={gen.id}
              onClick={() => {
                setSelectedGenerator(gen);
                setInputs({});
                setResults([]);
              }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedGenerator.id === gen.id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gen.color} flex items-center justify-center text-xl mb-2`}>
                {gen.icon}
              </div>
              <h3 className="font-semibold text-sm">{gen.name}</h3>
            </button>
          ))}
        </div>

        {/* 输入区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedGenerator.color} flex items-center justify-center text-lg`}>
              {selectedGenerator.icon}
            </div>
            {selectedGenerator.name}
          </h2>

          <div className="space-y-4">
            {selectedGenerator.inputs.map(input => (
              <div key={input.key}>
                <label className="block text-sm font-medium mb-2">{input.label}</label>
                {input.type === 'select' ? (
                  <select
                    value={inputs[input.key] || ''}
                    onChange={e => handleInputChange(input.key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-orange-500 outline-none transition-colors"
                  >
                    <option value="">请选择</option>
                    {(input.options || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={inputs[input.key] || ''}
                    onChange={e => handleInputChange(input.key, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-orange-500 outline-none transition-colors"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedGenerator.color} hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                一键生成
              </>
            )}
          </button>
        </div>

        {/* 结果区域 */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                生成结果
              </h2>
              <button
                onClick={generate}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </button>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {selectedGenerator.outputLabels[index] || `结果 ${index + 1}`}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result);
                        toast.success('已复制');
                      }}
                      className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                    {result}
                  </pre>
                </div>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={copyPrompt}
                className="flex-1 py-2.5 rounded-xl font-medium border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制全部'}
              </button>
              <button className="flex-1 py-2.5 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <GeneratorPage />
    </Suspense>
  );
}
