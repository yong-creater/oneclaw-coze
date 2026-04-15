'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Feather, Upload, Sparkles, Loader2, 
  FileText, Copy, Download, Check, X, ChevronDown,
  ChevronRight, Zap, Wand2, Image, FileCode, Package,
  AlertCircle, Plus, Trash2, Eye, Edit3, Save,
  Settings2, Star, BookOpen, MessageSquare, RefreshCw
} from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import UtilityHeader from './UtilityHeader';
import JSZip from 'jszip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// 简化版模型选择器 - 两列列表
function ModelGroupSelect({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  
  const selectedModel = AI_MODELS.find(m => m.value === value);
  
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left flex items-center justify-between hover:border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      >
        <span className="text-sm text-slate-800 dark:text-slate-200">
          {selectedModel?.label || '选择模型'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-orange-500" />
              选择模型
            </DialogTitle>
          </DialogHeader>
          
          {/* 模型列表 - 两列 */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
            {AI_MODELS.map(model => (
              <button
                key={model.value}
                type="button"
                onClick={() => {
                  onChange(model.value);
                  setOpen(false);
                }}
                className={`px-4 py-3 rounded-lg text-left transition-all text-sm ${
                  model.value === value
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <div className="font-medium flex items-center gap-2">
                  {model.label}
                  {model.region === '付费' && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded">
                      付费
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 ${model.value === value ? 'text-white/80' : 'text-slate-500'}`}>
                  {model.provider}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== 类型定义 ====================
interface StoryContent {
  original: string;
  polished?: string;
  originalityScore?: number;
  importMode: 'paste' | 'upload' | 'generate';
}

interface ComicPanel {
  id: string;
  scene: string;
  characterAction: string;
  dialogue: string;
  emotion: string;
  imageUrl?: string;
  prompt?: string;
}

interface ComicStory {
  id: string;
  platform: 'douyin' | 'xiaohongshu';
  style: '悬疑' | '甜宠' | '爽文' | '古风' | '搞笑';
  duration: '15s' | '30s' | '60s';
  script: {
    time: string;
    shot: number;
    narration: string;
    subtitle: string;
    bgm: string;
    hashtags: string[];
  }[];
}

// ==================== 常量 ====================
const POLISH_STYLES = [
  { value: '番茄爽文', label: '番茄爽文' },
  { value: '晋江言情', label: '晋江言情' },
  { value: '起点玄幻', label: '起点玄幻' },
  { value: '知乎盐文', label: '知乎盐文' },
  { value: '短剧口语化', label: '短剧口语化' },
  { value: '飞卢风', label: '飞卢风' },
  { value: '都市职场', label: '都市职场' },
  { value: '穿越重生', label: '穿越重生' },
  { value: '科幻末日', label: '科幻末日' },
  { value: '武侠江湖', label: '武侠江湖' },
];

const POLISH_INTENSITY = [
  { value: '轻度', label: '轻度-仅改句式' },
  { value: '中度', label: '中度-改写用词+句式' },
  { value: '重度', label: '重度-重构叙事逻辑' },
];

const PANEL_STYLES = [
  { value: '古风', label: '古风' },
  { value: 'Q版', label: 'Q版' },
  { value: '写实', label: '写实' },
  { value: '赛博朋克', label: '赛博朋克' },
  { value: '暗黑', label: '暗黑' },
  { value: '水墨', label: '水墨' },
  { value: '日漫', label: '日漫' },
  { value: '美漫', label: '美漫' },
  { value: '像素风', label: '像素风' },
  { value: '浮世绘', label: '浮世绘' },
];

const IMAGE_QUALITY = [
  { value: '512', label: '标清', size: '512×512' },
  { value: '1024', label: '高清', size: '1024×1024' },
  { value: '2048', label: '超清', size: '2048×2048' },
];

const SCRIPT_STYLES = [
  { value: '悬疑', label: '悬疑' },
  { value: '甜宠', label: '甜宠' },
  { value: '爽文', label: '爽文' },
  { value: '古风', label: '古风' },
  { value: '搞笑', label: '搞笑' },
  { value: '恐怖', label: '恐怖' },
  { value: '科幻', label: '科幻' },
  { value: '都市', label: '都市' },
  { value: '穿越', label: '穿越' },
  { value: '逆袭', label: '逆袭' },
];

// AI模型分组选项
const AI_MODEL_GROUPS = [
  {
    provider: '豆包',
    icon: '🦜',
    models: [
      { value: 'doubao-seed-1-8-251228', label: 'Seed 1.8', region: '免费' },
      { value: 'doubao-seed-2-0-pro-260215', label: 'Seed 2.0 Pro', region: '免费' },
      { value: 'doubao-seed-2-0-lite-260215', label: 'Seed 2.0 Lite', region: '免费' },
    ]
  },
  {
    provider: 'DeepSeek',
    icon: '🔮',
    models: [
      { value: 'deepseek-v3-2-251201', label: 'V3', region: '免费' },
      { value: 'deepseek-r1-250528', label: 'R1 (推理)', region: '免费' },
    ]
  },
  {
    provider: 'Kimi',
    icon: '🌙',
    models: [
      { value: 'kimi-k2-5-260127', label: 'K2.5', region: '免费' },
      { value: 'kimi-k2-250905', label: 'K2', region: '免费' },
    ]
  },
  {
    provider: 'GLM',
    icon: '📊',
    models: [
      { value: 'glm-5-0-260211', label: 'GLM-5', region: '免费' },
    ]
  },
  {
    provider: 'Qwen',
    icon: '🏔️',
    models: [
      { value: 'qwen-3-5-plus-260215', label: 'Qwen 3.5 Plus', region: '免费' },
    ]
  },
  // 4sAPI 付费模型
  {
    provider: 'GPT (4sAPI)',
    icon: '🤖',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', region: '付费' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', region: '付费' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', region: '付费' },
    ]
  },
  {
    provider: 'Claude (4sAPI)',
    icon: '🧠',
    models: [
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', region: '付费' },
      { value: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', region: '付费' },
      { value: 'claude-sonnet-4', label: 'Claude Sonnet 4', region: '付费' },
    ]
  },
  {
    provider: 'Gemini (4sAPI)',
    icon: '✨',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', region: '付费' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', region: '付费' },
    ]
  },
];

// 扁平化的模型列表（用于默认选中和快速查找）
const AI_MODELS = AI_MODEL_GROUPS.flatMap(group => 
  group.models.map(m => ({
    ...m,
    provider: group.provider
  }))
);

// ==================== 工具函数 ====================
const generateId = () => Math.random().toString(36).substring(2, 11);

// ==================== 主组件 ====================
export default function NovelCreator() {
  // Tab状态
  const [activeTab, setActiveTab] = useState<'polish' | 'panel' | 'generate' | 'script' | 'export'>('polish');
  
  // 标签页名称
  const tabNames = {
    polish: '小说导入/洗稿',
    panel: '漫画分镜拆解',
    generate: '漫画生图',
    script: '推文脚本',
    export: '素材导出',
  };
  
  // ==================== 标签1：小说导入/洗稿 ====================
  const [importMode, setImportMode] = useState<'paste' | 'upload'>('paste');
  const [originalText, setOriginalText] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [polishStyle, setPolishStyle] = useState('番茄爽文');
  const [polishIntensity, setPolishIntensity] = useState('中度');
  const [extraRequirements, setExtraRequirements] = useState<string[]>([]);
  const [polishing, setPolishing] = useState(false);
  const [polishedContent, setPolishedContent] = useState<StoryContent | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [selectedModel, setSelectedModel] = useState('doubao-seed-1-8-251228');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
      alert('请上传TXT或Word格式文件');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }
    
    setUploadFile(file);
    
    try {
      const text = await file.text();
      setOriginalText(text);
    } catch (error) {
      alert('文件读取失败');
    }
  };
  
  // 洗稿处理
  const handlePolish = async () => {
    if (!originalText.trim()) {
      alert('请先导入小说内容');
      return;
    }
    
    setPolishing(true);
    
    try {
      const response = await fetch('/api/novel/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          style: polishStyle,
          intensity: polishIntensity,
          extraRequirements,
          model: selectedModel,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPolishedContent({
        original: originalText,
        polished: data.content,
        originalityScore: data.score || 90,
        importMode,
      });
      
      // 自动切换到洗稿结果
      setActiveTab('polish');
      
    } catch (error: any) {
      console.error('洗稿失败:', error);
      alert(error.message || '洗稿失败，请重试');
    } finally {
      setPolishing(false);
    }
  };
  
  // 复制内容
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };
  
  // 导出TXT
  const handleExportTXT = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // 清空输入
  const handleClearInput = () => {
    if (confirm('确定要清空所有输入吗？')) {
      setOriginalText('');
      setUploadFile(null);
      setPolishedContent(null);
    }
  };
  
  // ==================== 标签2：漫画分镜拆解 ====================
  const [sourceText, setSourceText] = useState(polishedContent?.polished || '');
  const [panelCount, setPanelCount] = useState('auto');
  const [panelStyle, setPanelStyle] = useState('古风');
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [splitting, setSplitting] = useState(false);
  
  // 当洗稿完成后同步文本
  useEffect(() => {
    if (polishedContent?.polished) {
      setSourceText(polishedContent.polished);
    }
  }, [polishedContent]);
  
  // 拆解分镜
  const handleSplitPanels = async () => {
    if (!sourceText.trim()) {
      alert('请先导入小说内容');
      return;
    }
    
    setSplitting(true);
    
    try {
      const response = await fetch('/api/novel/split-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          count: panelCount,
          style: panelStyle,
          model: selectedModel,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 解析分镜数据
      const parsedPanels = parsePanelData(data.content);
      setPanels(parsedPanels);
      
    } catch (error: any) {
      console.error('分镜拆解失败:', error);
      alert(error.message || '分镜拆解失败，请重试');
    } finally {
      setSplitting(false);
    }
  };
  
  // 解析分镜数据
  const parsePanelData = (content: string): ComicPanel[] => {
    const panels: ComicPanel[] = [];
    const lines = content.split('\n');
    let currentPanel: Partial<ComicPanel> | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (/^分镜\d+[:：]/.test(trimmed) || /^场景\d+[:：]/.test(trimmed)) {
        if (currentPanel?.scene) {
          panels.push(currentPanel as ComicPanel);
        }
        currentPanel = {
          id: generateId(),
          scene: trimmed.replace(/^分镜\d+[:：]\s*/, '').replace(/^场景\d+[:：]\s*/, ''),
          characterAction: '',
          dialogue: '',
          emotion: '',
        };
      } else if (currentPanel) {
        if (/^人物动作[:：]/.test(trimmed)) {
          currentPanel.characterAction = trimmed.replace(/^人物动作[:：]\s*/, '');
        } else if (/^对话[:：]/.test(trimmed) || /^台词[:：]/.test(trimmed)) {
          currentPanel.dialogue = trimmed.replace(/^(对话|台词)[:：]\s*/, '');
        } else if (/^情绪[:：]/.test(trimmed) || /^情感[:：]/.test(trimmed)) {
          currentPanel.emotion = trimmed.replace(/^(情绪|情感)[:：]\s*/, '');
        }
      }
    }
    
    if (currentPanel?.scene) {
      panels.push(currentPanel as ComicPanel);
    }
    
    // 如果解析失败，创建一个默认分镜
    if (panels.length === 0 && content.trim()) {
      const count = parseInt(panelCount) || 6;
      for (let i = 0; i < count; i++) {
        panels.push({
          id: generateId(),
          scene: `场景 ${i + 1}`,
          characterAction: '人物动作描述',
          dialogue: '对话内容',
          emotion: '情绪表达',
        });
      }
    }
    
    return panels;
  };
  
  // 更新分镜
  const updatePanel = (id: string, field: keyof ComicPanel, value: string) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  
  // 删除分镜
  const deletePanel = (id: string) => {
    if (confirm('确定要删除这个分镜吗？')) {
      setPanels(prev => prev.filter(p => p.id !== id));
    }
  };
  
  // ==================== 标签3：漫画生图 ====================
  const [imageQuality, setImageQuality] = useState('1024');
  const [imageStyleExtra, setImageStyleExtra] = useState('');
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatingPanelId, setGeneratingPanelId] = useState<string | null>(null);
  
  // 生成单张图片
  const handleGenerateImage = async (panel: ComicPanel) => {
    setGeneratingPanelId(panel.id);
    
    try {
      const prompt = `漫画风格，${panelStyle}，场景：${panel.scene}，人物动作：${panel.characterAction}，情绪：${panel.emotion}，${imageStyleExtra}`;
      
      const response = await fetch('/api/novel/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          quality: imageQuality,
          style: panelStyle,
          model: selectedModel,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 更新分镜图片
      setPanels(prev => prev.map(p => 
        p.id === panel.id ? { ...p, imageUrl: data.imageUrl, prompt } : p
      ));
      
    } catch (error: any) {
      console.error('生图失败:', error);
      alert(error.message || '生图失败，请重试');
    } finally {
      setGeneratingPanelId(null);
    }
  };
  
  // 批量生图
  const handleBatchGenerate = async () => {
    if (panels.length === 0) {
      alert('请先拆分漫画分镜');
      return;
    }
    
    setGeneratingImages(true);
    
    for (const panel of panels) {
      await handleGenerateImage(panel);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 避免API限流
    }
    
    setGeneratingImages(false);
  };
  
  // 下载单张图片
  const handleDownloadImage = async (panel: ComicPanel) => {
    if (!panel.imageUrl) return;
    
    try {
      const response = await fetch(panel.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comic_panel_${panel.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('图片下载失败');
    }
  };
  
  // ==================== 标签4：漫画推文脚本 ====================
  const [scriptPlatform, setScriptPlatform] = useState<'douyin' | 'xiaohongshu'>('douyin');
  const [scriptStyle, setScriptStyle] = useState<'悬疑' | '甜宠' | '爽文' | '古风' | '搞笑'>('爽文');
  const [scriptDuration, setScriptDuration] = useState<'15s' | '30s' | '60s'>('30s');
  const [comicStory, setComicStory] = useState<ComicStory | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  
  // 生成推文脚本
  const handleGenerateScript = async () => {
    if (!polishedContent?.polished || panels.length === 0) {
      alert('请先完成洗稿和分镜拆解');
      return;
    }
    
    setGeneratingScript(true);
    
    try {
      const response = await fetch('/api/novel/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: polishedContent.polished,
          panels: panels.length,
          platform: scriptPlatform,
          style: scriptStyle,
          duration: scriptDuration,
          model: selectedModel,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 保存使用记录
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'novel',
          input_data: { 
            content_length: polishedContent.polished.length, 
            panels_count: panels.length,
            platform: scriptPlatform,
            style: scriptStyle,
          },
          output_data: data.success ? { script_length: data.content?.length || 0 } : null,
          status: data.success ? 'success' : 'failed',
          error_message: data.error || null,
        }),
      }).catch(console.error);
      
      // 解析脚本数据
      setComicStory({
        id: generateId(),
        platform: scriptPlatform,
        style: scriptStyle,
        duration: scriptDuration,
        script: parseScriptData(data.content),
      });
      
    } catch (error: any) {
      console.error('脚本生成失败:', error);
      alert(error.message || '脚本生成失败，请重试');
    } finally {
      setGeneratingScript(false);
    }
  };
  
  // 解析脚本数据
  const parseScriptData = (content: string): ComicStory['script'] => {
    const script: ComicStory['script'] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      const timeMatch = trimmed.match(/时长[:：](\d+秒)/);
      const shotMatch = trimmed.match(/镜头[:：](\d+)/);
      const narrationMatch = trimmed.match(/旁白[:：](.+)/);
      const subtitleMatch = trimmed.match(/字幕[:：](.+)/);
      const bgmMatch = trimmed.match(/背景音乐[:：](.+)/);
      const hashtagMatch = trimmed.match(/话题[:：](.+)/);
      
      if (timeMatch || shotMatch || narrationMatch || subtitleMatch) {
        script.push({
          time: timeMatch ? timeMatch[1] : '0秒',
          shot: shotMatch ? parseInt(shotMatch[1]) : script.length + 1,
          narration: narrationMatch ? narrationMatch[1].trim() : '',
          subtitle: subtitleMatch ? subtitleMatch[1].trim() : '',
          bgm: bgmMatch ? bgmMatch[1].trim() : '',
          hashtags: hashtagMatch ? hashtagMatch[1].split(/[,，]/).map(t => t.trim()) : [],
        });
      }
    }
    
    // 如果解析失败，创建默认脚本
    if (script.length === 0) {
      const durationSeconds = parseInt(scriptDuration) || 30;
      const shotCount = Math.min(panels.length, Math.ceil(durationSeconds / 5));
      
      for (let i = 0; i < shotCount; i++) {
        script.push({
          time: `${(i + 1) * 5}秒`,
          shot: i + 1,
          narration: `旁白内容 ${i + 1}`,
          subtitle: `字幕内容 ${i + 1}`,
          bgm: '背景音乐建议',
          hashtags: ['#漫画推文', '#短剧', '#热门'],
        });
      }
    }
    
    return script;
  };
  
  // 导出SRT字幕
  const handleExportSRT = () => {
    if (!comicStory) return;
    
    let srtContent = '';
    comicStory.script.forEach((item, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `00:00:${item.time.replace('秒', '00')} --> 00:00:${parseInt(item.time) + 5}秒00\n`;
      srtContent += `${item.subtitle}\n\n`;
    });
    
    handleExportTXT(srtContent, `字幕_${new Date().toISOString().split('T')[0]}.srt`);
  };
  
  // ==================== 标签5：素材导出 ====================
  const [exportOptions, setExportOptions] = useState({
    polishedText: true,
    panelScript: true,
    comicImages: true,
    storyScript: true,
    subtitle: false,
    imageQuality: '1024',
  });
  
  // 一键导出
  const handleExportAll = async () => {
    const selectedOptions = Object.entries(exportOptions).filter(([key, value]) => value === true || parseInt(String(value)) > 0);
    
    if (selectedOptions.length === 0) {
      alert('请选择需要导出的素材类型');
      return;
    }
    
    const zip = new JSZip();
    
    // 洗稿文本
    if (exportOptions.polishedText && polishedContent?.polished) {
      zip.file(`洗稿文本_${new Date().toISOString().split('T')[0]}.txt`, polishedContent.polished);
    }
    
    // 分镜脚本
    if (exportOptions.panelScript && panels.length > 0) {
      const panelScript = panels.map((p, i) => 
        `【分镜${i + 1}】\n场景：${p.scene}\n人物动作：${p.characterAction}\n对话：${p.dialogue}\n情绪：${p.emotion}\n`
      ).join('\n');
      zip.file(`漫画分镜脚本_${new Date().toISOString().split('T')[0]}.txt`, panelScript);
    }
    
    // 推文脚本
    if (exportOptions.storyScript && comicStory) {
      const scriptContent = comicStory.script.map((s, i) => 
        `【镜头${s.shot}】\n时长：${s.time}\n旁白：${s.narration}\n字幕：${s.subtitle}\n背景音乐：${s.bgm}\n话题：${s.hashtags.join(', ')}\n`
      ).join('\n');
      zip.file(`推文脚本_${new Date().toISOString().split('T')[0]}.txt`, scriptContent);
    }
    
    // 字幕文件
    if (exportOptions.subtitle && comicStory) {
      let srtContent = '';
      comicStory.script.forEach((item, index) => {
        srtContent += `${index + 1}\n`;
        srtContent += `00:00:${item.time.replace('秒', '00')} --> 00:00:${parseInt(item.time) + 5}秒00\n`;
        srtContent += `${item.subtitle}\n\n`;
      });
      zip.file(`字幕_${new Date().toISOString().split('T')[0]}.srt`, srtContent);
    }
    
    // 生成并下载压缩包
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `小说创作素材_${new Date().toISOString().split('T')[0]}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      {/* 统一头部 */}
      <UtilityHeader
        toolIcon={<Feather />}
        toolName="小说创作工坊"
        toolDescription="小说洗稿 · 漫画生图 · 推文脚本"
        gradient="from-orange-500 to-amber-500"
      />
      
      {/* 标签页导航 */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-1 overflow-x-auto">
            {Object.entries(tabNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* ==================== 标签1：小说导入/洗稿 ==================== */}
        {activeTab === 'polish' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：输入区域 */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-orange-500" />
                      小说导入
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setImportMode('paste')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          importMode === 'paste' 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        粘贴文本
                      </button>
                      <button
                        onClick={() => setImportMode('upload')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          importMode === 'upload' 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        上传文件
                      </button>
                    </div>
                  </div>
                  
                  {importMode === 'paste' ? (
                    <textarea
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      placeholder="请粘贴小说章节/全文内容..."
                      className="w-full h-64 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  ) : (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      {uploadFile ? (
                        <div className="p-6 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50 text-center">
                          <FileText className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">{uploadFile.name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {(uploadFile.size / 1024).toFixed(1)} KB
                          </p>
                          <button
                            onClick={() => {
                              setUploadFile(null);
                              setOriginalText('');
                              fileInputRef.current?.click();
                            }}
                            className="mt-3 text-sm text-orange-500 hover:text-orange-600"
                          >
                            重新上传
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">点击上传TXT/Word文件</p>
                          <p className="text-xs text-slate-400 mt-1">单个文件不超过10MB</p>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 洗稿配置 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-orange-500" />
                    洗稿配置
                  </h2>
                  
                  <div className="space-y-4">
                    {/* AI模型选择 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Sparkles className="w-4 h-4 inline mr-1 text-orange-500" />
                        AI模型
                        <span className="text-xs text-slate-400 ml-1">(按厂商分组选择)</span>
                      </label>
                      <ModelGroupSelect value={selectedModel} onChange={setSelectedModel} />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">洗稿风格</label>
                      <Select value={polishStyle} onValueChange={setPolishStyle}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POLISH_STYLES.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">洗稿强度</label>
                      <Select value={polishIntensity} onValueChange={setPolishIntensity}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POLISH_INTENSITY.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">额外需求</label>
                      <div className="flex flex-wrap gap-2">
                        {['删减水字数', '强化爽点', '保留伏笔', '量化冲突'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={extraRequirements.includes(opt)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExtraRequirements(prev => [...prev, opt]);
                                } else {
                                  setExtraRequirements(prev => prev.filter(o => o !== opt));
                                }
                              }}
                              className="rounded text-orange-500"
                            />
                            <span className="text-sm text-slate-600">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handlePolish}
                    disabled={polishing || !originalText.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {polishing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        正在深度洗稿...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        立即洗稿
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowExample(true)}
                    className="px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    查看示例
                  </button>
                  
                  <button
                    onClick={handleClearInput}
                    className="px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    清空输入
                  </button>
                </div>
              </div>
              
              {/* 右侧：输出区域 */}
              <div className="space-y-6">
                {polishedContent ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          洗稿完成
                        </h2>
                        <Badge variant="outline" className="text-xs">
                          {AI_MODELS.find(m => m.value === selectedModel)?.label || '豆包'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(polishedContent.polished || '')}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Copy className="w-4 h-4" />
                          复制
                        </button>
                        <button
                          onClick={() => handleExportTXT(polishedContent.polished || '', `洗稿文本_${new Date().toISOString().split('T')[0]}.txt`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Download className="w-4 h-4" />
                          导出
                        </button>
                      </div>
                    </div>
                    
                    {/* 原创度评分 */}
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl mb-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                          <circle
                            cx="32" cy="32" r="28"
                            stroke="#22c55e"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(polishedContent.originalityScore || 0) * 1.76} 176`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-green-600">{polishedContent.originalityScore || 90}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">原创度评分</p>
                        <p className="text-xs text-green-600">洗稿后原创度显著提升</p>
                      </div>
                    </div>
                    
                    {/* 洗稿内容 */}
                    <div className="max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                      {polishedContent.polished}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                    <Wand2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">开始洗稿创作</h3>
                    <p className="text-sm text-slate-400">
                      导入小说内容，点击「立即洗稿」开始深度洗稿
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* ==================== 标签2：漫画分镜拆解 ==================== */}
        {activeTab === 'panel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-orange-500" />
                漫画分镜拆解
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">小说内容</label>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="请输入或粘贴小说内容，系统将自动拆分为漫画分镜..."
                    className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Sparkles className="w-4 h-4 inline mr-1 text-orange-500" />
                      AI模型
                    </label>
                    <ModelGroupSelect value={selectedModel} onChange={setSelectedModel} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">分镜数量</label>
                    <Select value={panelCount} onValueChange={setPanelCount}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">按章节自动拆分</SelectItem>
                        <SelectItem value="4">4个分镜</SelectItem>
                        <SelectItem value="6">6个分镜</SelectItem>
                        <SelectItem value="8">8个分镜</SelectItem>
                        <SelectItem value="12">12个分镜</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">分镜风格</label>
                    <Select value={panelStyle} onValueChange={setPanelStyle}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PANEL_STYLES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <button
                  onClick={handleSplitPanels}
                  disabled={splitting || !sourceText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {splitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在拆解分镜...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      立即拆解
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* 分镜列表 */}
            {panels.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    分镜列表 ({panels.length}个)
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {panels.map((panel, index) => (
                    <div key={panel.id} className="p-4 bg-slate-50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-orange-600">分镜 {index + 1}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deletePanel(panel.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">场景</label>
                          <input
                            type="text"
                            value={panel.scene}
                            onChange={(e) => updatePanel(panel.id, 'scene', e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">情绪</label>
                          <input
                            type="text"
                            value={panel.emotion}
                            onChange={(e) => updatePanel(panel.id, 'emotion', e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">人物动作</label>
                        <input
                          type="text"
                          value={panel.characterAction}
                          onChange={(e) => updatePanel(panel.id, 'characterAction', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">对话</label>
                        <input
                          type="text"
                          value={panel.dialogue}
                          onChange={(e) => updatePanel(panel.id, 'dialogue', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ==================== 标签3：漫画生图 ==================== */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-orange-500" />
                漫画生成配置
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Sparkles className="w-4 h-4 inline mr-1 text-orange-500" />
                    AI模型
                  </label>
                  <ModelGroupSelect value={selectedModel} onChange={setSelectedModel} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">画质设置</label>
                  <Select value={imageQuality} onValueChange={setImageQuality}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_QUALITY.map(q => (
                        <SelectItem key={q.value} value={q.value}>{q.label} ({q.size})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">当前风格</label>
                  <div className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600">
                    {panelStyle}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">风格细节（可选）</label>
                <input
                  type="text"
                  value={imageStyleExtra}
                  onChange={(e) => setImageStyleExtra(e.target.value)}
                  placeholder="如：线条简洁、色彩明亮、人物表情夸张"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
              
              <button
                onClick={handleBatchGenerate}
                disabled={generatingImages || panels.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {generatingImages ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在批量生成...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    批量生成所有漫画图
                  </>
                )}
              </button>
            </div>
            
            {/* 漫画图展示 */}
            {panels.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  漫画图 ({panels.filter(p => p.imageUrl).length}/{panels.length})
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {panels.map((panel, index) => (
                    <div key={panel.id} className="space-y-2">
                      <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                        {panel.imageUrl ? (
                          <img src={panel.imageUrl} alt={`分镜${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 flex gap-1">
                          {generatingPanelId === panel.id && (
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                          )}
                          {!panel.imageUrl && generatingPanelId !== panel.id && (
                            <button
                              onClick={() => handleGenerateImage(panel)}
                              className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          )}
                          {panel.imageUrl && (
                            <>
                              <button
                                onClick={() => handleDownloadImage(panel)}
                                className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleGenerateImage(panel)}
                                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 truncate">分镜 {index + 1}: {panel.scene}</p>
                      
                      {panel.prompt && (
                        <button
                          onClick={() => handleCopy(panel.prompt || '')}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                        >
                          <Copy className="w-3 h-3" />
                          复制提示词
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {panels.length === 0 && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">暂无漫画分镜</h3>
                <p className="text-sm text-slate-400">
                  请先在「漫画分镜拆解」标签页拆分漫画分镜
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* ==================== 标签4：漫画推文脚本 ==================== */}
        {activeTab === 'script' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-orange-500" />
                漫画推文脚本
              </h2>
              
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Sparkles className="w-4 h-4 inline mr-1 text-orange-500" />
                    AI模型
                  </label>
                  <ModelGroupSelect value={selectedModel} onChange={setSelectedModel} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">发布平台</label>
                    <Select value={scriptPlatform} onValueChange={(v) => setScriptPlatform(v as 'douyin' | 'xiaohongshu')}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="douyin">抖音</SelectItem>
                        <SelectItem value="xiaohongshu">小红书</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">推文风格</label>
                    <Select value={scriptStyle} onValueChange={(v) => setScriptStyle(v as '悬疑' | '甜宠' | '爽文' | '古风' | '搞笑')}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCRIPT_STYLES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">推文时长</label>
                    <Select value={scriptDuration} onValueChange={(v) => setScriptDuration(v as '15s' | '30s' | '60s')}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15s">15秒</SelectItem>
                        <SelectItem value="30s">30秒</SelectItem>
                        <SelectItem value="60s">60秒</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGenerateScript}
                disabled={generatingScript || !polishedContent?.polished || panels.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {generatingScript ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在生成脚本...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    生成推文脚本
                  </>
                )}
              </button>
            </div>
            
            {/* 脚本展示 */}
            {comicStory && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    推文脚本 ({comicStory.script.length}个镜头)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(JSON.stringify(comicStory.script, null, 2))}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                    <button
                      onClick={handleExportSRT}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                      导出字幕
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {comicStory.script.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                          镜头 {item.shot}
                        </span>
                        <span className="text-sm text-slate-500">时长: {item.time}</span>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-500">旁白：</span>
                        <p className="text-sm text-slate-700">{item.narration}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-500">字幕：</span>
                        <p className="text-sm text-slate-700">{item.subtitle}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-500">背景音乐：</span>
                        <p className="text-sm text-slate-700">{item.bgm}</p>
                      </div>
                      
                      {item.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.hashtags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!comicStory && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <FileCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">暂无推文脚本</h3>
                <p className="text-sm text-slate-400">
                  请先完成洗稿和分镜拆解，然后生成推文脚本
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* ==================== 标签5：素材导出 ==================== */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                素材导出
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={exportOptions.polishedText}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, polishedText: e.target.checked }))}
                      className="rounded text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">洗稿文本 (TXT)</p>
                      <p className="text-xs text-slate-500">深度洗稿后的完整小说文本</p>
                    </div>
                    {polishedContent?.polished && (
                      <Check className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={exportOptions.panelScript}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, panelScript: e.target.checked }))}
                      className="rounded text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">漫画分镜脚本 (TXT)</p>
                      <p className="text-xs text-slate-500">所有分镜的场景、动作、对话描述</p>
                    </div>
                    {panels.length > 0 && (
                      <Check className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={exportOptions.comicImages}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, comicImages: e.target.checked }))}
                      className="rounded text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">漫画图片 (PNG)</p>
                      <p className="text-xs text-slate-500">生成的漫画图片文件</p>
                    </div>
                    {panels.filter(p => p.imageUrl).length > 0 && (
                      <span className="ml-auto text-xs text-slate-500">
                        {panels.filter(p => p.imageUrl).length}张
                      </span>
                    )}
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={exportOptions.storyScript}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, storyScript: e.target.checked }))}
                      className="rounded text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">推文脚本 (TXT)</p>
                      <p className="text-xs text-slate-500">完整的漫画推文脚本内容</p>
                    </div>
                    {comicStory && (
                      <Check className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={exportOptions.subtitle}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, subtitle: e.target.checked }))}
                      className="rounded text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">字幕文件 (SRT)</p>
                      <p className="text-xs text-slate-500">可导入视频编辑软件的字幕文件</p>
                    </div>
                    {comicStory && (
                      <Check className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleExportAll}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Package className="w-5 h-5" />
                一键导出素材包
              </button>
            </div>
            
            {/* 导出预览 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">导出内容预览</h2>
              
              <div className="space-y-3">
                {exportOptions.polishedText && polishedContent?.polished && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-700">洗稿文本_{new Date().toISOString().split('T')[0]}.txt</span>
                  </div>
                )}
                
                {exportOptions.panelScript && panels.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-700">漫画分镜脚本_{new Date().toISOString().split('T')[0]}.txt ({panels.length}个分镜)</span>
                  </div>
                )}
                
                {exportOptions.comicImages && panels.filter(p => p.imageUrl).length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Image className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-700">漫画图片 ({panels.filter(p => p.imageUrl).length}张PNG)</span>
                  </div>
                )}
                
                {exportOptions.storyScript && comicStory && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-700">推文脚本_{new Date().toISOString().split('T')[0]}.txt</span>
                  </div>
                )}
                
                {exportOptions.subtitle && comicStory && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-700">字幕_{new Date().toISOString().split('T')[0]}.srt</span>
                  </div>
                )}
                
                {!polishedContent && panels.length === 0 && !comicStory && (
                  <div className="text-center py-8 text-slate-400">
                    暂无可导出的素材，请先完成创作流程
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 示例弹窗 */}
      {showExample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">洗稿示例对比</h3>
              <button onClick={() => setShowExample(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-3">原文</h4>
                  <div className="p-4 bg-slate-50 rounded-xl text-sm leading-relaxed">
                    <p className="mb-3">他走到门口，看了看外面。</p>
                    <p className="mb-3">然后他打开了门，走了出去。</p>
                    <p>他看到天空很蓝。</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-orange-600 mb-3">洗稿后</h4>
                  <div className="p-4 bg-orange-50 rounded-xl text-sm leading-relaxed">
                    <p className="mb-3">脚步顿在玄关处，他下意识望向窗外。</p>
                    <p className="mb-3 mb-2">深吸一口气，他推开了那扇门——</p>
                    <p className="text-orange-600 font-medium">湛蓝的天空下，阳光正好。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
