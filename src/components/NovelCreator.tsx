'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download, FileSpreadsheet,
  Feather, UserCircle, ImagePlus, Mountain, ChevronDown, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import LoginButton from '@/components/LoginButton';

const REQUEST_TIMEOUT = 60000;
const RATE_LIMIT_MAX = 10;

const SYSTEM_PROMPTS: Record<string, string> = {
  polish: `你是拥有10年以上网文/传统小说编辑经验的专业编辑，擅长全题材小说（都市、古言、玄幻、现言、悬疑等）的洗稿与润色，核心要求如下：
1. 洗稿逻辑：保留原文核心剧情、人物关系、核心设定，替换句式结构、优化词汇表达，避免重复原文句式，同时提升文字质感，杜绝抄袭风险；
2. 润色标准：优化文笔流畅度，强化场景氛围、动作细节、心理描写，修正口语化、语病、逻辑漏洞，统一文风（贴合原文风格，不突兀）；
3. 输出要求：段落分明，重点情节（冲突、转折、细节）适当加粗，无冗余语句，不添加任何额外解释，直接输出洗稿润色后的完整内容，可直接用于小说发布。`,

  character: `你是专业的AI绘画提示词生成师，根据用户输入的小说人物描写，生成专业的人物AI绘画提示词。

**输出格式（必须严格按此格式输出）：**

核心人物：[人物定位，如"绝色古风美男"]
1.人物特征:[身材描述]
2.人物特写:[特写类型]
3.人物脸部:[脸型描述]
4.风格:[CG风格]

外貌：[整体外貌描述]
1.头发:[发型描述]
2.眉毛:[眉形描述]
3.眼睛:[眼型描述]
4.鼻子:[鼻型描述]
5.嘴唇:[唇型描述]
6.皮肤:[肤色描述]
7.妆造:[妆容描述]

服饰：[服饰描述]
场景：[场景设定]
画面感：[氛围描述]
画质：[画质要求]
构图：[构图要求]
画面为人物三视图：[三视图描述]
最左侧单独放大头部细节展示

**重要：**
1. 严格按照上述格式输出，每一项都要有内容
2. 如果是多个人物，每个人之间用"========"分隔
3. 不要添加任何额外解释或说明
4. 风格要与小说一致（古风/现代/奇幻等）`,

  imagePrompt: `你是资深AI绘画提示词工程师，擅长打造适配Midjourney、Stable Diffusion的高质量提示词，严格遵循以下要求，输出格式固定，细节拉满，无冗余：
【中文主体提示词】（1-2句概括核心，精准贴合用户需求，补充风格、氛围、细节）
【英文Prompt】（专业级，按优先级排序：核心主体+风格+光影+构图+细节+质感，关键词精准，无多余词汇）
【Negative Prompt】（精准规避低质量画面，如"lowres, blurry, watermark, text, ugly, deformed, bad anatomy"）`,

  scenePrompt: `你是专业小说场景设计师+AI绘画提示词工程师，严格完成两项任务，输出格式固定，氛围感拉满，适配小说创作+配图需求，无冗余信息：
【小说场景描写】（专业级，贴合小说题材，注重氛围渲染、细节刻画、感官描写，段落分明，可直接插入小说章节）
【中文提示词】（贴合场景描写，精准概括核心场景、氛围、细节）
【英文Prompt】（专业级，核心场景+风格+光影+细节+构图）
【Negative Prompt】（规避低质量画面）`
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
    case 'openai': return (m: any) => m.id.includes('gpt') || m.id.includes('dall') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4') || m.id.includes('chatgpt');
    case 'anthropic': return (m: any) => m.id.includes('claude');
    case 'google': return (m: any) => m.id.includes('gemini') || m.id.includes('veo') || m.id.includes('imagen');
    case 'xai': return (m: any) => m.id.includes('grok');
    case 'stability': return (m: any) => m.id.includes('flux') || m.id.includes('stability');
    default: return () => true;
  }
};

