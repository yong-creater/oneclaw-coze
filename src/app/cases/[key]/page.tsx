'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  FileText,
  Feather,
  FlaskConical,
  Globe,
  Check,
  Copy,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Shield,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { ALL_CASES, ResumeCase, NovelCase, TestCase, TestCaseStep, TestCaseDetail, ProductCase } from '@/data/caseStudies';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Feather,
  FlaskConical,
  Globe
};

export default function CaseStudyPage() {
  const params = useParams();
  const router = useRouter();
  const key = params.key as string;
  const [activeTab, setActiveTab] = useState<'before' | 'jd' | 'after'>('before');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const caseData = ALL_CASES.find(c => c.key === key);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">案例不存在</h1>
          <Link href="/" className="text-orange-500 hover:text-orange-600">
            返回首页
          </Link>
        </div>
      </div>
    );
  }
  
  const Icon = ICON_MAP[caseData.icon] || FileText;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </Link>
          <Link 
            href={`/${key}`}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
          >
            立即使用
          </Link>
        </div>
      </div>
      
      {/* 案例头部 */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${caseData.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <Badge variant="outline" className="border-orange-400 text-orange-400 mb-2">
                真实案例
              </Badge>
              <h1 className="text-3xl font-bold">{caseData.case.title}</h1>
              <p className="text-slate-400 mt-1">{caseData.case.subtitle}</p>
            </div>
          </div>
          
          {/* 结果展示 */}
          {key === 'resume' && (
            <ResultShowcase 
              data={{
                interviewRate: (caseData.case as ResumeCase).result.interviewRate,
                salary: (caseData.case as ResumeCase).result.salary,
                company: (caseData.case as ResumeCase).result.company
              }}
            />
          )}
          {key === 'novel' && (
            <ResultShowcase 
              data={{
                views: (caseData.case as NovelCase).result.views,
                revenue: (caseData.case as NovelCase).result.revenue,
                company: (caseData.case as NovelCase).result.platform
              }}
            />
          )}
          {key === 'testcraft' && (
            <ResultShowcase 
              data={{
                coverage: (caseData.case as TestCase).result.coverage,
                efficiency: (caseData.case as TestCase).result.efficiency,
                company: '电商后台系统'
              }}
            />
          )}
          {key === 'product-page' && (
            <ResultShowcase 
              data={{
                conversion: (caseData.case as ProductCase).result.conversion,
                platforms: (caseData.case as ProductCase).result.platforms,
                regions: (caseData.case as ProductCase).result.regions
              }}
            />
          )}
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {key === 'resume' && (
          <ResumeCaseStudy 
            caseData={caseData.case as ResumeCase} 
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        )}
        {key === 'novel' && (
          <NovelCaseStudy 
            caseData={caseData.case as NovelCase} 
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        )}
        {key === 'testcraft' && (
          <TestCaseStudy caseData={caseData.case as TestCase} />
        )}
        {key === 'product-page' && (
          <ProductCaseStudy caseData={caseData.case as ProductCase} />
        )}
      </div>
      
      {/* CTA区域 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好创造你的成功故事了吗？
          </h2>
          <p className="text-white/80 mb-6">
            立即体验 OneClaw {caseData.name}，下一个成功案例就是你
          </p>
          <Link 
            href={`/${key}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-500 font-bold text-lg rounded-xl hover:bg-orange-50 transition-all shadow-xl"
          >
            立即开始
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// 结果展示组件
function ResultShowcase({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data);
  
  return (
    <div className="grid grid-cols-3 gap-4 mt-8">
      {entries.map(([k, value]) => (
        <div key={k} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-slate-400 text-sm">
            {k === 'interviewRate' && '面试邀约率'}
            {k === 'salary' && '入职薪资'}
            {k === 'company' && '入职公司'}
            {k === 'views' && '播放量'}
            {k === 'revenue' && '月收入'}
            {k === 'coverage' && '测试覆盖率'}
            {k === 'timeSaved' && '节省时间'}
            {k === 'efficiency' && '生成效率'}
          </p>
        </div>
      ))}
    </div>
  );
}

// 简历案例展示
function ResumeCaseStudy({ caseData, onCopy, copiedId }: { 
  caseData: ResumeCase; 
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');
  
  return (
    <div className="space-y-6">
      {/* Tab切换 */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('after')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'after'
              ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          优化后
        </button>
        <button
          onClick={() => setActiveTab('before')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'before'
              ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          优化前
        </button>
      </div>
      
      {activeTab === 'before' ? (
        <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="destructive" className="bg-red-100 text-red-600">原始简历</Badge>
              <button 
                onClick={() => onCopy(caseData.before.resume, 'before-resume')}
                className="text-slate-400 hover:text-slate-600"
              >
                {copiedId === 'before-resume' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">存在问题：</p>
              <ul className="space-y-1">
                {caseData.before.highlight.map((item, i) => (
                  <li key={i} className="text-sm text-red-500/80 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl leading-relaxed">
              {caseData.before.resume}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-green-100 text-green-600">优化后简历</Badge>
                <button 
                  onClick={() => onCopy(caseData.after.resume, 'after-resume')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedId === 'after-resume' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl leading-relaxed">
                {caseData.after.resume}
              </pre>
            </CardContent>
          </Card>
          
          {/* 关键优化 */}
          <Card className="bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-orange-500" />
                关键优化
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caseData.after.changes.map((change, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-500 font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400 line-through">{change.before}</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">{change.after}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// 小说案例展示
function NovelCaseStudy({ caseData, onCopy, copiedId }: { 
  caseData: NovelCase; 
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  return (
    <div className="space-y-8">
      {/* 切换 */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setShowOriginal(false)}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !showOriginal
              ? 'bg-white dark:bg-slate-700 text-purple-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          优化后内容
        </button>
        <button
          onClick={() => setShowOriginal(true)}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            showOriginal
              ? 'bg-white dark:bg-slate-700 text-slate-600 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          原始内容
        </button>
      </div>
      
      {showOriginal ? (
        <Card className="bg-white dark:bg-slate-800 border-slate-200">
          <CardContent className="p-6">
            <Badge variant="outline" className="mb-4">原始小说内容</Badge>
            <pre className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {caseData.before.content}
            </pre>
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <span className="font-medium">问题分析：</span>
                {caseData.before.style}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-purple-100 text-purple-600">优化后短剧脚本</Badge>
              <button 
                onClick={() => onCopy(caseData.after.content, 'novel-after')}
                className="text-slate-400 hover:text-slate-600"
              >
                {copiedId === 'novel-after' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {caseData.after.content}
            </pre>
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">优化亮点：</span>
                {caseData.after.style}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 测试用例案例展示 - 展示拆解过程和最终测试用例成果
function TestCaseStudy({ caseData }: { caseData: TestCase }) {
  const [expandedCase, setExpandedCase] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'cases'>('summary');
  
  const levelColors: Record<string, string> = {
    'P0': 'bg-red-100 text-red-600',
    'P1': 'bg-amber-100 text-amber-600',
    'P2': 'bg-blue-100 text-blue-600'
  };
  
  const typeColors: Record<string, string> = {
    '功能测试': 'bg-green-100 text-green-600',
    '异常测试': 'bg-orange-100 text-orange-600',
    '边界测试': 'bg-purple-100 text-purple-600'
  };
  
  return (
    <div className="space-y-8">
      {/* 需求输入 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{caseData.requirement.description}</h3>
              <p className="text-sm text-slate-500">{caseData.subtitle}</p>
            </div>
          </div>
          
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
            <p className="text-sm font-medium text-violet-600 mb-2">需求拆解要点：</p>
            <ul className="space-y-1">
              {caseData.requirement.details.map((detail, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">{i + 1}.</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* 智能拆解结果 */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">AI智能拆解结果</h3>
                <p className="text-xs text-slate-500">自动分析功能模块 · 识别测试场景 · 生成完整用例</p>
              </div>
            </div>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-violet-600">{caseData.stats.modules}</p>
              <p className="text-xs text-slate-500">功能模块</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-fuchsia-600">{caseData.stats.scenarios}</p>
              <p className="text-xs text-slate-500">测试场景</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{caseData.stats.cases}</p>
              <p className="text-xs text-slate-500">测试用例</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-red-500">{caseData.stats.p0}</p>
              <p className="text-xs text-slate-500">P0用例</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-500">{caseData.stats.p1}</p>
              <p className="text-xs text-slate-500">P1用例</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-500">{caseData.stats.p2}</p>
              <p className="text-xs text-slate-500">P2用例</p>
            </div>
          </div>
          
          {/* Tab切换 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'summary'
                  ? 'bg-violet-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              功能模块
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cases'
                  ? 'bg-violet-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              测试用例详情 ({caseData.stats.cases}条)
            </button>
          </div>
          
          {activeTab === 'summary' ? (
            /* 功能模块列表 */
            <div className="space-y-3">
              {caseData.breakdown.modules.map((mod) => (
                <div 
                  key={mod.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center">
                      <span className="font-mono text-sm font-bold text-violet-600">{mod.id}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white">{mod.name}</p>
                      <p className="text-xs text-slate-500">{mod.description}</p>
                    </div>
                    <Badge variant="outline">{mod.scenarios.length} 场景</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mod.scenarios.map((scenario, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300"
                      >
                        {scenario}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 测试用例详情列表 */
            <div className="space-y-3">
              {caseData.breakdown.testCases.map((tc, i) => (
                <Card 
                  key={tc.id}
                  className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all ${
                    expandedCase === i ? 'ring-2 ring-violet-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <button 
                      onClick={() => setExpandedCase(expandedCase === i ? null : i)}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-16 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="font-mono text-xs font-bold text-violet-600">{tc.id}</span>
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white truncate">{tc.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${levelColors[tc.level]}`}>{tc.level}</Badge>
                              <Badge className={`text-xs ${typeColors[tc.type]}`}>{tc.type}</Badge>
                              <span className="text-xs text-slate-400 hidden sm:inline">{tc.module}</span>
                            </div>
                          </div>
                        </div>
                        {expandedCase === i ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                    
                    {expandedCase === i && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                        {/* 前置条件 */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-2">前置条件</p>
                          <ul className="space-y-1">
                            {tc.precondition.map((pre, j) => (
                              <li key={j} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <span className="text-violet-400">•</span>
                                {pre}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* 测试步骤 */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-2">测试步骤</p>
                          <div className="space-y-2">
                            {tc.steps.map((step) => (
                              <div key={step.step} className="flex gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-500">
                                  {step.step}
                                </div>
                                <div className="flex-1">
                                  <p className="text-slate-700 dark:text-slate-300">
                                    <span className="font-medium">操作：</span>{step.action}
                                    {step.data && <span className="text-slate-400"> [{step.data}]</span>}
                                  </p>
                                  <p className="text-green-600 dark:text-green-400 mt-1">
                                    <span className="font-medium">预期：</span>{step.expected}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2">
                          {tc.tags.map((tag, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 效果数据 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-green-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-3xl font-bold mb-1">{caseData.result.efficiency}</p>
            <p className="text-sm opacity-80">测试用例生成效率</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500 to-purple-500 border-violet-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-3xl font-bold mb-1">{caseData.result.coverage}</p>
            <p className="text-sm opacity-80">功能场景覆盖率</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 出海详情页案例展示 - 展示原始图和各地区优化后的详情图
function ProductCaseStudy({ caseData }: { caseData: ProductCase }) {
  const [activeRegion, setActiveRegion] = useState<string>('eu');
  const [showOriginal, setShowOriginal] = useState(false);
  
  const regionColors: Record<string, string> = {
    eu: 'from-blue-500 to-indigo-500',
    us: 'from-green-500 to-emerald-500',
    jp: 'from-rose-500 to-pink-500',
    sea: 'from-yellow-500 to-orange-500'
  };
  
  const currentRegion = caseData.regions.find(r => r.id === activeRegion);
  
  return (
    <div className="space-y-8">
      {/* 商品信息 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{caseData.product}</h3>
              <p className="text-sm text-slate-500">{caseData.subtitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 原始图 vs 优化后图 对比展示 */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">AI详情图生成效果</h3>
              <p className="text-xs text-slate-500">一键生成各地区合规详情图</p>
            </div>
          </div>
          
          {/* 地区切换 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setShowOriginal(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                showOriginal
                  ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              原始图
            </button>
            {caseData.regions.map(region => (
              <button
                key={region.id}
                onClick={() => { setActiveRegion(region.id); setShowOriginal(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  !showOriginal && activeRegion === region.id
                    ? `bg-gradient-to-r ${regionColors[region.id]} text-white shadow-md`
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
          
          {/* 图片展示 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {showOriginal ? (
              /* 原始图 */
              <div className="relative">
                <div className="relative h-[400px] bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20">
                  <Image 
                    src={caseData.originalImage} 
                    alt="原始详情图"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    原始版本
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-3 rounded-xl">
                    <p className="text-sm font-medium mb-1">存在的问题</p>
                    <ul className="text-xs space-y-0.5 opacity-90">
                      <li>• 无合规标识（CE/FCC/PSE）</li>
                      <li>• 中文素材，不符合海外市场</li>
                      <li>• 夸大宣传用语</li>
                      <li>• 无本地化语言</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : currentRegion && (
              /* 各地区优化后的图 */
              <div className="relative">
                <div className="relative h-[400px]">
                  <Image 
                    src={currentRegion.image} 
                    alt={`${currentRegion.name}详情图`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentRegion.name}
                  </div>
                </div>
                
                {/* 合规信息 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-slate-800 dark:text-white">合规评分</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          style={{ width: `${currentRegion.complianceScore}%` }}
                        />
                      </div>
                      <span className="text-xl font-bold text-green-600">{currentRegion.complianceScore}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {currentRegion.marks.map((mark, i) => (
                      <Badge 
                        key={i}
                        className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {mark}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 效果数据 */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{caseData.regions.length}</p>
              <p className="text-xs text-slate-500 mt-1">地区版本</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-500">98%+</p>
              <p className="text-xs text-slate-500 mt-1">合规通过率</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-violet-500">{caseData.result.conversion}</p>
              <p className="text-xs text-slate-500 mt-1">转化率提升</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 合规问题修复 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">合规问题修复</h3>
          </div>
          
          <div className="space-y-3">
            {caseData.complianceSummary.issues.map((issue, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 text-sm">✕</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500 line-through truncate">{issue.original}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium truncate">{issue.fixed}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 效果数据卡 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-2xl font-bold mb-1">{caseData.result.conversion}</p>
            <p className="text-xs opacity-80">转化率提升</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500 to-purple-500 border-violet-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-2xl font-bold mb-1">{caseData.result.regions.split('/').length}个</p>
            <p className="text-xs opacity-80">覆盖地区</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 border-orange-200">
          <CardContent className="p-6 text-center text-white">
            <p className="text-2xl font-bold mb-1">3分钟</p>
            <p className="text-xs opacity-80">生成一套素材</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
