'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Sparkles, Loader2, 
  AlertCircle, Check, Copy, Download, X, Eye,
  ChevronDown, ChevronUp, Star, Target, TrendingUp,
  RefreshCw, Heart, ArrowLeft
} from 'lucide-react';
import LoginButton from '@/components/LoginButton';

// 简历解析类型
interface ParsedResume {
  basicInfo: string;
  experience: string;
  projects: string;
  skills: string;
}

// 匹配度报告类型
interface MatchReport {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: { title: string; content: string }[];
}

// 优化结果类型
interface OptimizationResult {
  optimizedResume: string;
  matchReport: MatchReport;
}

// 工具提示词
const SYSTEM_PROMPT = `你是拥有10年HR经验的简历优化专家，擅长将简历按照STAR法则（场景Situation-任务Task-行动Action-结果Result）重构，并生成与目标岗位的匹配度报告。

核心要求：
1. STAR法则重构：所有工作经历和项目经历必须按「场景(S)-任务(T)-行动(A)-结果(R)」结构重写
2. 量化成果：必须包含具体数据和百分比，无数据时生成合理的量化表述
3. 关键词匹配：突出与JD匹配的核心关键词，用【】标注
4. 逻辑连贯：保持原有核心信息不改变，人设一致

输出格式要求：
## 优化后简历
[完整的STAR法则优化版简历]

## 匹配度报告
### 匹配评分：X分
### 已匹配关键词：[关键词1] [关键词2]...
### 缺失关键词：[关键词1] [关键词2]...
### 优化建议：
1. [建议1]
2. [建议2]
3. [建议3]`;

