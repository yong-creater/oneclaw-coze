'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download,
  ChevronDown, Feather, UserCircle, ImagePlus, Mountain
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

const MODELS = [
  // OpenAI 系列 (178个)
  { id: 'gpt-4o', name: 'GPT-4o', recommend: '均衡之选', provider: 'OpenAI', category: 'chat' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', recommend: '快速响应', provider: 'OpenAI', category: 'chat' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', recommend: '高性能', provider: 'OpenAI', category: 'chat' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', recommend: '低成本', provider: 'OpenAI', category: 'chat' },
  { id: 'o1-preview', name: 'o1 Preview', recommend: '复杂推理', provider: 'OpenAI', category: 'reasoning' },
  { id: 'o1-mini', name: 'o1 Mini', recommend: '代码专用', provider: 'OpenAI', category: 'reasoning' },
  { id: 'o1', name: 'o1', recommend: '最强推理', provider: 'OpenAI', category: 'reasoning' },
  { id: 'gpt-4o-audio', name: 'GPT-4o Audio', recommend: '语音交互', provider: 'OpenAI', category: 'audio' },
  { id: 'gpt-4o-realtime', name: 'GPT-4o Realtime', recommend: '实时对话', provider: 'OpenAI', category: 'realtime' },
  { id: 'dall-e-3', name: 'DALL-E 3', recommend: '图像生成', provider: 'OpenAI', category: 'image' },
  { id: 'dall-e-2', name: 'DALL-E 2', recommend: '图像生成', provider: 'OpenAI', category: 'image' },
  { id: 'whisper-1', name: 'Whisper', recommend: '语音识别', provider: 'OpenAI', category: 'audio' },
  { id: 'tts-1', name: 'TTS', recommend: '语音合成', provider: 'OpenAI', category: 'audio' },
  
  // Anthropic 系列 (21个)
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', recommend: '写作最强', provider: 'Anthropic', category: 'chat' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', recommend: '极速响应', provider: 'Anthropic', category: 'chat' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', recommend: '最强推理', provider: 'Anthropic', category: 'chat' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', recommend: '均衡性能', provider: 'Anthropic', category: 'chat' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', recommend: '轻量快速', provider: 'Anthropic', category: 'chat' },
  { id: 'claude-opus-3-5-20241120', name: 'Claude Opus 3.5', recommend: '最新旗舰', provider: 'Anthropic', category: 'chat' },
  
  // Google 系列 (22个)
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', recommend: '长上下文', provider: 'Google', category: 'chat' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', recommend: '极速免费', provider: 'Google', category: 'chat' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini Flash-8B', recommend: '超轻量级', provider: 'Google', category: 'chat' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', recommend: '最新模型', provider: 'Google', category: 'chat' },
  { id: 'gemini-2.0-pro-exp', name: 'Gemini 2.0 Pro', recommend: '最强能力', provider: 'Google', category: 'chat' },
  { id: 'gemini-pro', name: 'Gemini Pro', recommend: '均衡性能', provider: 'Google', category: 'chat' },
  { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', recommend: '视觉理解', provider: 'Google', category: 'vision' },
  { id: 'imagen-3', name: 'Imagen 3', recommend: '图像生成', provider: 'Google', category: 'image' },
  { id: 'imagen-2', name: 'Imagen 2', recommend: '高质量图像', provider: 'Google', category: 'image' },
  
  // DeepSeek 系列 (8个)
  { id: 'deepseek-chat', name: 'DeepSeek Chat', recommend: '通用对话', provider: 'DeepSeek', category: 'chat' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', recommend: '代码专家', provider: 'DeepSeek', category: 'code' },
  { id: 'deepseek-v2.5', name: 'DeepSeek V2.5', recommend: '最新模型', provider: 'DeepSeek', category: 'chat' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', recommend: '旗舰模型', provider: 'DeepSeek', category: 'chat' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', recommend: '推理能力', provider: 'DeepSeek', category: 'reasoning' },
  { id: 'deepseek-r1-distill', name: 'DeepSeek R1 Distill', recommend: '轻量推理', provider: 'DeepSeek', category: 'reasoning' },
  
  // xAI 系列 (29个)
  { id: 'grok-2', name: 'Grok-2', recommend: '实时知识', provider: 'xAI', category: 'chat' },
  { id: 'grok-2-mini', name: 'Grok-2 Mini', recommend: '快速响应', provider: 'xAI', category: 'chat' },
  { id: 'grok-beta', name: 'Grok Beta', recommend: '测试版本', provider: 'xAI', category: 'chat' },
  { id: 'grok-vision', name: 'Grok Vision', recommend: '视觉理解', provider: 'xAI', category: 'vision' },
  
  // Meta 系列 (3个)
  { id: 'llama-3-1-405b', name: 'Llama 3.1 405B', recommend: '开源旗舰', provider: 'Meta', category: 'chat' },
  { id: 'llama-3-1-70b', name: 'Llama 3.1 70B', recommend: '开源强项', provider: 'Meta', category: 'chat' },
  { id: 'llama-3-1-8b', name: 'Llama 3.1 8B', recommend: '开源轻量', provider: 'Meta', category: 'chat' },
  { id: 'llama-3-2-11b', name: 'Llama 3.2 11B', recommend: '视觉模型', provider: 'Meta', category: 'vision' },
  { id: 'llama-3-2-90b', name: 'Llama 3.2 90B', recommend: '视觉旗舰', provider: 'Meta', category: 'vision' },
  
  // Mistral 系列
  { id: 'mistral-large', name: 'Mistral Large', recommend: '欧洲旗舰', provider: 'Mistral', category: 'chat' },
  { id: 'mistral-7b', name: 'Mistral 7B', recommend: '开源经典', provider: 'Mistral', category: 'chat' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', recommend: '混合专家', provider: 'Mistral', category: 'chat' },
  
  // Moonshot (Kimi)
  { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', recommend: '长文本', provider: 'Moonshot', category: 'chat' },
  { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', recommend: '更长上下文', provider: 'Moonshot', category: 'chat' },
  { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', recommend: '超长上下文', provider: 'Moonshot', category: 'chat' },
  
  // 阿里云百炼
  { id: 'qwen-turbo', name: 'Qwen Turbo', recommend: '快速响应', provider: 'Alibaba', category: 'chat' },
  { id: 'qwen-plus', name: 'Qwen Plus', recommend: '增强性能', provider: 'Alibaba', category: 'chat' },
  { id: 'qwen-max', name: 'Qwen Max', recommend: '最强能力', provider: 'Alibaba', category: 'chat' },
  { id: 'qwen-vl-plus', name: 'Qwen VL Plus', recommend: '视觉增强', provider: 'Alibaba', category: 'vision' },
  { id: 'qwen2-72b', name: 'Qwen2 72B', recommend: '开源旗舰', provider: 'Alibaba', category: 'chat' },
  
  // 讯飞
  { id: 'spark-3.5', name: 'Spark 3.5', recommend: '中文优化', provider: '讯飞', category: 'chat' },
  { id: 'spark-4.0', name: 'Spark 4.0', recommend: '最新版本', provider: '讯飞', category: 'chat' },
  
  // Midjourney
  { id: 'midjourney', name: 'Midjourney', recommend: 'AI绘画', provider: 'Midjourney', category: 'image' },
  { id: 'midjourney-v6', name: 'Midjourney V6', recommend: '最新版本', provider: 'Midjourney', category: 'image' },
  { id: 'midjourney-niji', name: 'Midjourney Niji', recommend: '动漫风格', provider: 'Midjourney', category: 'image' },
  
  // Stability AI
  { id: 'stable-diffusion-xl', name: 'SD XL', recommend: '开源图像', provider: 'Stability', category: 'image' },
  { id: 'stable-diffusion-3', name: 'SD 3', recommend: '最新模型', provider: 'Stability', category: 'image' },
  
  // 其他
  { id: 'cohere-command', name: 'Command R+', recommend: '企业级', provider: 'Cohere', category: 'chat' },
  { id: 'perplexity-llm', name: 'Perplexity', recommend: '实时搜索', provider: 'Perplexity', category: 'chat' },
  { id: 'yi-large', name: 'Yi Large', recommend: '零一万物', provider: '零一万物', category: 'chat' },
  { id: 'yi-vision', name: 'Yi Vision', recommend: '视觉理解', provider: '零一万物', category: 'vision' },
  { id: 'baichuan4', name: 'Baichuan 4', recommend: '百川智能', provider: '百川', category: 'chat' },
  { id: 'minimax-01', name: 'MiniMax 01', recommend: '海螺AI', provider: 'MiniMax', category: 'chat' },
  { id: 'step-1v', name: 'Step-1V', recommend: '阶跃星辰', provider: '阶跃星辰', category: 'chat' },
  { id: 'internlm2-20b', name: 'InternLM2 20B', recommend: '书生模型', provider: '上海AI Lab', category: 'chat' },
];

// 模型分类
const CATEGORIES = [
  { id: 'all', name: '全部', icon: '🌐' },
  { id: 'chat', name: '对话', icon: '💬' },
  { id: 'vision', name: '视觉', icon: '👁️' },
  { id: 'image', name: '图像', icon: '🎨' },
  { id: 'audio', name: '音频', icon: '🔊' },
  { id: 'code', name: '编程', icon: '💻' },
  { id: 'reasoning', name: '推理', icon: '🧠' },
  { id: 'realtime', name: '实时', icon: '⚡' },
];

// 供应商统计
const PROVIDERS = [
  { id: 'all', name: '全部', count: MODELS.length },
  { id: 'OpenAI', name: 'OpenAI', count: MODELS.filter(m => m.provider === 'OpenAI').length, logo: '🤖' },
  { id: 'Anthropic', name: 'Anthropic', count: MODELS.filter(m => m.provider === 'Anthropic').length, logo: '🧠' },
  { id: 'Google', name: 'Google', count: MODELS.filter(m => m.provider === 'Google').length, logo: '🔴' },
  { id: 'DeepSeek', name: 'DeepSeek', count: MODELS.filter(m => m.provider === 'DeepSeek').length, logo: '🔵' },
  { id: 'xAI', name: 'xAI', count: MODELS.filter(m => m.provider === 'xAI').length, logo: '💀' },
  { id: 'Meta', name: 'Meta', count: MODELS.filter(m => m.provider === 'Meta').length, logo: '🦾' },
  { id: 'Moonshot', name: 'Moonshot', count: MODELS.filter(m => m.provider === 'Moonshot').length, logo: '🌙' },
  { id: 'Alibaba', name: '阿里巴巴', count: MODELS.filter(m => m.provider === 'Alibaba').length, logo: '🏢' },
  { id: 'Mistral', name: 'Mistral', count: MODELS.filter(m => m.provider === 'Mistral').length, logo: '🌫️' },
  { id: '讯飞', name: '讯飞', count: MODELS.filter(m => m.provider === '讯飞').length, logo: '🗣️' },
  { id: 'Midjourney', name: 'Midjourney', count: MODELS.filter(m => m.provider === 'Midjourney').length, logo: '🎨' },
  { id: 'Stability', name: 'Stability', count: MODELS.filter(m => m.provider === 'Stability').length, logo: '⚡' },
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
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modelSearch, setModelSearch] = useState('');
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
    if (!apiKey) {
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
      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[activeFeature] || '' },
            { role: 'user', content: inputText }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `请求失败 (${response.status})`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // 解析 SSE 格式的数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                result += content;
                setOutputText(result);
              }
            } catch { /* ignore parse errors */ }
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
          {/* 当前选中的模型 */}
          <button onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg">
            <span className="text-sm">
              <span className="font-medium">{currentModel?.name}</span>
              <span className="ml-2 text-xs text-slate-400">[{currentModel?.provider}]</span>
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {/* 模型选择弹窗 */}
          {showModelDropdown && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModelDropdown(false)}>
              <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* 头部 */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h3 className="font-semibold">选择模型</h3>
                  <button onClick={() => setShowModelDropdown(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                
                {/* 搜索框 */}
                <div className="px-4 py-3 border-b">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={e => setModelSearch(e.target.value)}
                    placeholder="搜索模型..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                {/* 分类筛选 */}
                <div className="px-4 py-3 border-b bg-blue-50">
                  <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                    <span>📂 模型分类</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {CATEGORIES.map(c => {
                      const count = MODELS.filter(m => m.category === c.id).length;
                      if (c.id !== 'all' && count === 0) return null;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCategory(c.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            selectedCategory === c.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white border hover:bg-blue-50'
                          }`}
                        >
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                          {c.id === 'all' && <span className={`text-xs ${selectedCategory === c.id ? 'text-white/70' : 'text-slate-400'}`}>{MODELS.length}</span>}
                          {c.id !== 'all' && <span className={`text-xs ${selectedCategory === c.id ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* 供应商筛选 */}
                <div className="px-4 py-3 border-b bg-slate-50">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                    <span>🏢 供应商</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap max-h-24 overflow-y-auto">
                    {PROVIDERS.map(p => {
                      const filteredModels = MODELS.filter(m => m.provider === p.id);
                      const categoryModels = selectedCategory === 'all' ? filteredModels : filteredModels.filter(m => m.category === selectedCategory);
                      if (p.id !== 'all' && categoryModels.length === 0) return null;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProvider(p.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedProvider === p.id 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-white border hover:bg-orange-50'
                          }`}
                        >
                          {p.logo && <span>{p.logo}</span>}
                          <span>{p.name}</span>
                          <span className={`text-xs ${selectedProvider === p.id ? 'text-white/70' : 'text-slate-400'}`}>{p.id === 'all' ? MODELS.length : categoryModels.length}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* 模型列表 */}
                <div className="p-4 max-h-[350px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {MODELS
                      .filter(m => (selectedCategory === 'all' || m.category === selectedCategory))
                      .filter(m => (selectedProvider === 'all' || m.provider === selectedProvider))
                      .filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.provider.toLowerCase().includes(modelSearch.toLowerCase()))
                      .map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); setModelSearch(''); }}
                          className={`text-left p-3 rounded-lg border transition-colors ${
                            selectedModel === m.id 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{m.name}</span>
                            {selectedModel === m.id && (
                              <span className="text-xs text-orange-500">✓</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span>{PROVIDERS.find(p => p.id === m.provider)?.logo || '🏢'}</span>
                              <span>{m.provider}</span>
                              <span>·</span>
                              <span>{CATEGORIES.find(c => c.id === m.category)?.icon}</span>
                              <span>{CATEGORIES.find(c => c.id === m.category)?.name}</span>
                            </span>
                          </div>
                          <div className="text-xs text-orange-500 mt-1">{m.recommend}</div>
                        </button>
                      ))}
                  </div>
                  
                  {/* 统计信息 */}
                  <div className="mt-4 pt-4 border-t text-xs text-slate-400 text-center">
                    共 {MODELS.filter(m => (selectedCategory === 'all' || m.category === selectedCategory)).filter(m => (selectedProvider === 'all' || m.provider === selectedProvider)).filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase())).length} 个模型
                  </div>
                </div>
              </div>
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
