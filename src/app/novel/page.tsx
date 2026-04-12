'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download,
  Feather, UserCircle, ImagePlus, Mountain, Sparkles, MessageSquare, Brain, Wand2
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import LoginModal from '@/components/LoginModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API2D_URL || 'https://4sapi.com';
const REQUEST_TIMEOUT = 60000;
const RATE_LIMIT_MAX = 10;

const SYSTEM_PROMPTS: Record<string, string> = {
  polish: '你是专业小说编辑，擅长洗稿润色，保留核心剧情，优化句式表达，提升文字质感。',
  character: '你是小说人设专家，擅长打造鲜活的小说人物，生成完整的人物DNA设定卡。',
  imagePrompt: '你是AI绘画提示词工程师，生成适配Midjourney、Stable Diffusion的高质量提示词。',
  scenePrompt: '你是专业场景设计师，生成小说场景描写和配套的AI绘图提示词。'
};

const FEATURES = [
  { id: 'polish', name: '洗稿润色', icon: Feather, placeholder: '请输入需要洗稿润色的原文内容...' },
  { id: 'character', name: '人物DNA', icon: UserCircle, placeholder: '请输入人物核心描述，如：冷漠的剑客、年迈的将军...' },
  { id: 'imagePrompt', name: '绘画提示词', icon: ImagePlus, placeholder: '请描述你想要的画面，如：一个古风剑客站在悬崖边...' },
  { id: 'scenePrompt', name: '场景描写', icon: Mountain, placeholder: '请描述场景，如：雨夜的江南小镇、荒废的古庙...' }
];

// 模型分类
const MODEL_CATEGORIES = [
  { id: 'free', name: '免费推荐', subtitle: '零成本体验', icon: Sparkles, filter: (m: any) => m.isFree },
  { id: 'chat', name: '对话模型', subtitle: '智能对话助手', icon: MessageSquare, filter: (m: any) => m.category === '对话' },
  { id: 'reasoning', name: '推理模型', subtitle: '复杂推理分析', icon: Brain, filter: (m: any) => m.category === '推理' },
  { id: 'pro', name: '专业模型', subtitle: '专业领域模型', icon: Wand2, filter: (m: any) => ['图像', '视觉', '音频', '向量'].includes(m.category) },
];

// Rate Limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  
  constructor(maxRequests: number) {
    this.maxRequests = maxRequests;
  }
  
  addRequest() {
    this.requests.push(Date.now());
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < 60000);
    return this.requests.length < this.maxRequests;
  }
  
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < 60000);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