// 解析人物DNA输出为结构化数据
function parseCharacterDNA(text: string) {
  const characters: any[] = [];
  const sections = text.split(/========+/).filter(s => s.trim());
  
  sections.forEach((section, index) => {
    const lines = section.split('\n');
    const char: any = {
      序号: index + 1,
      核心人物: '',
      '人物特征': '',
      '人物特写': '',
      '人物脸部': '',
      '风格': '',
      '外貌': '',
      '头发': '',
      '眉毛': '',
      '眼睛': '',
      '鼻子': '',
      '嘴唇': '',
      '皮肤': '',
      '妆造': '',
      '服饰': '',
      '场景': '',
      '画面感': '',
      '画质': '',
      '构图': '',
      '三视图': '',
      '头部细节': ''
    };
    
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('核心人物：')) char.核心人物 = line.replace('核心人物：', '').trim();
      else if (line.match(/^1\.人物特征/)) char['人物特征'] = line.replace(/^1\.人物特征[：:]/, '').trim();
      else if (line.match(/^2\.人物特写/)) char['人物特写'] = line.replace(/^2\.人物特写[：:]/, '').trim();
      else if (line.match(/^3\.人物脸部/)) char['人物脸部'] = line.replace(/^3\.人物脸部[：:]/, '').trim();
      else if (line.match(/^4\.风格/)) char['风格'] = line.replace(/^4\.风格[：:]/, '').trim();
      else if (line.startsWith('外貌：')) char['外貌'] = line.replace('外貌：', '').trim();
      else if (line.match(/^1\.头发/)) char['头发'] = line.replace(/^1\.头发[：:]/, '').trim();
      else if (line.match(/^2\.眉毛/)) char['眉毛'] = line.replace(/^2\.眉毛[：:]/, '').trim();
      else if (line.match(/^3\.眼睛/)) char['眼睛'] = line.replace(/^3\.眼睛[：:]/, '').trim();
      else if (line.match(/^4\.鼻子/)) char['鼻子'] = line.replace(/^4\.鼻子[：:]/, '').trim();
      else if (line.match(/^5\.嘴唇/)) char['嘴唇'] = line.replace(/^5\.嘴唇[：:]/, '').trim();
      else if (line.match(/^6\.皮肤/)) char['皮肤'] = line.replace(/^6\.皮肤[：:]/, '').trim();
      else if (line.match(/^7\.妆造/)) char['妆造'] = line.replace(/^7\.妆造[：:]/, '').trim();
      else if (line.startsWith('服饰：')) char['服饰'] = line.replace('服饰：', '').trim();
      else if (line.startsWith('场景：')) char['场景'] = line.replace('场景：', '').trim();
      else if (line.startsWith('画面感：')) char['画面感'] = line.replace('画面感：', '').trim();
      else if (line.startsWith('画质：')) char['画质'] = line.replace('画质：', '').trim();
      else if (line.startsWith('构图：')) char['构图'] = line.replace('构图：', '').trim();
      else if (line.includes('三视图')) char['三视图'] = line.trim();
      else if (line.includes('头部细节')) char['头部细节'] = line.trim();
    });
    
    if (char.核心人物 || char['人物特征']) {
      characters.push(char);
    }
  });
  
  return characters;
}

// 导出为Excel
function exportToExcel(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '人物DNA');
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 8 },   // 序号
    { wch: 20 },  // 核心人物
    { wch: 20 },  // 人物特征
    { wch: 15 },  // 人物特写
    { wch: 15 },  // 人物脸部
    { wch: 25 },  // 风格
    { wch: 30 },  // 外貌
    { wch: 25 },  // 头发
    { wch: 15 },  // 眉毛
    { wch: 25 },  // 眼睛
    { wch: 15 },  // 鼻子
    { wch: 15 },  // 嘴唇
    { wch: 20 },  // 皮肤
    { wch: 15 },  // 妆造
    { wch: 25 },  // 服饰
    { wch: 15 },  // 场景
    { wch: 30 },  // 画面感
    { wch: 30 },  // 画质
    { wch: 20 },  // 构图
    { wch: 40 },  // 三视图
    { wch: 40 },  // 头部细节
  ];
  
  XLSX.writeFile(wb, filename);
}

