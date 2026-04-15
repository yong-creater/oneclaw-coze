'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  FileText,
  Feather,
  FlaskConical,
  Check,
  Copy,
  Target,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ALL_CASES, ResumeCase, NovelCase, TestCase } from '@/data/caseStudies';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Feather,
  FlaskConical
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
                timeSaved: (caseData.case as TestCase).result.timeSaved,
                company: '电商后台系统'
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
  const [activeSection, setActiveSection] = useState<'before' | 'jd' | 'after'>('before');
  const [expandedChanges, setExpandedChanges] = useState<number | null>(0);
  
  return (
    <div className="space-y-8">
      {/* 切换标签 */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { key: 'before', label: '原始简历', icon: FileText },
          { key: 'jd', label: '目标JD', icon: Target },
          { key: 'after', label: '优化后', icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeSection === tab.key
                ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 原始简历 */}
      {activeSection === 'before' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="destructive" className="bg-red-100 text-red-600">优化前</Badge>
                <button 
                  onClick={() => onCopy(caseData.before.resume, 'before-resume')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedId === 'before-resume' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">存在的问题：</p>
                <ul className="space-y-1">
                  {caseData.before.highlight.map((item, i) => (
                    <li key={i} className="text-xs text-red-500/80 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                {caseData.before.resume}
              </pre>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-white">目标岗位JD</h3>
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                  {caseData.jd}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* 优化后 */}
      {activeSection === 'after' && (
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-600">优化后</Badge>
                  <span className="text-sm text-slate-500">使用STAR法则 · 量化成果</span>
                </div>
                <button 
                  onClick={() => onCopy(caseData.after.resume, 'after-resume')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedId === 'after-resume' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                {caseData.after.resume}
              </pre>
            </CardContent>
          </Card>
          
          {/* 优化对比 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              关键优化点
            </h3>
            {caseData.after.changes.map((change, i) => (
              <Card key={i} className={`border-orange-200 dark:border-orange-800 ${expandedChanges === i ? 'ring-2 ring-orange-500' : ''}`}>
                <CardContent className="p-4">
                  <button 
                    onClick={() => setExpandedChanges(expandedChanges === i ? null : i)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-through">
                          {change.before}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          → {change.after}
                        </p>
                      </div>
                    </div>
                    {expandedChanges === i ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedChanges === i && (
                    <div className="mt-4 pl-11 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        <span className="font-medium">优化理由：</span>
                        {change.reason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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

// 测试用例案例展示
function TestCaseStudy({ caseData }: { caseData: TestCase }) {
  const [expandedTest, setExpandedTest] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  
  const displayCases = showAll ? caseData.after.testCases : caseData.after.testCases.slice(0, 3);
  
  return (
    <div className="space-y-8">
      {/* 需求对比 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Badge variant="destructive" className="mb-3">原始需求</Badge>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                  {caseData.before.requirement}
                </p>
              </div>
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <span className="font-medium">原测试用例：</span>
                  {caseData.before.testCases.length} 条（覆盖严重不足）
                </p>
              </div>
            </div>
            <div>
              <Badge className="bg-green-100 text-green-600 mb-3">AI生成测试用例</Badge>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {caseData.after.testCases.length} 条
                </p>
                <p className="text-sm text-green-500">完整覆盖所有功能点、异常场景、边界条件</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 测试用例列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            测试用例详情
          </h3>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            {showAll ? '收起' : `查看全部 ${caseData.after.testCases.length} 条`}
          </button>
        </div>
        
        {displayCases.map((tc, i) => (
          <Card 
            key={tc.id} 
            className={`border-violet-200 dark:border-violet-800 ${expandedTest === i ? 'ring-2 ring-violet-500' : ''}`}
          >
            <CardContent className="p-4">
              <button 
                onClick={() => setExpandedTest(expandedTest === i ? null : i)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <span className="text-violet-600 font-mono text-xs">{tc.id}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800 dark:text-white">{tc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{tc.module}</Badge>
                        <Badge className={`text-xs ${
                          tc.priority === 'P0' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {tc.priority}
                        </Badge>
                        <span className="text-xs text-slate-400">{tc.type}</span>
                      </div>
                    </div>
                  </div>
                  {expandedTest === i ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
              
              {expandedTest === i && (
                <div className="mt-4 space-y-3 pl-13">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">前置条件</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{tc.precondition}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">测试步骤</p>
                    <ul className="space-y-1">
                      {tc.steps.map((step, j) => (
                        <li key={j} className="text-sm text-slate-700 dark:text-slate-300">{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-600 mb-1">预期结果</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{tc.expectedResult}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
