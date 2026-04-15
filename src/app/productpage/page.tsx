'use client';

import { useState, useRef } from 'react';
import { 
  Globe, Sparkles, Loader2, Download, Copy, Check, 
  RefreshCw, Zap, ChevronDown, ExternalLink, FileText, Languages
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/BackToHome';

const AI_MODELS = [
  { value: 'doubao-seed-2-0-pro-260215', label: '豆包 Seed 2.0 Pro（推荐）' },
  { value: 'doubao-seed-2-0-lite-260215', label: '豆包 Seed 2.0 Lite' },
  { value: 'doubao-pro-4k-240815', label: '豆包 Pro 4K' },
  { value: 'doubao-lite-4k-240815', label: '豆包 Lite 4K' },
  { value: 'deepseek-chat', label: 'DeepSeek V3.2' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
];

const PLATFORMS = [
  { value: 'amazon', label: '亚马逊 Amazon' },
  { value: 'shopify', label: 'Shopify 独立站' },
  { value: 'aliexpress', label: '速卖通 AliExpress' },
  { value: 'ebay', label: 'eBay' },
  { value: 'woocommerce', label: 'WooCommerce' },
];

const LANGUAGES = [
  { value: 'en', label: '英语' },
  { value: 'de', label: '德语' },
  { value: 'fr', label: '法语' },
  { value: 'es', label: '西班牙语' },
  { value: 'it', label: '意大利语' },
  { value: 'ja', label: '日语' },
];

const TONES = [
  { value: 'professional', label: '专业正式' },
  { value: 'casual', label: '轻松 casual' },
  { value: 'luxury', label: '轻奢高端' },
  { value: 'friendly', label: '友好亲切' },
];

interface GeneratedContent {
  title: string;
  bullets: string[];
  description: string;
  keywords: string[];
}

export default function ProductPage() {
  const [platform, setPlatform] = useState('amazon');
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('professional');
  const [productName, setProductName] = useState('');
  const [productFeatures, setProductFeatures] = useState('');
  const [aiModel, setAiModel] = useState('doubao-seed-2-0-pro-260215');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [showModelSelect, setShowModelSelect] = useState(false);

  const handleGenerate = async () => {
    if (!productName.trim() || !productFeatures.trim()) {
      alert('请填写产品名称和核心卖点');
      return;
    }

    setGenerating(true);
    setResult(null);
    setStreamText('');

    try {
      const response = await fetch('/api/productpage/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          language,
          tone,
          productName,
          productFeatures,
          aiModel,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      // 流式读取
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        fullText += text;
        setStreamText(fullText);
      }

      // 解析结果
      const parsed = parseGeneratedContent(fullText);
      setResult(parsed);
      setStreamText('');

    } catch (error: any) {
      console.error('生成失败:', error);
      alert(error.message || '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const parseGeneratedContent = (text: string): GeneratedContent => {
    const result: GeneratedContent = {
      title: '',
      bullets: [],
      description: '',
      keywords: [],
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('标题') || trimmed.includes('Title')) {
        currentSection = 'title';
        result.title = trimmed.replace(/.*[:：]/, '').trim();
      } else if (trimmed.includes('卖点') || trimmed.includes('Bullet')) {
        currentSection = 'bullets';
      } else if (trimmed.includes('描述') || trimmed.includes('Description')) {
        currentSection = 'description';
      } else if (trimmed.includes('关键词') || trimmed.includes('Keyword')) {
        currentSection = 'keywords';
      } else if (trimmed && currentSection === 'title') {
        result.title = trimmed;
      } else if (trimmed && currentSection === 'bullets' && trimmed.startsWith('-')) {
        result.bullets.push(trimmed.replace(/^[-•*]\s*/, ''));
      } else if (trimmed && currentSection === 'bullets') {
        result.bullets.push(trimmed);
      } else if (trimmed && currentSection === 'description') {
        result.description += (result.description ? '\n' : '') + trimmed;
      } else if (trimmed && currentSection === 'keywords') {
        result.keywords.push(trimmed.replace(/^[-•*]\s*/, ''));
      }
    }

    // 如果解析失败，尝试简单处理
    if (!result.title && text) {
      const titleMatch = text.match(/(?:标题|Title)[:：]\s*(.+?)(?:\n|$)/i);
      if (titleMatch) result.title = titleMatch[1];
      else result.title = productName + ' - Premium Quality';
    }

    return result;
  };

  const handleCopy = async () => {
    if (!result) return;
    
    const content = `
【产品标题】
${result.title}

【核心卖点】
${result.bullets.map(b => `• ${b}`).join('\n')}

【产品描述】
${result.description}

【搜索关键词】
${result.keywords.join(', ')}
    `.trim();

    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = `Product Listing Content
Generated with OneClaw AI Tools
=====================================

Platform: ${PLATFORMS.find(p => p.value === platform)?.label}
Language: ${LANGUAGES.find(l => l.value === language)?.label}
Tone: ${TONES.find(t => t.value === tone)?.label}

=====================================

【PRODUCT TITLE】
${result.title}

【BULLET POINTS】
${result.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

【PRODUCT DESCRIPTION】
${result.description}

【SEARCH KEYWORDS】
${result.keywords.join(', ')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-listing-${platform}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <BackToHome />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">出海详情页生成器</h1>
              <p className="text-sm text-gray-500">一键生成亚马逊、Shopify 等平台的产品详情页</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-emerald-100 shadow-lg shadow-emerald-500/5">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  产品信息
                </h2>

                {/* Product Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    产品名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="例如：无线蓝牙耳机 Pro Max"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white"
                  />
                </div>

                {/* Product Features */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    核心卖点 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="输入产品的核心卖点，每行一个，例如：
- 主动降噪深度达40dB
- 续航时间32小时
- 支持快充，充电10分钟使用3小时
- IPX5级防水防汗"
                    className="min-h-[140px] w-full px-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl 
                               focus:bg-white resize-none text-sm"
                    value={productFeatures}
                    onChange={(e) => setProductFeatures(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">每行描述一个卖点，越详细生成效果越好</p>
                </div>

                {/* Platform */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    目标平台
                  </label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    目标语言
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    文案风格
                  </label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Model */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      AI 模型
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                      onClick={() => setShowModelSelect(!showModelSelect)}
                    >
                      {showModelSelect ? '收起' : '切换模型'}
                    </Button>
                  </div>
                  {showModelSelect && (
                    <Select value={aiModel} onValueChange={setAiModel}>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {showModelSelect ? '选择不同的模型可能有不同的生成效果' : '使用豆包模型，效果更稳定'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 
                         hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700
                         text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/25
                         disabled:opacity-50"
              onClick={handleGenerate}
              disabled={generating || !productName.trim() || !productFeatures.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  正在生成中...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  一键生成详情页
                </>
              )}
            </Button>
          </div>

          {/* Right: Result */}
          <div className="space-y-6">
            {generating && streamText && (
              <Card className="bg-white/90 backdrop-blur-sm border-emerald-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-700">AI 正在生成...</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {streamText}
                      <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1" />
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className="bg-white/90 backdrop-blur-sm border-emerald-100 shadow-lg shadow-emerald-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      生成结果
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={handleCopy}
                      >
                        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied ? '已复制' : '复制'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-emerald-100 text-emerald-700">产品标题</Badge>
                        <span className="text-xs text-gray-400">SEO优化标题</span>
                      </div>
                      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                        <p className="text-gray-900 leading-relaxed">{result.title}</p>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">核心卖点</Badge>
                        <span className="text-xs text-gray-400">5个关键卖点</span>
                      </div>
                      <div className="space-y-2">
                        {result.bullets.length > 0 ? result.bullets.map((bullet, idx) => (
                          <div key={idx} className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                            <p className="text-gray-700 text-sm">{bullet}</p>
                          </div>
                        )) : (
                          <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                            卖点数据解析中...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-700">产品描述</Badge>
                        <span className="text-xs text-gray-400">A+内容优化</span>
                      </div>
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {result.description || '产品详细描述将在这里显示...'}
                        </p>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-100 text-amber-700">搜索关键词</Badge>
                        <span className="text-xs text-gray-400">SEO关键词</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.length > 0 ? result.keywords.map((keyword, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700">
                            {keyword}
                          </span>
                        )) : (
                          <span className="text-gray-400 text-sm">关键词将在这里显示...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!generating && !result && (
              <Card className="bg-white/90 backdrop-blur-sm border-emerald-100 shadow-lg">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <Globe className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">准备生成</h3>
                  <p className="text-gray-500 text-sm">
                    填写左侧产品信息，点击生成按钮<br />
                    AI 将为你创建专业的出海产品详情页
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
