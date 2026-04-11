'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Wand2, User, ImageIcon, BookOpen, 
  Send, Trash2, Copy, Download, 
  Check, Loader2, AlertCircle, X,
  ChevronDown, Sparkles, Feather, UserCircle, ImagePlus, Mountain
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';

// ============================================================
// API 配置 - 请替换为你的 API2D Key
// ============================================================
const API2D_KEY = '';  // 请在这里填入你的 API2D Key，或通过环境变量 NEXT_PUBLIC_API2D_KEY 提供
const API_BASE_URL = 'https://oa.api2d.net/v1';

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 30000;

// 请求频率限制：1分钟最多5次
const RATE_LIMIT_WINDOW = 60000; // 1分钟
const RATE_LIMIT_MAX = 5;

// ============================================================
// 专业提示词 - 不可修改
// ============================================================

// 小说洗稿/润色改写
const SYSTEM_PROMPTS = {
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

// 功能配置
const FEATURES = [
  { 
    id: 'polish', 
    name: '小说洗稿/润色', 
    icon: Feather,
    placeholder: '请输入需要洗稿/润色的原文内容...',
    description: '专业级文字优化'
  },
  { 
    id: 'character', 
    name: '生成人物DNA', 
    icon: UserCircle,
    placeholder: '请输入人物核心描述，如：冷漠的剑客、年迈的将军、腹黑的皇子等...',
    description: '专业小说人设卡'
  },
  { 
    id: 'imagePrompt', 
    name: 'AI绘画提示词', 
    icon: ImagePlus,
    placeholder: '请描述你想要的画面，如：一个古风剑客站在悬崖边...',
    description: '中英双语提示词'
  },
  { 
    id: 'scenePrompt', 
    name: '场景描写+绘图', 
    icon: Mountain,
    placeholder: '请描述场景，如：雨夜的江南小镇、荒废的古庙、繁华的集市等...',
    description: '场景描写+绘图提示词'
  }
];

// 模型配置
const MODELS = [
  { 
    id: 'claude-3-5-sonnet-20241022', 
    name: 'Claude 3.5 Sonnet', 
    desc: '写作最强',
    recommend: '洗稿/人物DNA'
  },
  { 
    id: 'gemini-1.5-pro', 
    name: 'Gemini 1.5 Pro', 
    desc: '长文本专业',
    recommend: '长篇内容/场景'
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    desc: '综合全能',
    recommend: '绘画提示词'
  }
];

// ============================================================
// 请求频率限制管理器
// ============================================================
class RateLimiter {
  private requests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    // 清理过期的请求记录
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    return this.requests.length < RATE_LIMIT_MAX;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    return RATE_LIMIT_MAX - this.requests.length;
  }

  getResetTime(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.ceil((oldestRequest + RATE_LIMIT_WINDOW - now) / 1000);
  }

  addRequest(): void {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

export default function NovelPage() {
  // 状态
  const [activeFeature, setActiveFeature] = useState('polish');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');

  const outputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 获取 API Key
  const getApiKey = useCallback((): string => {
    // 优先使用环境变量
    if (process.env.NEXT_PUBLIC_API2D_KEY) {
      return process.env.NEXT_PUBLIC_API2D_KEY;
    }
    // 回退到本地配置
    return API2D_KEY;
  }, []);

  // 记住用户选择的模型
  useEffect(() => {
    const saved = localStorage.getItem('novel-model');
    if (saved && MODELS.find(m => m.id === saved)) {
      setSelectedModel(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('novel-model', selectedModel);
  }, [selectedModel]);

  // 取消请求
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // 提交处理 - 纯前端直接调用 API2D
  const handleSubmit = useCallback(async () => {
    // 输入验证
    if (!inputText.trim()) {
      setError('请输入内容');
      return;
    }

    // API Key 检查
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('API Key 未配置，请联系网站管理员配置 API2D Key');
      return;
    }

    // 频率限制检查
    if (!rateLimiter.canMakeRequest()) {
      const resetTime = rateLimiter.getResetTime();
      setRateLimitError(`请求过于频繁，请在 ${resetTime} 秒后重试`);
      setTimeout(() => setRateLimitError(''), resetTime * 1000);
      return;
    }

    // 重置状态
    setError('');
    setRateLimitError('');
    setIsLoading(true);
    setOutputText('');

    // 添加请求记录
    rateLimiter.addRequest();

    const feature = FEATURES.find(f => f.id === activeFeature);
    const systemPrompt = SYSTEM_PROMPTS[activeFeature as keyof typeof SYSTEM_PROMPTS];

    // 创建 AbortController 用于超时控制
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, REQUEST_TIMEOUT);

    try {
      // 直接从前端调用 API2D
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: inputText }
          ],
          temperature: 0.7,
          max_tokens: 4096
        }),
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.message || `请求失败 (${response.status})`;
        
        // 处理特定的错误码
        if (response.status === 401) {
          throw new Error('API Key 无效或已过期，请联系管理员');
        } else if (response.status === 429) {
          throw new Error('API 请求配额已用尽，请稍后再试');
        } else if (response.status === 400) {
          throw new Error(`请求参数错误: ${errorMessage}`);
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      if (!content) {
        throw new Error('API 返回内容为空，请重试');
      }

      setOutputText(content);

      // 滚动到输出区域
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // 本地日志（不上传服务器）
      console.log(`[Novel创作] 功能: ${feature?.name}, 模型: ${selectedModel}, 状态: 成功`);

    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError(`请求超时（${REQUEST_TIMEOUT / 1000}秒），请重试或切换其他模型`);
        } else {
          setError(err.message);
        }
      } else {
        setError('网络错误，请检查网络连接后重试');
      }
      
      console.log(`[Novel创作] 功能: ${feature?.name}, 模型: ${selectedModel}, 状态: 失败 -`, err);
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [inputText, selectedModel, activeFeature, getApiKey]);

  // 复制结果
  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setError('复制失败，请手动选择内容复制');
    }
  }, [outputText]);

  // 导出TXT
  const handleExport = useCallback(() => {
    if (!outputText) return;

    const feature = FEATURES.find(f => f.id === activeFeature);
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `${feature?.name}_${dateStr}.txt`;

    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputText, activeFeature]);

  // 清空
  const handleClear = useCallback(() => {
    cancelRequest();
    setInputText('');
    setOutputText('');
    setError('');
    setRateLimitError('');
    setShowClearConfirm(false);
  }, [cancelRequest]);

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  const currentFeature = FEATURES.find(f => f.id === activeFeature);
  const currentModel = MODELS.find(m => m.id === selectedModel);
  const remainingRequests = rateLimiter.getRemainingRequests();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={20} />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
            </Link>

            {/* 导航 Tab */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1">
              <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                热门榜单
              </Link>
              <Link href="/tools" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                工具导航
              </Link>
              <Link href="/prompts" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                提示词库
              </Link>
              <Link href="/tutorials" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                教程库
              </Link>
              <Link href="/novel" className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-full transition-colors">
                📝 小说创作
              </Link>
            </nav>

            {/* 登录按钮 */}
            <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-full hover:border-orange-500 hover:text-orange-500 transition-colors">
              登录
            </button>
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex overflow-x-auto px-2 py-2 gap-1 scrollbar-hide">
            <Link href="/" className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap rounded-full">
              热门榜单
            </Link>
            <Link href="/tools" className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap rounded-full">
              工具导航
            </Link>
            <Link href="/prompts" className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap rounded-full">
              提示词库
            </Link>
            <Link href="/tutorials" className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap rounded-full">
              教程库
            </Link>
            <Link href="/novel" className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white whitespace-nowrap rounded-full">
              📝 小说
            </Link>
          </div>
        </div>
      </header>

      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">小说创作大师</h1>
              <p className="text-white/80 text-sm">AI 驱动的专业小说创作工具</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧功能菜单 */}
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                功能模块
              </h3>
              <div className="space-y-2">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  const isActive = activeFeature === feature.id;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25' 
                          : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          {feature.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 剩余请求次数提示 */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>剩余请求次数</span>
                  <span className={remainingRequests <= 1 ? 'text-red-500' : ''}>{remainingRequests} / {RATE_LIMIT_MAX}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* 中间输入区 */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* 输入区头部 */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      {(() => {
                        const Icon = currentFeature?.icon || Wand2;
                        return <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{currentFeature?.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{currentFeature?.description}</p>
                    </div>
                  </div>

                  {/* 模型选择 */}
                  <div className="relative">
                    <button
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{currentModel?.name}</span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>
                    
                    {showModelDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-10">
                        {MODELS.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl ${
                              selectedModel === model.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${selectedModel === model.id ? 'bg-orange-500' : 'bg-slate-300'}`} />
                            <div className="text-left flex-1">
                              <div className="font-medium text-sm text-slate-900 dark:text-white">{model.name}</div>
                              <div className="text-xs text-orange-600 dark:text-orange-400">{model.desc}</div>
                            </div>
                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                              {model.recommend}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 文本输入 */}
              <div className="p-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={currentFeature?.placeholder}
                  className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
                  disabled={isLoading}
                />
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">{inputText.length} 字符</span>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    {isLoading && (
                      <button
                        onClick={cancelRequest}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="取消请求"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      disabled={isLoading || (!inputText && !outputText)}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="清空"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !inputText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          开始创作
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                    <button 
                      onClick={() => setError('')}
                      className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}

                {/* 频率限制提示 */}
                {rateLimitError && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm text-amber-600 dark:text-amber-400">{rateLimitError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧输出区 */}
          <div className="lg:col-span-4">
            <div 
              ref={outputRef}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24"
            >
              {/* 输出区头部 */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">创作结果</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">AI 智能生成</p>
                    </div>
                  </div>

                  {/* 结果操作 */}
                  {outputText && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopy}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="复制"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={handleExport}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="导出TXT"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 输出内容 */}
              <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    <div className="text-center">
                      <p className="font-medium text-slate-900 dark:text-white">正在创作中...</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">请稍候，AI 正在发挥创意</p>
                    </div>
                  </div>
                ) : outputText ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                      {outputText}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                      <Wand2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">等待创作</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      输入内容后点击「开始创作」
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              确认清空？
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              清空后输入和输出内容都将被删除，此操作无法撤销
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 复制成功提示 */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">已复制到剪贴板</span>
        </div>
      )}

      {/* 页脚 */}
      <footer className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 公众号推广 */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-6 border border-orange-100 dark:border-orange-800/30">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl blur-sm opacity-30"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-lg p-2 shadow-md">
                  <Image 
                    src="/wechat-qrcode.jpg" 
                    alt="微信公众号" 
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-md"
                  />
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">欢迎关注公众号</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  获取最新AI工具资讯、技巧与资源
                </p>
                <span className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  回复「AI」送你一份AI工具使用指南
                </span>
              </div>
            </div>
          </div>

          {/* 底部导航 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={20} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于OneClaw</Link>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
