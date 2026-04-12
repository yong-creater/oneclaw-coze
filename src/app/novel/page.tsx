'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download,
  ChevronDown, Feather, UserCircle, ImagePlus, Mountain
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import LoginModal from '@/components/LoginModal';

const API2D_KEY = '';
const API_BASE_URL = 'https://oa.api2d.net/v1';
const REQUEST_TIMEOUT = 30000;
const RATE_LIMIT_MAX = 5;

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

const MODELS = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5', recommend: '写作最强' },
  { id: 'gemini-1.5-pro', name: 'Gemini Pro', recommend: '性价比高' },
  { id: 'gpt-4o', name: 'GPT-4o', recommend: '均衡之选' }
];

class RateLimiter {
  private requests: number[] = [];
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < 60000);
    return this.requests.length < RATE_LIMIT_MAX;
  }
  getRemainingRequests(): number {
    return RATE_LIMIT_MAX - this.requests.length;
  }
  addRequest(): void {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

export default function NovelPage() {
  const [activeFeature, setActiveFeature] = useState('polish');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth?action=check', { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.authenticated);
      } catch { /* ignore */ }
    };
    checkLogin();
  }, []);

  const getApiKey = useCallback((): string => {
    return process.env.NEXT_PUBLIC_API2D_KEY || API2D_KEY;
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
    if (!getApiKey()) {
      setError('请先配置 API Key');
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
      const response = await fetch(API_BASE_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getApiKey()
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[activeFeature] || '' },
            { role: 'user', content: inputText }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const data = await response.json();
      setOutputText(data.choices?.[0]?.message?.content || '');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('请求超时');
      } else {
        setError(err.message || '生成失败');
      }
    } finally {
      setIsLoading(false);
      cancelRequest();
    }
  }

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('复制失败');
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novel.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentFeature = FEATURES.find(f => f.id === activeFeature);
  const currentModel = MODELS.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLobster size={24} />
              <span className="font-bold text-lg">OneClaw</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-slate-600 hover:text-orange-500">返回首页</Link>
              {isLoggedIn ? (
                <Link href="/workspace" className="px-4 py-2 text-sm border rounded-full hover:border-orange-500">工作台</Link>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="px-4 py-2 text-sm border rounded-full hover:border-orange-500">登录</button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Feather className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">小说创作大师</h1>
              <p className="text-white/80 text-sm">AI 驱动的专业小说创作工具</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setActiveFeature(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeFeature === f.id ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
                <Icon className="w-4 h-4" />
                {f.name}
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <button onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg">
            <span className="text-sm">模型: <span className="font-medium">{currentModel?.name}</span></span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showModelDropdown && (
            <div className="mt-2 w-48 bg-white border rounded-lg shadow-lg">
              {MODELS.map(m => (
                <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.recommend}</div>
                </button>
              ))}
            </div>
          )}
          <span className="ml-4 text-sm text-slate-500">剩余请求: {rateLimiter.getRemainingRequests()}</span>
        </div>

        <div className="mb-6">
          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
            placeholder={currentFeature?.placeholder}
            className="w-full h-48 p-4 bg-white border rounded-xl resize-none" />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button onClick={isLoading ? cancelRequest : handleSubmit}
            disabled={!inputText.trim() && !isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isLoading ? '生成中...' : '开始创作'}
          </button>
          {error && <span className="text-red-500 text-sm"><AlertCircle className="w-4 h-4 inline" /> {error}</span>}
        </div>

        {(outputText || isLoading) && (
          <div className="bg-white border rounded-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-medium">创作结果</span>
              {outputText && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-xs text-slate-500 hover:text-orange-500">
                    {copied ? <Check className="w-3 h-3 inline" /> : <Copy className="w-3 h-3 inline" />} {copied ? '已复制' : '复制'}
                  </button>
                  <button onClick={handleDownload} className="text-xs text-slate-500 hover:text-orange-500">
                    <Download className="w-3 h-3 inline" /> 下载
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 whitespace-pre-wrap">
              {isLoading ? <span className="text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline" /> AI 创作中...</span> : outputText}
            </div>
          </div>
        )}
      </main>

      {showLoginModal && <LoginModal open={true} onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