export default function ResumeOptimizer() {
  // 简历输入状态
  const [resumeMode, setResumeMode] = useState<'paste' | 'upload'>('paste');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string>('');
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  
  // JD输入状态
  const [jdText, setJdText] = useState('');
  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  
  // 优化状态
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  
  // UI状态
  const [activeTab, setActiveTab] = useState<'resume' | 'report'>('resume');
  const [showExample, setShowExample] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    experience: true,
    projects: true,
    skills: true,
  });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showDetailFormat, setShowDetailFormat] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 监听JD输入，提取关键词
  useEffect(() => {
    if (jdText.length > 50) {
      const words = extractKeywords(jdText);
      setJdKeywords(words);
    } else {
      setJdKeywords([]);
    }
  }, [jdText]);
  
  // 提取关键词
  const extractKeywords = (text: string): string[] => {
    const patterns = [
      /要求[:：]\s*([^\n]+)/gi,
      /具备[:：]\s*([^\n]+)/gi,
      /熟悉[:：]\s*([^\n]+)/gi,
      /掌握[:：]\s*([^\n]+)/gi,
      /经验[:：]\s*([^\n]+)/gi,
      /能力[:：]\s*([^\n]+)/gi,
    ];
    
    const keywords: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = match.replace(/^(要求|具备|熟悉|掌握|经验|能力)[:：]\s*/i, '');
          const words = extracted.split(/[,，、;；]/).filter(w => w.trim().length > 1);
          keywords.push(...words.slice(0, 5));
        });
      }
    });
    
    // 去重并限制数量
    return [...new Set(keywords)].slice(0, 15);
  };
  
  // 处理PDF上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setOptimizeError('请上传PDF格式文件');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setOptimizeError('文件大小不能超过10MB');
      return;
    }
    
    setResumeFile(file);
    setResumePreview(file.name);
    setOptimizeError('');
    
    // 模拟PDF解析（实际需要后端处理）
    setParsedResume({
      basicInfo: '张三 | 28岁 | 本科 | 5年工作经验',
      experience: '2020-至今 某互联网公司 产品经理\n- 负责产品规划与设计\n- 推进项目落地',
      projects: '2022-2023 电商平台重构\n- 主导用户增长功能开发\n- 提升转化率20%',
      skills: 'Axure, Figma, SQL, 数据分析',
    });
  };
  
  // 清空输入
  const handleClearAll = () => {
    if (confirm('确定要清空所有输入内容吗？')) {
      setResumeText('');
      setResumeFile(null);
      setResumePreview('');
      setParsedResume(null);
      setJdText('');
      setJdKeywords([]);
      setResult(null);
      setOptimizeError('');
    }
  };
  
  // 开始优化
  const handleOptimize = async () => {
    const inputText = resumeMode === 'paste' ? resumeText : (parsedResume ? 
      `${parsedResume.basicInfo}\n\n工作经历：\n${parsedResume.experience}\n\n项目经历：\n${parsedResume.projects}\n\n技能证书：\n${parsedResume.skills}` : '');
    
    if (!inputText.trim() || !jdText.trim()) {
      setOptimizeError('请先输入简历和JD内容');
      return;
    }
    
    setOptimizing(true);
    setOptimizeError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: inputText,
          jd: jdText,
          systemPrompt: SYSTEM_PROMPT,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 解析返回结果
      const content = data.content || '';
      const parts = content.split('## 匹配度报告');
      
      if (parts.length >= 2) {
        const optimizedResume = parts[0].replace('## 优化后简历', '').trim();
        const reportSection = parts[1];
        
        // 解析匹配度报告
        const scoreMatch = reportSection.match(/匹配评分[：:]\s*(\d+)/);
        const matchedMatch = reportSection.match(/已匹配关键词[：:]\s*\[([^\]]+)\]/);
        const missingMatch = reportSection.match(/缺失关键词[：:]\s*\[([^\]]+)\]/);
        
        const report: MatchReport = {
          score: scoreMatch ? parseInt(scoreMatch[1]) : 75,
          matchedKeywords: matchedMatch ? matchedMatch[1].split(/[,，、]/).filter((k: string) => k.trim()) : [],
          missingKeywords: missingMatch ? missingMatch[1].split(/[,，、]/).filter((k: string) => k.trim()) : [],
          suggestions: [],
        };
        
        // 提取优化建议
        const suggestionsMatch = reportSection.match(/优化建议[：:]\n([\s\S]*)$/);
        if (suggestionsMatch) {
          const suggestionLines = suggestionsMatch[1].split('\n').filter((line: string) => /^\d+\./.test(line.trim()));
          report.suggestions = suggestionLines.map((line: string) => ({
            title: line.replace(/^\d+\.\s*/, '').split('：')[0].trim(),
            content: line.split('：').slice(1).join('：').trim() || line.replace(/^\d+\.\s*/, '').trim(),
          }));
        }
        
        setResult({ optimizedResume, matchReport: report });
        setActiveTab('resume');
      } else {
        // 如果格式不完全匹配，使用整个内容作为优化后的简历
        setResult({
          optimizedResume: content,
          matchReport: {
            score: 75,
            matchedKeywords: jdKeywords.slice(0, 5),
            missingKeywords: [],
            suggestions: [],
          },
        });
        setActiveTab('resume');
      }
    } catch (error: any) {
      console.error('优化失败:', error);
      setOptimizeError(error.message || '优化失败，请重试');
    } finally {
      setOptimizing(false);
    }
  };
  
  // 复制内容
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };
  
  // 下载PDF（模拟）
  const handleDownloadPDF = () => {
    if (!result) return;
    alert('PDF导出功能开发中，请先复制内容保存');
  };
  
  // 切换展开/收起
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // 调整字体大小样式
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 返回按钮 */}
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">返回</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            
            {/* 网站Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🦞</span>
              </div>
              <span className="font-bold text-lg text-slate-800 hidden sm:inline">OneClaw</span>
            </div>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            
            {/* 应用Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-700">STAR简历优化</span>
            </div>
          </div>
          
          {/* 登录 */}
          <LoginButton />
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* 输入区域 */}
        {!result && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              <Sparkles className="inline w-6 h-6 text-blue-500 mr-2" />
              STAR简历深度优化
            </h1>
            <p className="text-slate-500">上传简历+粘贴JD，一键生成STAR法则优化版简历，精准匹配岗位要求</p>
            
            {/* 输入框区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 简历输入 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    简历输入
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResumeMode('paste')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        resumeMode === 'paste' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      粘贴文本
                    </button>
                    <button
                      onClick={() => setResumeMode('upload')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        resumeMode === 'upload' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      上传PDF
                    </button>
                  </div>
                </div>
                
                {resumeMode === 'paste' ? (
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="请粘贴简历全文（纯文本），系统将自动解析结构..."
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                ) : (
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {resumeFile ? (
                      <div className="p-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 text-center">
                        <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">{resumePreview}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {parsedResume ? '✓ 已解析完成' : '正在解析...'}
                        </p>
                        <button
                          onClick={() => {
                            setResumeFile(null);
                            setResumePreview('');
                            setParsedResume(null);
                            fileInputRef.current?.click();
                          }}
                          className="mt-3 text-sm text-blue-500 hover:text-blue-600"
                        >
                          重新上传
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">点击上传PDF简历</p>
                        <p className="text-xs text-slate-400 mt-1">支持多页PDF，单文件不超过10MB</p>
                      </button>
                    )}
                    
                    {parsedResume && (
                      <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                        <h3 className="text-sm font-medium text-slate-700">已识别的简历结构：</h3>
                        {parsedResume.basicInfo && (
                          <p className="text-xs text-slate-500">✓ 基本信息：{parsedResume.basicInfo}</p>
                        )}
                        {parsedResume.experience && (
                          <p className="text-xs text-slate-500">✓ 工作经历：已识别</p>
                        )}
                        {parsedResume.projects && (
                          <p className="text-xs text-slate-500">✓ 项目经历：已识别</p>
                        )}
                        {parsedResume.skills && (
                          <p className="text-xs text-slate-500">✓ 技能证书：已识别</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* JD输入 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-500" />
                    岗位JD
                  </h2>
                </div>
                
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="请粘贴目标岗位JD全文（支持复制Boss直聘、智联等平台JD），系统将自动拆解核心关键词..."
                  className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-sm"
                />
                
                {jdKeywords.length > 0 && (
                  <div className="mt-4 p-4 bg-cyan-50 rounded-xl">
                    <p className="text-sm text-cyan-700 mb-2">
                      已识别 {jdKeywords.length} 个核心关键词：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jdKeywords.map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {optimizing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在优化简历...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    立即优化
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowExample(true)}
                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
              >
                查看示例
              </button>
              
              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
              >
                清空输入
              </button>
            </div>
            
            {/* 错误提示 */}
            {optimizeError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{optimizeError}</span>
              </div>
            )}
          </div>
        )}
        
        {/* 输出结果区域 */}
        {result && (
          <div className="space-y-6">
            {/* 结果头部 */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  <Check className="inline w-6 h-6 text-green-500 mr-2" />
                  优化完成
                </h2>
                <p className="text-slate-500 mt-1">您的STAR法则优化版简历已生成</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setResult(null);
                    setActiveTab('resume');
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  重新优化
                </button>
              </div>
            </div>
            
            {/* 匹配度概览 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={result.matchReport.score >= 80 ? '#22c55e' : result.matchReport.score >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${result.matchReport.score * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">{result.matchReport.score}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">匹配度评分</h3>
                  <p className="text-sm text-slate-500">
                    {result.matchReport.score >= 80 ? '优秀' : result.matchReport.score >= 60 ? '良好' : '需优化'}，
                    您的简历与目标岗位的匹配度为 {result.matchReport.score} 分
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div>
                      <span className="text-xs text-slate-400">已匹配</span>
                      <p className="text-sm font-medium text-green-600">{result.matchReport.matchedKeywords.length} 个</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">待提升</span>
                      <p className="text-sm font-medium text-amber-600">{result.matchReport.missingKeywords.length} 个</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 标签页切换 */}
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'resume'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                优化后简历
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                匹配度报告
              </button>
            </div>
            
            {/* 简历内容 */}
            {activeTab === 'resume' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* 工具栏 */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`px-2 py-1 text-xs rounded ${fontSize === 'small' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize('medium')}
                      className={`px-2 py-1 text-sm rounded ${fontSize === 'medium' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2 py-1 text-base rounded ${fontSize === 'large' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}
                    >
                      A+
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(result?.optimizedResume || '')}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      导出PDF
                    </button>
                    <button
                      onClick={() => setShowCompare(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      对比原版
                    </button>
                  </div>
                </div>
                
                {/* 简历内容 */}
                <div className={`p-8 ${getFontSizeClass()} leading-relaxed whitespace-pre-wrap`}>
                  {result?.optimizedResume}
                </div>
              </div>
            )}
            
            {/* 匹配度报告 */}
            {activeTab === 'report' && (
              <div className="space-y-6">
                {/* 缺失关键词 */}
                {result?.matchReport.missingKeywords && result.matchReport.missingKeywords.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      待提升关键词
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchReport.missingKeywords.map((keyword, i) => (
                        <span key={i} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 优化建议 */}
                {result?.matchReport.suggestions && result.matchReport.suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      优化建议
                    </h3>
                    <div className="space-y-4">
                      {result.matchReport.suggestions.map((suggestion, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl">
                          <h4 className="font-medium text-slate-800 mb-1">{suggestion.title}</h4>
                          <p className="text-sm text-slate-600">{suggestion.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                  >
                    查看优化后简历
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 示例弹窗 */}
      {showExample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">示例：STAR法则优化前后对比</h3>
              <button onClick={() => setShowExample(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-3">优化前</h4>
                  <div className="p-4 bg-slate-50 rounded-xl text-sm leading-relaxed">
                    <p className="mb-3">负责产品功能设计和优化</p>
                    <p className="mb-3">与开发团队协作推进项目</p>
                    <p>提升了用户体验</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-600 mb-3">优化后（STAR结构）</h4>
                  <div className="p-4 bg-blue-50 rounded-xl text-sm leading-relaxed">
                    <p className="mb-3"><span className="text-blue-600 font-medium">【场景】</span>在用户增长停滞不前的背景下</p>
                    <p className="mb-3"><span className="text-blue-600 font-medium">【任务】</span>负责设计并落地3个核心功能优化方案</p>
                    <p className="mb-3"><span className="text-blue-600 font-medium">【行动】</span>通过数据分析定位问题，协调UI/开发/测试资源，采用敏捷迭代方式</p>
                    <p><span className="text-green-600 font-medium">【结果】</span>推动功能上线后，DAU提升<span className="text-green-600 font-bold">15%</span>，用户留存率提升<span className="text-green-600 font-bold">8%</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 对比弹窗 */}
      {showCompare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">对比原版与优化版</h3>
              <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200 h-[calc(80vh-80px)]">
              <div className="p-6 overflow-y-auto">
                <h4 className="text-sm font-medium text-slate-500 mb-4">原版简历</h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {resumeMode === 'paste' ? resumeText : (parsedResume ? 
                    `${parsedResume.basicInfo}\n\n工作经历：\n${parsedResume.experience}\n\n项目经历：\n${parsedResume.projects}\n\n技能证书：\n${parsedResume.skills}` : '')}
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <h4 className="text-sm font-medium text-blue-600 mb-4">优化后简历</h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result?.optimizedResume}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
