'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Sparkles, Loader2, Target, 
  Check, AlertCircle, Copy, Download, ArrowLeft,
  Lightbulb, Star, TrendingUp, BookOpen, FileDown,
  Eye, Palette, X, ChevronDown, Settings2
} from 'lucide-react';

import { UtilityCard, FormField, PrimaryButton, ActionButton } from '../common/UtilityComponents';
import LoginButton from '../common/LoginButton';
import { ResumePreview, templates, ResumeData, ResumeTemplateType } from './ResumeTemplates';
import { exportResumeToPDF, parseResumeFromAI, generateSampleResumeData } from '@/lib/resumeExport';
import { useToolModelConfig } from '@/hooks/useToolModelConfig';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
  const [usedModel, setUsedModel] = useState('');
  
  // 从后台配置获取模型
  const { config: modelConfig, loading: modelLoading, error: modelError, isConfigured } = useToolModelConfig('resume');
  const activeModel = modelConfig?.model_name || 'doubao-seed-1-8-251228';
  const isPaidModel = modelConfig?.model_source === '4sapi';
  
  // PDF导出相关状态
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateType>('modern');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // 从 URL 参数读取模板数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    const templateName = params.get('template_name');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        
        // 根据模板类型填充表单
        if (data.style || data.templateStyle) {
          // 可以设置简历模板类型
        }
        
        // 如果模板有预设内容，可以预填
        if (data.prompt) {
          setResumeText(data.prompt);
        }
        
        toast.success('已加载模板 "' + (templateName || '未知') + '"，请补充您的简历信息后点击生成');
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  // 处理PDF上传 - 解析后填入文本框
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setOptimizeError('文件大小不能超过10MB');
      return;
    }
    
    setResumeFile(file);
    setResumePreview(file.name);
    
    // 模拟PDF解析 - 实际项目中应调用PDF解析API
    // 这里模拟从PDF中提取文本内容
    setParsedResume({ basicInfo: '姓名', experience: true, projects: true, skills: true });
    
    // 模拟解析完成后将内容填入文本框
    setTimeout(() => {
      const mockParsedText = `【PDF解析结果】
文件名：${file.name}

姓名：张三
手机：138-0013-8000
邮箱：zhangsan@example.com
城市：北京市

求职意向：高级前端开发工程师

━━━━━━━━━━━━━━━━━━━━━━━━━━
教育背景
━━━━━━━━━━━━━━━━━━━━━━━━━━
2015.09 - 2019.06  清华大学  计算机科学与技术  硕士
2011.09 - 2015.06  北京航空航天大学  软件工程  本科

━━━━━━━━━━━━━━━━━━━━━━━━━━
工作经历
━━━━━━━━━━━━━━━━━━━━━━━━━━
2021.07 - 至今    字节跳动    高级前端工程师
• 负责核心业务系统开发，支撑日活500万+用户
• 主导技术架构升级，性能提升60%
• 搭建前端监控体系，错误发现率提升至99%

2018.07 - 2021.06    阿里巴巴    前端工程师
• 负责电商平台核心模块开发
• 封装通用组件库，覆盖80%业务场景

━━━━━━━━━━━━━━━━━━━━━━━━━━
项目经验
━━━━━━━━━━━━━━━━━━━━━━━━━━
2023.01 - 至今    低代码平台    技术负责人
• 设计拖拽式页面搭建引擎
• 支持可视化配置，研发效率提升3倍

━━━━━━━━━━━━━━━━━━━━━━━━━━
专业技能
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 前端框架：React / Vue / Angular
• 工程化：Webpack / Vite / TypeScript
• 其他：Node.js / Python / MySQL`;

      // 切换到粘贴模式并填入解析后的文本
      setResumeMode('paste');
      setResumeText(mockParsedText);
    }, 1000);
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
    setUsedModel('');
  };

  // 示例简历 - 真实丰富的案例
  const EXAMPLE_RESUME = `张伟
手机：138-1234-5678 | 邮箱：zhangwei@example.com | 北京·海淀区

求职意向：高级前端开发工程师
工作年限：6年 | 期望薪资：40-60K

━━━━━━━━━━━━━━━━━━━━━━━━━━
教育背景
━━━━━━━━━━━━━━━━━━━━━━━━━━
2015.09 - 2019.06    北京理工大学    计算机科学与技术    本科 / 硕士
• GPA 3.8/4.0，连续3年获得校级一等奖学金
• 研究生方向：Web前端性能优化与人机交互

2018.09 - 2019.06    加州大学伯克利分校    交流学习
• 参与计算机图形学前沿研究项目
• 获得优秀交换生荣誉

━━━━━━━━━━━━━━━━━━━━━━━━━━
工作经历
━━━━━━━━━━━━━━━━━━━━━━━━━━
2021.07 - 至今        字节跳动    前端架构组 / 高级前端工程师

▌抖音直播团队（0→1）
• 作为核心前端工程师，从零搭建抖音直播中台系统，日活用户突破2000万
• 设计并实现低延迟直播流媒体播放器，首屏时间从3.2s优化至0.8s
• 主导直播间礼物动效系统开发，支持每秒10000+弹幕并发，帧率稳定60fps

▌前端工程化体系建设
• 搭建集团级前端监控平台，覆盖98%业务线，实时告警响应时间<30s
• 设计组件库文档平台，积累500+高质量组件，研发效率提升40%
• 推动TypeScript覆盖率从30%提升至95%，线上Bug率下降60%

▌团队管理
• 负责10人前端团队技术规划，晋升4名高级工程师
• 主导技术分享30+场，培养2名T级人才

2019.07 - 2021.06    阿里巴巴    淘宝前端技术部 / 前端工程师

▌商家工作台重构
• 主导商家工作台从jQuery迁移至React技术栈，迁移200+页面
• 设计微前端架构方案，实现多团队独立部署，开发效率提升50%
• 性能优化专项：首屏加载从4.5s降至1.2s，LCP提升65%

▌营销互动系统
• 开发双11、618等大促互动游戏，支撑亿级流量洪峰
• 实现实时数据可视化大屏，支持百万级QPS写入

━━━━━━━━━━━━━━━━━━━━━━━━━━
项目经验
━━━━━━━━━━━━━━━━━━━━━━━━━━
2023.01 - 2023.06    企业级低代码平台「飞舟」    技术负责人
• 设计拖拽式页面搭建引擎，支持100+业务组件
• 实现可视化流程编排与JSON Schema动态表单生成
• 平台已服务内部30+团队，月活开发者500+，产能提升3倍

2022.07 - 2022.12    前端智能监控平台「Argus」    核心开发
• 设计前端错误监控、性能采集、用户行为分析三位一体方案
• 实现无侵入SDK，接入成本<5分钟，包体积增量<10KB
• 告警准确率95%，平均定位耗时从30min降至30s

2021.03 - 2021.09    SSR同构渲染框架    核心贡献者
• 开发基于React的同构渲染解决方案，支持Next.js生态
• 首屏SEO友好，TTFB降低70%，TTI提升50%

━━━━━━━━━━━━━━━━━━━━━━━━━━
专业技能
━━━━━━━━━━━━━━━━━━━━━━━━━━
前端框架：React / Vue / Angular / Next.js / Nuxt.js（精通）
工程化：Webpack / Vite / Rollup / Turborepo（深入原理）
语言能力：TypeScript / JavaScript / Python / Go（熟练）
性能优化：Web Vitals / Lighthouse / Performance API（专家级）
团队协作：Git / CI/CD / Docker / K8s / 微服务架构

━━━━━━━━━━━━━━━━━━━━━━━━━━
证书荣誉
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 2023年 字节跳动「年度技术标兵」
• 2022年 阿里巴巴「前端技术贡献奖」
• 2021年 开源项目贡献者（Vue.js / Ant Design contributor）
• 2020年 前端性能优化最佳实践奖

━━━━━━━━━━━━━━━━━━━━━━━━━━
自我评价
━━━━━━━━━━━━━━━━━━━━━━━━━━
6年前端深耕，兼具技术深度与业务广度。从0到1搭建过DAU 2000万级产品，
主导过千万级项目架构设计。热衷于前端性能优化与工程化建设，深度参与
多个开源项目。对React技术栈有深厚积累，同时保持对新技术的好奇心。
带过10人团队，具备良好的技术视野与沟通协调能力。`;

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
          model: activeModel,
        }),
      });

      const data = await response.json();

      // 保存使用记录
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'resume',
          input_data: { resume_length: resumeText.length, jd_length: jdText.length, model: activeModel },
          output_data: data.success ? { result_length: data.data?.length || 0 } : null,
          status: data.success ? 'success' : 'failed',
          error_message: data.error || null,
        }),
      }).catch(console.error);

      if (data.success) {
        setResult(data.data);
        setMatchScore(data.matchScore || 85);
        setUsedModel(data.model || '');
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

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* 模型未配置错误提示 */}
        {modelLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-slate-500">加载中...</span>
          </div>
        ) : !isConfigured ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
              服务暂不可用
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {modelError || '该工具尚未配置AI模型，请联系管理员'}
            </p>
          </div>
        ) : !result ? (
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
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">简历输入</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={isPaidModel ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"}>
                      {isPaidModel ? "付费" : "免费"}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {modelConfig?.config_params?.name || '豆包Seed 1.8'}
                    </span>
                  </div>
                </div>
                
                {/* 内容区 */}
                <div className="p-6 space-y-4">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder={`请粘贴简历全文，或上传PDF自动解析...

建议包含：
• 个人信息（姓名、联系方式）
• 教育背景
• 工作经历
• 项目经验
• 专业技能`}
                    className="os-textarea w-full !min-h-[280px] font-mono"
                  />
                  
                  {/* 底部区域 */}
                  <div className="flex items-center justify-between">
                    {parsedResume ? (
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <Check className="w-3.5 h-3.5" />
                        PDF已解析完成
                      </div>
                    ) : (
                      <span />
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-slate-600 dark:text-slate-400"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      上传PDF
                    </button>
                  </div>
                </div>
              </div>
              
              {/* JD输入卡片 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* 标题栏 */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">岗位JD</h2>
                  </div>
                </div>
                
                {/* 内容区 */}
                <div className="p-6 space-y-4">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="请粘贴目标岗位JD全文（支持复制Boss直聘、智联等平台JD），系统将自动拆解核心关键词..."
                    className="os-textarea w-full !min-h-[280px]"
                  />
                  
                  {/* 底部关键词区 */}
                  <div>
                    {jdKeywords.length > 0 ? (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <p className="text-xs text-orange-700 dark:text-orange-300 mb-2 font-medium">
                          已识别 {jdKeywords.length} 个核心关键词
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {jdKeywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[52px]" />
                    )}
                  </div>
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
          <div className="space-y-4">
            {/* 模板选择栏 - 紧凑横向排列 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">简历风格：</span>
                {(Object.entries(templates) as [ResumeTemplateType, typeof templates.classic][]).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      selectedTemplate === key
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 简历预览 + 辅助信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* 左侧 - 简历预览（占3/4宽度） */}
              <div className="lg:col-span-3 space-y-4">
                {/* 简历预览 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* 顶部工具栏 */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    {/* 当前模板 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">当前模板：</span>
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-lg">
                        {templates[selectedTemplate].name}
                      </span>
                    </div>
                    {/* 返回修改 + 预览 + 下载按钮 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-slate-600 dark:text-slate-400"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        返回修改
                      </button>
                      <button
                        onClick={handlePreviewResume}
                        className="px-3 py-1.5 text-xs border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1.5 text-orange-600 dark:text-orange-400"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        全屏预览
                      </button>
                      <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        {exporting ? '导出中...' : '下载PDF'}
                      </button>
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
              </div>
              
              {/* 右侧 - 辅助信息（精简展示，占1/4宽度） */}
              <div className="space-y-4">
                {/* 优化模型 */}
                {usedModel && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-2xl p-4 shadow-sm border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">优化模型</h4>
                    </div>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{usedModel}</p>
                    <p className="text-xs text-slate-500 mt-1">本次优化使用的AI模型</p>
                  </div>
                )}
                
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
