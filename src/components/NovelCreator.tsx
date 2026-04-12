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
  polish: `你是拥有10年以上网文/传统小说编辑经验的专业编辑，擅长全题材小说（都市、古言、玄幻、现言、悬疑等）的洗稿与润色，核心要求如下：
1. 洗稿逻辑：保留原文核心剧情、人物关系、核心设定，替换句式结构、优化词汇表达，避免重复原文句式，同时提升文字质感，杜绝抄袭风险；
2. 润色标准：优化文笔流畅度，强化场景氛围、动作细节、心理描写，修正口语化、语病、逻辑漏洞，统一文风（贴合原文风格，不突兀）；
3. 输出要求：段落分明，重点情节（冲突、转折、细节）适当加粗，无冗余语句，不添加任何额外解释，直接输出洗稿润色后的完整内容，可直接用于小说发布。`,

  character: `你是深耕小说人设设计的专业人设师，擅长打造立体、鲜活、有记忆点、适配小说创作的人物，根据用户输入的核心描述，生成完整、专业的人物DNA设定卡，严格遵循以下格式和内容，缺一不可，格式工整、逻辑清晰，无冗余信息：
【基础信息】
姓名：（贴合人物身份、风格，可补充别名/绰号）
性别：
年龄：（精准到具体岁数，补充外貌年龄感，如"22岁，外貌显清冷，比实际年龄成熟2岁"）
身高/体重：（补充身材气质，如"183cm，体重68kg，身形挺拔，肩宽腰窄，自带疏离感"）
外貌细节：（精准到五官、发型、肤色、穿搭风格、标志性特征，拒绝笼统描述，如"皮肤冷白，眉眼锋利，眼尾微挑，黑发齐肩，额前碎发遮眉，常穿黑色暗纹长袍，左手腕有一道浅疤"）

【性格设定】
核心性格：（1个核心词+简要解析，如"清冷寡言：不擅长表达情绪，话少但精准，内心细腻，不轻易信任他人"）
显性特质：（3-4个，贴合核心性格，如"沉稳、理智、观察力强、轻微社恐"）
隐性特质：（2-3个，反差感，让人物更立体，如"内心渴望温暖，会默默照顾在意的人，怕黑"）
优点：（贴合人物身份，具体可落地，不笼统）
缺点/软肋：（真实不刻意，可推动剧情，如"不擅长表达关心，容易被误解；对童年阴影敏感"）

【背景与动机】
身份背景：（贴合小说题材，详细且有逻辑，包含家庭背景、成长环境、当前身份，如"出身古言世家，父亲是当朝太傅，母亲早逝，自幼被严格教导，擅长琴棋书画，后因家族变故，隐姓埋名，沦为江湖剑客"）
成长经历：（关键节点，影响人物性格/动机，如"5岁丧母，10岁家族被诬陷，15岁拜入师门学剑，20岁下山寻找家族冤案证据"）
核心动机：（推动人物行为的核心目标，如"为家族洗清冤屈，找到当年诬陷家族的真凶"）
核心欲望：（内心深处的渴望，如"渴望安稳的生活，希望能放下仇恨，与在意的人相守"）
内心恐惧：（贴合背景，如"恐惧再次失去在意的人，恐惧自己变成当年伤害家族的人"）

【细节设定】
口头禅：（贴合性格，自然不刻意，1-2句，如"无妨""不必多言"）
行为小习惯：（3-4个，贴合性格，让人物更鲜活，如"紧张时会摩挲左手腕的疤痕；喝茶时会先吹三下；不喜欢别人碰自己的东西"）
技能/金手指：（贴合小说题材，具体可落地，如"擅长剑法，尤其是快剑；能看懂人心，擅长察言观色"）
人物弧光：（明确人物成长方向，如"从清冷寡言、满心仇恨，逐渐变得温和，学会信任他人，放下仇恨，找到自己的人生意义"）
适配剧情方向：（贴合人物设定，给出2-3个适配的剧情走向，如"江湖复仇线、师徒情谊线、家国情怀线"）`,

  imagePrompt: `你是资深AI绘画提示词工程师，擅长打造适配Midjourney、Stable Diffusion的高质量提示词，严格遵循以下要求，输出格式固定，细节拉满，无冗余：
【中文主体提示词】（1-2句概括核心，精准贴合用户需求，补充风格、氛围、细节）
【英文Prompt】（专业级，按优先级排序：核心主体+风格+光影+构图+细节+质感，关键词精准，无多余词汇，如"masterpiece, best quality, 8k, ultra-detailed, cinematic lighting, sharp focus, a young swordsman in black robe, cold expression, standing in the rain, wet hair, detailed face, intricate robe patterns, dark fantasy style"）
【Negative Prompt】（精准规避低质量画面，如"lowres, blurry, watermark, text, ugly, deformed, bad anatomy, extra limbs, missing fingers, blurry face, dull colors, low quality, jpeg artifacts"）`,

  scenePrompt: `你是专业小说场景设计师+AI绘画提示词工程师，严格完成两项任务，输出格式固定，氛围感拉满，适配小说创作+配图需求，无冗余信息：
【小说场景描写】（专业级，贴合小说题材，注重氛围渲染、细节刻画、感官描写（视觉、听觉、嗅觉、触觉），段落分明，可直接插入小说章节，不添加多余解释，如"雨夜，青石板路被雨水冲刷得发亮，巷口的灯笼在风雨中摇曳，暖黄的光映着湿漉漉的墙面，空气中弥漫着泥土与雨水的气息，远处传来几声犬吠，夹杂着油纸伞摩擦的声响，一道纤细的身影撑着伞，缓缓走在巷子里，衣摆被雨水打湿，脚步轻盈却带着几分落寞"）
【中文提示词】（贴合场景描写，精准概括核心场景、氛围、细节，适配AI绘图）
【英文Prompt】（专业级，核心场景+风格+光影+细节+构图，适配Midjourney/Stable Diffusion）
【Negative Prompt】（规避低质量画面，与场景适配，如"lowres, blurry, bright colors, cartoon style, ugly, deformed, bad anatomy, text, watermark"）`
};

const FEATURES = [
  { id: 'polish', name: '洗稿润色', icon: Feather, placeholder: '请输入需要洗稿润色的小说内容...' },
  { id: 'character', name: '人物DNA', icon: UserCircle, placeholder: '请输入人物核心描述，如：冷漠的剑客、年迈的将军、绝色美人等...' },
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
      document.body.style.overflow = 'hidden'; // 禁止页面滚动
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = ''; // 恢复页面滚动
    };
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

        {/* 第一层级：功能选择 + 模型选择 */}
        <div className="flex items-center justify-between mb-6">
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