export default function NovelCreator() {
  // 每个功能的独立状态（包括loading和error）
  const [featureStates, setFeatureStates] = useState<Record<string, { input: string; output: string; loading: boolean; error: string }>>({
    polish: { input: '', output: '', loading: false, error: '' },
    character: { input: '', output: '', loading: false, error: '' },
    imagePrompt: { input: '', output: '', loading: false, error: '' },
    scenePrompt: { input: '', output: '', loading: false, error: '' },
  });
  const [selectedFeature, setSelectedFeature] = useState('polish');
  
  // 获取当前功能的输入输出
  const currentInput = featureStates[selectedFeature]?.input || '';
  const currentOutput = featureStates[selectedFeature]?.output || '';
  const currentLoading = featureStates[selectedFeature]?.loading || false;
  const currentError = featureStates[selectedFeature]?.error || '';
  
  const setCurrentInput = (value: string) => {
    setFeatureStates(prev => ({
      ...prev,
      [selectedFeature]: { ...prev[selectedFeature], input: value }
    }));
  };
  
  const setCurrentOutput = (value: string) => {
    setFeatureStates(prev => ({
      ...prev,
      [selectedFeature]: { ...prev[selectedFeature], output: value }
    }));
  };
  
  const setCurrentLoading = (loading: boolean) => {
    setFeatureStates(prev => ({
      ...prev,
      [selectedFeature]: { ...prev[selectedFeature], loading }
    }));
  };
  
  const setCurrentError = (error: string) => {
    setFeatureStates(prev => ({
      ...prev,
      [selectedFeature]: { ...prev[selectedFeature], error }
    }));
  };
  
  // 每个功能独立的AbortController
  const abortControllersRef = useRef<Record<string, AbortController | null>>({
    polish: null,
    character: null,
    imagePrompt: null,
    scenePrompt: null,
  });
  
  const [selectedModel, setSelectedModel] = useState('doubao-seed-2-0-pro-260215');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelProvider, setModelProvider] = useState('doubao');
  const [modelSearch, setModelSearch] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportError, setExportError] = useState('');
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
      if (!target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };
    if (showModelPicker || showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showModelPicker, showExportMenu]);

  const cancelRequest = useCallback(() => {
    if (abortControllersRef.current[selectedFeature]) {
      abortControllersRef.current[selectedFeature]?.abort();
      abortControllersRef.current[selectedFeature] = null;
    }
    setCurrentLoading(false);
  }, [selectedFeature, setCurrentLoading]);

  const handleSubmit = async () => {
    if (!currentInput.trim()) {
      setCurrentError('请输入内容');
      return;
    }
    
    if (!rateLimiter.canMakeRequest()) {
      setCurrentError('请求过于频繁，请稍后重试');
      return;
    }

    rateLimiter.addRequest();
    setCurrentError('');
    setCurrentOutput('');
    setCurrentLoading(true);

    const abortController = new AbortController();
    abortControllersRef.current[selectedFeature] = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, REQUEST_TIMEOUT);

    try {
      // 统一调用后端 API（后端处理 4sapi 密钥）
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[selectedFeature] || '' },
            { role: 'user', content: currentInput }
          ],
          feature: selectedFeature,
          stream: true
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败 (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // 流式输出直接追加
        result += chunk;
        setCurrentOutput(result);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setCurrentError('请求超时');
      } else {
        setCurrentError(err.message || '生成失败');
      }
    } finally {
      setCurrentLoading(false);
      abortControllersRef.current[selectedFeature] = null;
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novel_${selectedFeature}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 导出为Excel
  const handleExportExcel = () => {
    const characters = parseCharacterDNA(currentOutput);
    if (characters.length === 0) {
      setExportError('暂无人物数据可导出');
      return;
    }
    exportToExcel(characters, `人物DNA_${Date.now()}.xlsx`);
    setShowExportMenu(false);
  };

  const getProviderConfig = (providerName: string) => {
    const found = PROVIDERS.find(p => 
      providerName.includes(p.name) || 
      (p.name === '豆包' && providerName.includes('Coze'))
    );
    return found || PROVIDERS[11];
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 min-h-screen">
      {/* 顶部品牌栏 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：应用 Logo + 网站 Logo */}
            <div className="flex items-center gap-4">
              {/* 网站 Logo */}
              <div className="flex items-center gap-2">
                <div className="text-2xl">🦞</div>
                <span className="font-bold text-lg text-slate-800">OneClaw</span>
              </div>
              
              {/* 分隔线 */}
              <div className="hidden sm:block w-px h-6 bg-slate-200" />
              
              {/* 应用 Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Feather className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-700">小说创作</span>
              </div>
            </div>
            
            {/* 右侧：用户信息或登录 */}
            <div className="flex items-center gap-3">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* 第一层级：功能选择 + 模型选择 */}
        <div className="flex items-center justify-between mb-6">
          {/* 功能选择 - 移动端可横向滚动 */}
          <div className="flex-none">
            <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1 overflow-x-auto scrollbar-hide">
              {FEATURES.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeature(f.id)}
                    className={`px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                      selectedFeature === f.id
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* 模型选择 */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModelPicker(!showModelPicker);
              }}
              className="model-trigger flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="hidden sm:inline text-sm font-medium text-slate-500">当前模型：</span>
              {(() => {
                const providerConfig = getProviderConfig(currentModel.provider || '豆包');
                return (
                  <span className={`w-6 h-6 rounded-full ${providerConfig.color} ${providerConfig.border ? 'border border-slate-300' : ''} ${providerConfig.textColor} flex items-center justify-center text-[10px] font-bold`}>
                    {(currentModel.provider || '豆包').charAt(0)}
                  </span>
                );
              })()}
              <span className="font-medium text-slate-700 hidden sm:inline">
                {currentModel.name || '豆包 Seed Pro'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            {/* 模型选择弹框 */}
            {showModelPicker && (
              <div 
                className="model-picker-container absolute top-full left-0 sm:left-0 mt-3 w-80 sm:w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="搜索模型名称或ID..."
                    className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                  <button
                    onClick={closePicker}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
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
              </div>
            )}
          </div>
        </div>

        {/* 第二层级：输入 + 输出区域 - 移动端垂直布局 */}
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[600px]">
          {/* 左侧：输入 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col min-h-[300px] lg:min-h-0">
            <h3 className="font-semibold text-lg mb-3 sm:mb-4">{currentFeature?.name}</h3>
            
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentFeature?.placeholder}
              className="flex-1 w-full p-3 sm:p-4 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-orange-500 transition-colors text-base leading-relaxed placeholder:text-slate-400 bg-white"
            />
            
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {currentLoading ? (
                <button
                  onClick={cancelRequest}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center gap-2 font-medium"
                >
                  <AlertCircle className="w-5 h-5" />
                  取消生成
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!currentInput.trim()}
                  className="px-6 sm:px-10 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-base sm:text-lg"
                >
                  <Send className="w-5 h-5" />
                  开始生成
                </button>
              )}
              
              {currentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{currentError}</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：输出 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col min-h-[300px] lg:min-h-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-lg">生成结果</h3>
              {currentOutput && (
                <div className="flex gap-2 relative">
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
                  {/* Excel导出按钮 - 仅人物DNA功能显示 */}
                  {selectedFeature === 'character' && (
                    <div className="relative export-menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowExportMenu(!showExportMenu);
                        }}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 bg-green-50"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        导出Excel
                      </button>
                      {showExportMenu && (
                        <div 
                          className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={handleExportExcel}
                            className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 flex items-center gap-2"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            导出为 Excel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <textarea
                value={currentOutput}
                readOnly
                placeholder="生成的内容将显示在这里..."
                className="w-full h-full p-3 sm:p-4 border-2 border-slate-200 rounded-xl resize-none bg-slate-50 text-base leading-relaxed"
              />
              {currentLoading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-10 sm:w-12 h-10 sm:h-12 animate-spin text-orange-500 mx-auto" />
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
