'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download,
  Feather, UserCircle, ImagePlus, Mountain
} from 'lucide-react';

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

export default function NovelCreator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('polish');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [modelProvider, setModelProvider] = useState('doubao');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const rateLimiter = new RateLimiter(RATE_LIMIT_MAX);
  
  const currentFeature = FEATURES.find(f => f.id === selectedFeature);
  
  // 厂商列表（带品牌色）
  const providers = [
    { id: 'doubao', name: '豆包', color: 'bg-red-500', filter: (m: any) => m.name.includes('豆包') || m.id.includes('doubao') || m.id.includes('seed') },
    { id: 'deepseek', name: 'DeepSeek', color: 'bg-blue-600', filter: (m: any) => m.name.includes('DeepSeek') || m.id.includes('deepseek') },
    { id: 'kimi', name: 'Kimi', color: 'bg-yellow-400', filter: (m: any) => m.name.includes('Kimi') || m.id.includes('kimi') },
    { id: 'glm', name: '智谱GLM', color: 'bg-gradient-to-r from-blue-500 via-green-500 to-red-500', filter: (m: any) => m.name.includes('GLM') || m.id.includes('glm') },
    { id: 'qwen', name: '通义Qwen', color: 'bg-orange-500', filter: (m: any) => m.name.includes('Qwen') || m.id.includes('qwen') },
    { id: 'minimax', name: 'MiniMax', color: 'bg-yellow-500', filter: (m: any) => m.name.includes('MiniMax') || m.id.includes('minimax') },
    { id: 'openai', name: 'OpenAI', color: 'bg-slate-700', filter: (m: any) => m.provider === 'OpenAI' || m.id.includes('gpt') || m.id.includes('dall') || m.id.includes('whisper') || m.id.includes('tts') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4') },
    { id: 'anthropic', name: 'Anthropic', color: 'bg-pink-500', filter: (m: any) => m.provider === 'Anthropic' || m.id.includes('claude') },
    { id: 'google', name: 'Google', color: 'bg-red-500', filter: (m: any) => m.provider === 'Google' || m.id.includes('gemini') || m.id.includes('veo') },
    { id: 'xai', name: 'xAI', color: 'bg-white border border-slate-300', textColor: 'text-slate-700', filter: (m: any) => m.provider === 'xAI' || m.id.includes('grok') },
    { id: 'stability', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500', name: 'Stability', filter: (m: any) => m.id.includes('flux') || m.id.includes('stability') },
    { id: 'other', name: '其他', color: 'bg-slate-400', filter: (m: any) => !['OpenAI', 'Anthropic', 'Google', 'xAI'].includes(m.provider) && !m.id.includes('gpt') && !m.id.includes('dall') && !m.id.includes('whisper') && !m.id.includes('tts') && !m.id.includes('o1') && !m.id.includes('o3') && !m.id.includes('o4') && !m.id.includes('claude') && !m.id.includes('gemini') && !m.id.includes('veo') && !m.id.includes('grok') && !m.id.includes('flux') && !m.id.includes('stability') && !m.name.includes('豆包') && !m.id.includes('doubao') && !m.id.includes('seed') && !m.name.includes('DeepSeek') && !m.id.includes('deepseek') && !m.name.includes('Kimi') && !m.id.includes('kimi') && !m.name.includes('GLM') && !m.id.includes('glm') && !m.name.includes('Qwen') && !m.id.includes('qwen') && !m.name.includes('MiniMax') && !m.id.includes('minimax') },
  ];
  const currentProviderModels = availableModels.filter(m => providers.find(p => p.id === modelProvider)?.filter(m));

  useEffect(() => {
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
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-1">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              AI 小说创作助手
            </span>
          </h2>
          <p className="text-sm text-slate-500">基于 4sapi 213+ 优质模型，让创作更轻松</p>
        </div>

        {/* 功能选择 + 模型选择 - 顶部 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          {/* 功能选择 */}
          <div className="mb-4">
            <div className="flex gap-2">
              {FEATURES.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeature(f.id)}
                    className={`flex-1 p-2.5 rounded-xl transition-all flex flex-col items-center gap-1.5 ${
                      selectedFeature === f.id
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selectedFeature === f.id ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`font-medium text-xs ${selectedFeature === f.id ? 'text-white' : 'text-slate-700'}`}>
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 模型选择 */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-600 mb-2">选择模型</label>
            
            {/* 厂商标签页 */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {providers.map(p => {
                const count = availableModels.filter(m => p.filter(m)).length;
                if (count === 0) return null;
                return (
                  <button
                    key={p.id}
                    onClick={() => setModelProvider(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      modelProvider === p.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${p.color} ${p.textColor || 'text-white'} flex items-center justify-center text-[8px] font-bold`}>
                      {p.name.charAt(0)}
                    </span>
                    <span>{p.name}</span>
                    <span className={`text-[10px] ${modelProvider === p.id ? 'text-white/80' : 'text-slate-400'}`}>({count})</span>
                  </button>
                );
              })}
            </div>
            
            {/* 模型平铺展示 */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 max-h-24 overflow-y-auto p-1">
              {currentProviderModels.slice(0, 30).map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-2 rounded-lg text-left transition-all ${
                    selectedModel === m.id
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <div className="font-medium text-[11px] truncate">{m.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 下方左右分栏：输入 + 输出 */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* 左侧：输入 */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-semibold text-sm mb-3">{currentFeature?.name} - 输入内容</h3>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentFeature?.placeholder}
              className="w-full h-48 p-3 border-2 rounded-xl resize-none focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
            
            <div className="mt-3 flex gap-2">
              {isLoading ? (
                <button
                  onClick={cancelRequest}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center gap-2 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  取消生成
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  开始生成
                </button>
              )}
            </div>

            {error && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
          </div>

          {/* 右侧：输出 */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">生成结果</h3>
              {outputText && (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs border rounded-lg hover:bg-slate-50 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 text-xs border rounded-lg hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
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
                className="w-full h-48 p-3 border-2 rounded-xl resize-none bg-slate-50 text-sm"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                    <p className="mt-1.5 text-xs text-slate-600">正在生成...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
