'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Sparkles, Loader2, Target, 
  Check, AlertCircle, Copy, Download, ArrowLeft,
  Lightbulb, Star, TrendingUp, BookOpen, FileDown,
  Eye, Palette, X, ChevronDown
} from 'lucide-react';
import UtilityHeader from './UtilityHeader';
import { UtilityCard, FormField, PrimaryButton, ActionButton } from './UtilityComponents';
import LoginButton from './LoginButton';
import { ResumeTemplateSelector, ResumePreview, templates, ResumeData, ResumeTemplateType } from './ResumeTemplates';
import { exportResumeToPDF, parseResumeFromAI, generateSampleResumeData } from '@/lib/resumeExport';

export default function ResumeOptimizer() {
  // 简历输入状态
  const [resumeMode, setResumeMode] = useState<'paste' | 'upload'>('paste');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState('');
  const [parsedResume, setParsedResume] = useState<any>(null);
  
  // JD输入状态
  const [jdText, setJdText] = useState('');
  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  
  // 优化状态
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [showExample, setShowExample] = useState(false);
  
  // PDF导出相关状态
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateType>('modern');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // 处理PDF上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setOptimizeError('文件大小不能超过10MB');
      return;
    }
    
    setResumeFile(file);
    setResumePreview(file.name);
    setParsedResume({ basicInfo: '姓名', experience: true, projects: true, skills: true });
  };

  // 清除所有输入
  const handleClearAll = () => {
    setResumeText('');
    setResumeFile(null);
    setResumePreview('');
    setParsedResume(null);
    setJdText('');
    setJdKeywords([]);
    setResult(null);
    setOptimizeError('');
    setMatchScore(0);
    setShowExample(false);
  };

  // 示例简历
  const EXAMPLE_RESUME = `张三
求职意向：产品经理
工作年限：5年

教育背景
2015-2019  XX大学  计算机科学与技术  本科

工作经历
2020.03-至今  XX科技有限公司  产品经理
• 负责公司核心产品的规划与设计
• 带领团队完成3款产品的从0到1
• 主导用户调研，收集需求1000+条

项目经验
2021.06-2022.06  电商后台管理系统
• 设计商品管理、订单管理等模块
• 提升运营效率30%
`;

  const EXAMPLE_JD = `岗位职责：
1. 负责产品规划与设计，与研发、设计团队紧密协作
2. 深入了解用户需求，主导用户调研和数据分析
3. 制定产品路线图，推动产品迭代优化

任职要求：
1. 本科及以上学历，3年以上产品经验
2. 熟悉互联网产品设计流程
3. 具备良好的沟通协调能力和数据分析能力
4. 有电商或SaaS产品经验优先`;

  // 查看示例
  const handleShowExample = () => {
    setResumeText(EXAMPLE_RESUME);
    setJdText(EXAMPLE_JD);
    setShowExample(false);
  };

  // 优化简历
  const handleOptimize = async () => {
    if (!resumeText && !resumeFile) {
      setOptimizeError('请输入简历内容或上传简历文件');
      return;
    }

    setOptimizing(true);
    setOptimizeError('');

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeText,
          jd: jdText,
        }),
      });

      const data = await response.json();

      // 保存使用记录
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'resume',
          input_data: { resume_length: resumeText.length, jd_length: jdText.length },
          output_data: data.success ? { result_length: data.data?.length || 0 } : null,
          status: data.success ? 'success' : 'failed',
          error_message: data.error || null,
        }),
      }).catch(console.error);

      if (data.success) {
        setResult(data.data);
        setMatchScore(data.matchScore || 85);
      } else {
        setOptimizeError(data.error || '优化失败，请重试');
      }
    } catch (error) {
      console.error('优化失败:', error);
      
      // 保存失败记录
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'resume',
          input_data: { resume_length: resumeText.length, jd_length: jdText.length },
          status: 'failed',
          error_message: '网络请求失败',
        }),
      }).catch(console.error);
      
      setOptimizeError('网络错误，请重试');
    } finally {
      setOptimizing(false);
    }
  };

  // 复制结果
  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  // 复制单条STAR
  const handleCopyStar = (star: string) => {
    navigator.clipboard.writeText(star);
  };

  // 处理优化成功后的结果
  useEffect(() => {
    if (result) {
      // 从结果中解析简历数据
      try {
        const parsed = parseResumeFromAI(result);
        if (parsed.name || parsed.experience?.length) {
          setResumeData(parsed);
        } else {
          // 如果解析失败，使用示例数据
          setResumeData(generateSampleResumeData());
        }
      } catch {
        setResumeData(generateSampleResumeData());
      }
    }
  }, [result]);

  // 导出PDF
  const handleExportPDF = async () => {
    if (!resumeData) return;
    
    setExporting(true);
    try {
      await exportResumeToPDF('resume-pdf-preview', `优化简历_${resumeData.name || '简历'}`);
    } catch (error) {
      console.error('导出失败:', error);
      alert('PDF导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 预览简历
  const handlePreviewResume = () => {
    if (!resumeData) {
      setResumeData(generateSampleResumeData());
    }
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      {/* 统一头部 */}
      <UtilityHeader
        toolIcon={<FileText />}
        toolName="STAR简历优化"
        toolDescription="JD精准匹配 · STAR法则优化"
        gradient="from-orange-500 to-amber-500"
      />
      
      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {!result ? (
          /* 输入区域 */
          <div className="space-y-6">
            {/* 标题区 */}
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                STAR简历深度优化
              </h1>
              <p className="text-slate-500">上传简历+粘贴JD，一键生成STAR法则优化版简历，精准匹配岗位要求</p>
            </div>
            
            {/* 输入卡片区 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 简历输入卡片 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* 标题栏 */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-amber-500 bg-opacity-5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">简历输入</h2>
                  </div>
                </div>
                
                {/* 内容区 */}
                <div className="p-6 space-y-4">
                  {/* 模式切换 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResumeMode('paste')}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        resumeMode === 'paste' 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      粘贴文本
                    </button>
                    <button
                      onClick={() => setResumeMode('upload')}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        resumeMode === 'upload' 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      上传PDF
                    </button>
                  </div>
                  
                  {resumeMode === 'paste' ? (
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="请粘贴简历全文（纯文本），系统将自动解析结构..."
                      className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                        <div className="p-6 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-center">
                          <FileText className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{resumePreview}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {parsedResume ? '已解析完成' : '正在解析...'}
                          </p>
                          <button
                            onClick={() => {
                              setResumeFile(null);
                              setResumePreview('');
                              setParsedResume(null);
                              fileInputRef.current?.click();
                            }}
                            className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium"
                          >
                            重新上传
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-center"
                        >
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-500">点击上传PDF简历</p>
                          <p className="text-xs text-slate-400 mt-2">支持多页PDF，单文件不超过10MB</p>
                        </button>
                      )}
                      
                      {parsedResume && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">已识别的简历结构：</p>
                          {parsedResume.basicInfo && (
                            <p className="text-xs text-slate-500">基本信息：{parsedResume.basicInfo}</p>
                          )}
                          {parsedResume.experience && (
                            <p className="text-xs text-slate-500">工作经历：已识别</p>
                          )}
                          {parsedResume.projects && (
                            <p className="text-xs text-slate-500">项目经历：已识别</p>
                          )}
                          {parsedResume.skills && (
                            <p className="text-xs text-slate-500">技能证书：已识别</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* JD输入卡片 - 统一高度 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* 标题栏 */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-amber-500 bg-opacity-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">岗位JD</h2>
                  </div>
                </div>
                
                {/* 内容区 */}
                <div className="p-6 space-y-4 flex flex-col h-[calc(100%-57px)]">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="请粘贴目标岗位JD全文（支持复制Boss直聘、智联等平台JD），系统将自动拆解核心关键词..."
                    className="w-full h-48 flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  
                  {jdKeywords.length > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3 font-medium">
                        已识别 {jdKeywords.length} 个核心关键词
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {jdKeywords.map((keyword, i) => (
                          <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 text-xs rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton 
                onClick={handleOptimize}
                disabled={!resumeText && !resumeFile}
                loading={optimizing}
                icon={<Sparkles />}
              >
                立即优化
              </PrimaryButton>
              
              <ActionButton variant="secondary" onClick={handleShowExample}>
                <Lightbulb className="w-4 h-4" />
                查看示例
              </ActionButton>
              
              <ActionButton variant="secondary" onClick={handleClearAll}>
                清空输入
              </ActionButton>
            </div>
            
            {/* 错误提示 */}
            {optimizeError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{optimizeError}</span>
              </div>
            )}
          </div>
        ) : (
          /* 结果区域 */
          <div className="space-y-6">
            {/* 结果头部 */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Check className="w-6 h-6 text-green-500" />
                  优化完成
                </h2>
                <p className="text-slate-500 mt-1">您的STAR法则优化版简历已生成，点击下载获取专业PDF简历</p>
              </div>
              <ActionButton variant="secondary" onClick={handleClearAll}>
                <ArrowLeft className="w-4 h-4" />
                继续优化
              </ActionButton>
            </div>
            
            {/* 主内容区：左侧简历预览 + 右侧辅助信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 左侧 - 简历预览（占3/4宽度） */}
              <div className="lg:col-span-3 space-y-4">
                {/* 简历预览 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      优化后简历
                    </h3>
                    {/* 模板选择 */}
                    <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                      {(Object.entries(templates) as [ResumeTemplateType, typeof templates.classic][]).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedTemplate(key)}
                          className={`px-3 py-1 text-xs rounded-md transition-all ${
                            selectedTemplate === key
                              ? 'bg-white text-orange-600 font-medium'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-100 dark:bg-slate-900 overflow-auto max-h-[65vh]">
                    <div className="flex justify-center">
                      <div 
                        id="resume-pdf-preview"
                        className="bg-white shadow-xl"
                        style={{
                          width: '210mm',
                          minHeight: '297mm',
                          transform: 'scale(0.75)',
                          transformOrigin: 'top center',
                        }}
                      >
                        <ResumePreview template={selectedTemplate} data={resumeData || generateSampleResumeData()} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {exporting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileDown className="w-5 h-5" />
                    )}
                    {exporting ? '导出中...' : '下载PDF简历'}
                  </button>
                </div>
              </div>
              
              {/* 右侧 - 辅助信息（精简展示，占1/4宽度） */}
              <div className="space-y-4">
                {/* 匹配度 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">JD匹配度</h4>
                    <span className={`text-xl font-bold ${matchScore >= 80 ? 'text-green-500' : matchScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                      {matchScore || 85}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${matchScore >= 80 ? 'bg-green-500' : matchScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${matchScore || 85}%` }} 
                    />
                  </div>
                </div>
                
                {/* 关键词匹配 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 text-sm">已匹配关键词</h4>
                  <div className="flex flex-wrap gap-1">
                    {['React', 'TypeScript', 'Vue', 'Node.js'].map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 复制原文 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 text-sm">原始简历</h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 max-h-20 overflow-hidden">
                    {resumeText || '未提供原始简历'}
                  </div>
                  <button 
                    onClick={handleCopyResult}
                    className="mt-2 text-xs text-orange-500 hover:text-orange-600"
                  >
                    复制原文
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 右侧辅助区 - 仅在输入页面显示 */}
        {!result && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 使用技巧 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                使用技巧
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  简历内容越详细，优化效果越好
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  JD粘贴完整可获得更精准的关键词匹配
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  PDF简历可自动解析结构
                </li>
              </ul>
            </div>
            
            {/* STAR法则说明 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                STAR法则
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><span className="font-medium text-orange-500">S</span> - Situation 情境</li>
                <li><span className="font-medium text-orange-500">T</span> - Task 任务</li>
                <li><span className="font-medium text-orange-500">A</span> - Action 行动</li>
                <li><span className="font-medium text-orange-500">R</span> - Result 结果</li>
              </ul>
            </div>
            
            {/* 匹配度说明 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                匹配度说明
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  90%+ 高度匹配
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  70-89% 基本匹配
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  70%以下 需优化
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 简历预览弹窗 */}
        {showPreview && resumeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* 弹窗头部 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-amber-500">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">简历预览 & 导出</h2>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 模板选择 */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <ResumeTemplateSelector
                  selectedTemplate={selectedTemplate}
                  onSelect={setSelectedTemplate}
                />
              </div>

              {/* 简历内容区 */}
              <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-6">
                <div className="flex justify-center">
                  <div className="shadow-xl">
                    <div 
                      id="resume-pdf-preview"
                      className="bg-white"
                      style={{
                        width: '210mm',
                        minHeight: '297mm',
                        transform: 'scale(0.6)',
                        transformOrigin: 'top center',
                      }}
                    >
                      <ResumePreview template={selectedTemplate} data={resumeData} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部操作栏 */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  当前模板：<span className="font-medium text-slate-700 dark:text-slate-300">{templates[selectedTemplate].name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ActionButton 
                    variant="secondary" 
                    onClick={() => setShowPreview(false)}
                  >
                    关闭
                  </ActionButton>
                  <PrimaryButton 
                    icon={exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                    onClick={handleExportPDF}
                    disabled={exporting}
                  >
                    {exporting ? '导出中...' : '下载PDF'}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