export default function NovelPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('polish');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('free');
  const [modelSearch, setModelSearch] = useState('');
  const [selectedModelCategory, setSelectedModelCategory] = useState('free');
  const [showModelList, setShowModelList] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const rateLimiter = new RateLimiter(RATE_LIMIT_MAX);
  
  const currentFeature = FEATURES.find(f => f.id === selectedFeature);
  const currentModel = availableModels.find(m => m.id === selectedModel) || { name: selectedModel, provider: 'Coze', providerLogo: '🦞', isFree: true };
  const currentCategory = MODEL_CATEGORIES.find(c => c.id === selectedModelCategory);
  const filteredModels = availableModels.filter(m => currentCategory?.filter(m) ?? true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth?action=check', { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.authenticated);
      } catch { /* ignore */ }
    };
    checkLogin();

    // 获取可用模型列表
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        if (data.success) {
          setAvailableModels(data.models);
        }
      } catch (e) {
        console.error('Failed to fetch models:', e);
      }
    };
    fetchModels();
  }, []);

  const getApiKey = useCallback((): string => {
    return process.env.NEXT_PUBLIC_API2D_KEY || '';
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('请输入内容');
      return;
    }
    
    const apiKey = getApiKey();
    const isCozeModel = availableModels.find(m => m.id === selectedModel)?.isFree;
    
    // 检查是否需要API密钥
    if (!isCozeModel && !apiKey) {
      setError('请先配置 4sapi API Key（国外模型需要）');
      return;
    }
    
    if (!rateLimiter.canMakeRequest()) {
      setError('请求过于频繁，请稍后重试');
      return;
    }

    rateLimiter.addRequest();
    setError('');
    setOutputText('');
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, REQUEST_TIMEOUT);

    try {
      let response;
      
      if (isCozeModel) {
        // 使用 Coze 内置免费模型
        response = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPTS[selectedFeature] || '' },
              { role: 'user', content: inputText }
            ],
            stream: true
          }),
          signal: abortController.signal
        });
      } else {
        // 使用 4sapi 付费模型
        response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPTS[selectedFeature] || '' },
              { role: 'user', content: inputText }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            stream: true
          }),
          signal: abortController.signal
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `请求失败 (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              // 兼容两种响应格式
              const content = parsed.choices?.[0]?.delta?.content || parsed.content;
              if (content) {
                result += typeof content === 'string' ? content : content.toString();
                setOutputText(result);
              }
            } catch { /* ignore parse errors */ }
          } else if (isCozeModel) {
            // Coze 流式响应可能是纯文本
            try {
              result += line;
              setOutputText(result);
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('请求超时');
      } else {
        setError(err.message || '生成失败');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novel_${selectedFeature}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AnimatedLobster size={32} />
            <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              OneClaw
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-600 hover:text-orange-500">
              返回首页
            </Link>
            <button
              onClick={() => isLoggedIn ? null : setShowLoginModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm hover:from-orange-600 hover:to-amber-600"
            >
              {isLoggedIn ? '已登录' : '登录'}
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              AI 小说创作助手
            </span>
          </h1>
          <p className="text-slate-600">基于 4sapi 213+ 优质模型，让创作更轻松</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧：输入 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* 功能选择 - 横向一行 */}
            <div className="mb-6">
              <div className="flex gap-2">
                {FEATURES.map(f => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFeature(f.id)}
                      className={`flex-1 p-3 rounded-xl transition-all flex flex-col items-center gap-2 ${
                        selectedFeature === f.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selectedFeature === f.id ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`font-medium text-sm ${selectedFeature === f.id ? 'text-white' : 'text-slate-700'}`}>
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 模型选择 - 纵向卡片样式 */}
            <div className="mb-6">
              <div className="space-y-2">
                {MODEL_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const count = availableModels.filter(m => cat.filter(m)).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedModelCategory(cat.id);
                        setShowModelList(true);
                      }}
                      className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${
                        selectedModelCategory === cat.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedModelCategory === cat.id
                          ? 'bg-white/20'
                          : 'bg-slate-200'
                      }`}>
                        <Icon className={`w-5 h-5 ${selectedModelCategory === cat.id ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${selectedModelCategory === cat.id ? 'text-white' : 'text-slate-700'}`}>
                          {cat.name}
                        </div>
                        <div className={`text-xs ${selectedModelCategory === cat.id ? 'text-white/80' : 'text-slate-400'}`}>
                          {cat.subtitle} · {count}个模型
                        </div>
                      </div>
                      {selectedModelCategory === cat.id && (
                        <span className="w-5 h-5 rounded-full bg-white text-orange-500 flex items-center justify-center text-xs font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 模型列表弹窗 */}
            {showModelList && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModelList(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{currentCategory?.name}</h3>
                        <p className="text-sm text-white/80 mt-1">
                          共 {filteredModels.length} 个模型可选
                        </p>
                      </div>
                      <button onClick={() => setShowModelList(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">✕</button>
                    </div>
                  </div>
                  
                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {filteredModels.slice(0, 50).map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setShowModelList(false);
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            selectedModel === m.id 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-slate-200 hover:border-orange-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{m.providerLogo || '⚡'}</span>
                            <div>
                              <div className="font-medium">{m.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">{m.provider}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-xs text-orange-500">{m.recommend}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {m.isFree ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">免费</span>
                            ) : (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">付费</span>
                            )}
                            {selectedModel === m.id && (
                              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {currentFeature?.name} - 输入内容
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentFeature?.placeholder}
                className="w-full h-48 p-4 border-2 rounded-xl resize-none focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-3">
              {isLoading ? (
                <button
                  onClick={cancelRequest}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  取消生成
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  开始生成
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          {/* 右侧：输出 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">生成结果</h2>
              {outputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                value={outputText}
                readOnly
                placeholder="生成的内容将显示在这里..."
                className="w-full h-[500px] p-4 border-2 rounded-xl resize-none bg-slate-50"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                    <p className="mt-2 text-sm text-slate-600">正在生成...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            setIsLoggedIn(true);
          }}
        />
      )}
    </div>
  );
}
