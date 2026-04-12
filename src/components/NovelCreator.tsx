'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download,
  Feather, UserCircle, ImagePlus, Mountain, ChevronDown, X
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
}

// 厂商配置
const PROVIDERS = [
  { id: 'doubao', name: '豆包', color: 'bg-red-500', textColor: 'text-white' },
  { id: 'deepseek', name: 'DeepSeek', color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'kimi', name: 'Kimi', color: 'bg-yellow-400', textColor: 'text-slate-800' },
  { id: 'glm', name: '智谱GLM', color: 'bg-gradient-to-r from-blue-500 via-green-500 to-red-500', textColor: 'text-white' },
  { id: 'qwen', name: '通义Qwen', color: 'bg-orange-500', textColor: 'text-white' },
  { id: 'minimax', name: 'MiniMax', color: 'bg-yellow-500', textColor: 'text-slate-800' },
  { id: 'openai', name: 'OpenAI', color: 'bg-slate-700', textColor: 'text-white' },
  { id: 'anthropic', name: 'Anthropic', color: 'bg-pink-500', textColor: 'text-white' },
  { id: 'google', name: 'Google', color: 'bg-red-500', textColor: 'text-white' },
  { id: 'xai', name: 'xAI', color: 'bg-white', textColor: 'text-slate-700', border: true },
  { id: 'stability', name: 'Stability', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500', textColor: 'text-white' },
  { id: 'other', name: '其他', color: 'bg-slate-400', textColor: 'text-white' },
];

const getModelFilter = (providerId: string) => {
  switch (providerId) {
    case 'doubao': return (m: any) => m.name.includes('豆包') || m.id.includes('doubao') || m.id.includes('seed');
    case 'deepseek': return (m: any) => m.name.includes('DeepSeek') || m.id.includes('deepseek');
    case 'kimi': return (m: any) => m.name.includes('Kimi') || m.id.includes('kimi');
    case 'glm': return (m: any) => m.name.includes('GLM') || m.id.includes('glm');
    case 'qwen': return (m: any) => m.name.includes('Qwen') || m.id.includes('qwen');
    case 'minimax': return (m: any) => m.name.includes('MiniMax') || m.id.includes('minimax');
    case 'openai': return (m: any) => m.id.includes('gpt') || m.id.includes('dall') || m.id.includes('whisper') || m.id.includes('tts') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4') || m.id.includes('chatgpt');
    case 'anthropic': return (m: any) => m.id.includes('claude');
    case 'google': return (m: any) => m.id.includes('gemini') || m.id.includes('veo') || m.id.includes('imagen');
    case 'xai': return (m: any) => m.id.includes('grok');
    case 'stability': return (m: any) => m.id.includes('flux') || m.id.includes('stability');
    default: return () => true;
  }
};

export default function NovelCreator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('polish');
  const [selectedModel, setSelectedModel] = useState('doubao-seed-2-0-pro-260215');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelProvider, setModelProvider] = useState('doubao');
  const [modelSearch, setModelSearch] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const rateLimiter = new RateLimiter(RATE_LIMIT_MAX);
  
  const currentFeature = FEATURES.find(f => f.id === selectedFeature);
  const currentModel = availableModels.find(m => m.id === selectedModel) || { 
    id: 'doubao-seed-2-0-pro-260215', 
    name: '豆包 Seed Pro', 
    provider: '豆包',
    isFree: true 
  };
  
  const currentProviderModels = availableModels.filter(m => getModelFilter(modelProvider)(m));
  const filteredModels = modelSearch 
    ? currentProviderModels.filter(m => 
        m.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
        m.id.toLowerCase().includes(modelSearch.toLowerCase())
      )
    : currentProviderModels;

  const closePicker = () => {
    setShowModelPicker(false);
    setModelSearch('');
  };

  const handleSelectModel = (model: any) => {
    setSelectedModel(model.id);
    closePicker();
  };

  useEffect(() => {
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.model-picker-container') && !target.closest('.model-trigger')) {
        setShowModelPicker(false);
      }
    };
    if (showModelPicker) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showModelPicker]);

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
              const content = parsed.choices?.[0]?.delta?.content || parsed.content;
              if (content) {
                result += typeof content === 'string' ? content : content.toString();
                setOutputText(result);
              }
            } catch { /* ignore parse errors */ }
          } else if (isCozeModel) {
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

  const getProviderConfig = (providerName: string) => {
    const found = PROVIDERS.find(p => 
      providerName.includes(p.name) || 
      (p.name === '豆包' && providerName.includes('Coze'))
    );
    return found || PROVIDERS[11];
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* 第一层级：功能选择 + 模型选择 - 独立一行 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* 功能选择 - 左侧 */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1">
                {FEATURES.map(f => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFeature(f.id)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedFeature === f.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                          : 'text-slate-600 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 模型选择 - 右侧 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModelPicker(!showModelPicker);
                }}
                className="model-trigger flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors"
              >
                <span className="text-sm font-medium text-slate-500">当前模型：</span>
                {(() => {
                  const providerConfig = getProviderConfig(currentModel.provider || '豆包');
                  return (
                    <span className={`w-6 h-6 rounded-full ${providerConfig.color} ${providerConfig.border ? 'border border-slate-300' : ''} ${providerConfig.textColor} flex items-center justify-center text-[10px] font-bold`}>
                      {(currentModel.provider || '豆包').charAt(0)}
                    </span>
                  );
                })()}
                <span className="font-medium text-slate-700">
                  {currentModel.name || '豆包 Seed Pro'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {/* 模型选择弹框 */}
              {showModelPicker && (
                <div 
                  className="model-picker-container absolute top-full right-0 mt-3 w-[400px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b border-slate-100">
                    <input
                      type="text"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="搜索模型名称或ID..."
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                      autoFocus
                    />
                  </div>
                  
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex gap-2 flex-wrap">
                      {PROVIDERS.map(p => {
                        const count = availableModels.filter(m => getModelFilter(p.id)(m)).length;
                        if (count === 0 && p.id !== 'doubao') return null;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setModelProvider(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              modelProvider === p.id
                                ? `${p.color} ${p.border ? 'border border-slate-300' : ''} ${p.textColor}`
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {p.name} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {filteredModels.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {filteredModels.slice(0, 60).map(m => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectModel(m)}
                            className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between gap-3 ${
                              selectedModel === m.id
                                ? 'bg-orange-100 border border-orange-500'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{m.name}</div>
                              <div className="text-xs text-slate-400 truncate">{m.id}</div>
                            </div>
                            {selectedModel === m.id && (
                              <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            )}
                            {m.isFree && (
                              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-600 rounded-full">免费</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-400">
                        暂无可用模型
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={closePicker}
                    className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 第二层级：输入 + 输出区域 */}
        <div className="flex gap-6 h-[600px]">
          {/* 左侧：输入 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <h3 className="font-semibold text-lg mb-4">{currentFeature?.name}</h3>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentFeature?.placeholder}
              className="flex-1 w-full p-4 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-orange-500 transition-colors text-base leading-relaxed"
            />
            
            <div className="mt-4 flex items-center gap-4">
              {isLoading ? (
                <button
                  onClick={cancelRequest}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 font-medium"
                >
                  <AlertCircle className="w-5 h-5" />
                  取消生成
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim()}
                  className="px-10 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-lg"
                >
                  <Send className="w-5 h-5" />
                  开始生成
                </button>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：输出 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">生成结果</h3>
              {outputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <textarea
                value={outputText}
                readOnly
                placeholder="生成的内容将显示在这里..."
                className="w-full h-full p-4 border-2 border-slate-200 rounded-xl resize-none bg-slate-50 text-base leading-relaxed"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
                    <p className="mt-4 text-base text-slate-600">正在生成...</p>
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
