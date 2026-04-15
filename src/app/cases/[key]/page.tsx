'use client';

import { useEffect, useState } from 'react';
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
import { ALL_CASES, ResumeCase, NovelCase, TestCase, ProductCase } from '@/data/caseStudies';

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
                timeSaved: (caseData.case as TestCase).result.timeSaved,
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
  const [showAfter, setShowAfter] = useState(false);
  
  return (
    <div className="space-y-6">
      {!showAfter ? (
        <>
          {/* 优化前 - 原始简历 */}
          <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="destructive" className="bg-red-100 text-red-600">优化前</Badge>
                <button 
                  onClick={() => onCopy(caseData.before.resume, 'before-resume')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedId === 'before-resume' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">存在问题：</p>
                <ul className="space-y-0.5">
                  {caseData.before.highlight.map((item, i) => (
                    <li key={i} className="text-xs text-red-500/80 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl leading-relaxed">
                {caseData.before.resume}
              </pre>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowAfter(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              查看优化结果
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* 优化后 */}
          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-green-100 text-green-600">优化后</Badge>
                <button 
                  onClick={() => onCopy(caseData.after.resume, 'after-resume')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedId === 'after-resume' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl leading-relaxed">
                {caseData.after.resume}
              </pre>
            </CardContent>
          </Card>
          
          {/* 关键优化 */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              关键优化
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {caseData.after.changes.map((change, i) => (
                <Card key={i} className="border-orange-100 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                  <CardContent className="p-2.5">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-500 font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 line-through truncate">{change.before}</p>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">{change.after}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline"
              onClick={() => setShowAfter(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回原始简历
            </Button>
          </div>
        </>
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

// 测试用例案例展示 - 展示工具最终输出的拆解效果
function TestCaseStudy({ caseData }: { caseData: TestCase }) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'modules' | 'scenarios'>('modules');
  
  return (
    <div className="space-y-8">
      {/* 需求输入 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-slate-500">输入需求</Badge>
            <span className="text-xs text-slate-400">电商后台订单系统</span>
          </div>
          <pre className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
            {caseData.before.requirement}
          </pre>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <span className="font-medium">原测试用例：</span>
              仅 {caseData.before.testCases.length} 条，覆盖严重不足
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* 智能拆解结果 */}
      <Card className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-violet-200 dark:border-violet-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">AI智能拆解结果</h3>
                <p className="text-xs text-slate-500">基于需求自动分析功能模块与测试场景</p>
              </div>
            </div>
            <Badge className="bg-violet-100 text-violet-600">{caseData.after.summary.totalCases} 条用例</Badge>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-violet-600">{caseData.after.summary.totalModules}</p>
              <p className="text-xs text-slate-500 mt-1">功能模块</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-fuchsia-600">{caseData.after.summary.totalScenarios}</p>
              <p className="text-xs text-slate-500 mt-1">测试场景</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{caseData.after.summary.totalCases}</p>
              <p className="text-xs text-slate-500 mt-1">测试用例</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{caseData.after.summary.coverage}</p>
              <p className="text-xs text-slate-500 mt-1">覆盖率</p>
            </div>
          </div>
          
          {/* 功能模块展示 */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">功能模块拆解</h4>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            
            {caseData.after.modules.map((mod, i) => (
              <Card 
                key={mod.id}
                className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all ${
                  expandedModule === i ? 'ring-2 ring-violet-500' : 'hover:border-violet-300'
                }`}
              >
                <CardContent className="p-4">
                  <button 
                    onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center">
                          <span className="font-mono text-sm font-bold text-violet-600">{mod.id}</span>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800 dark:text-white">{mod.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {mod.scenarios.length} 个场景
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{mod.description}</p>
                        </div>
                      </div>
                      {expandedModule === i ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedModule === i && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-500 mb-3">覆盖测试场景：</p>
                      <div className="flex flex-wrap gap-2">
                        {mod.scenarios.map((scenario, j) => (
                          <Badge 
                            key={j}
                            variant="secondary"
                            className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {scenario}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 效果对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <Badge variant="destructive" className="mb-4">优化前</Badge>
            <div className="space-y-2">
              {caseData.before.testCases.map((tc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-red-400">-</span>
                  {tc}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                覆盖率仅 6%，功能场景缺失严重
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <Badge className="bg-green-100 text-green-600 mb-4">AI优化后</Badge>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{caseData.after.summary.totalModules}</p>
                <p className="text-xs text-green-500">功能模块</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{caseData.after.summary.totalCases}</p>
                <p className="text-xs text-green-500">测试用例</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">
                覆盖率 {caseData.after.summary.coverage}，覆盖所有功能点、异常场景、边界条件
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 出海详情页案例展示 - 展示工具最终输出的各地区合规详情图
function ProductCaseStudy({ caseData }: { caseData: ProductCase }) {
  const [activeRegion, setActiveRegion] = useState<string>('eu');
  
  const regionColors: Record<string, string> = {
    eu: 'from-blue-500 to-indigo-500',
    us: 'from-green-500 to-emerald-500',
    jp: 'from-rose-500 to-pink-500',
    sea: 'from-yellow-500 to-orange-500'
  };
  
  const currentRegion = caseData.after.regionImages.find(r => r.region === activeRegion);
  
  return (
    <div className="space-y-8">
      {/* 商品信息 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{caseData.product}</h3>
              <p className="text-sm text-slate-500">{caseData.subtitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 各地区详情图展示 */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">AI生成 - 各地区详情图</h3>
              <p className="text-xs text-slate-500">自动适配法规要求 + 文化习惯 + 平台规范</p>
            </div>
          </div>
          
          {/* 地区切换 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {caseData.after.regionImages.map(region => (
              <button
                key={region.region}
                onClick={() => setActiveRegion(region.region)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeRegion === region.region
                    ? `bg-gradient-to-r ${regionColors[region.region]} text-white shadow-md`
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {region.regionName}
              </button>
            ))}
          </div>
          
          {/* 当前地区详情图预览 */}
          {currentRegion && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
              {/* 图片展示区 */}
              <div className={`relative h-64 bg-gradient-to-br ${regionColors[currentRegion.region]} opacity-90`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-6 max-w-md text-center shadow-xl">
                    <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">详情图预览</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{currentRegion.imageDescription}</p>
                  </div>
                </div>
                
                {/* 地区标识 */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {currentRegion.regionName}
                  </span>
                </div>
              </div>
              
              {/* 合规信息 */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-slate-800 dark:text-white">合规评分</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        style={{ width: `${currentRegion.compliance.score}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-green-600">{currentRegion.compliance.score}%</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {currentRegion.compliance.marks.map((mark, i) => (
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
        </CardContent>
      </Card>
      
      {/* 合规修复对比 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">合规问题修复</h3>
          </div>
          
          <div className="space-y-3">
            {caseData.after.complianceSummary.issues.map((issue, i) => (
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
      
      {/* 效果对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <Badge variant="destructive" className="mb-4">优化前</Badge>
            <div className="space-y-2">
              {caseData.before.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-red-400 mt-0.5">-</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                存在多地区下架风险，转化率低
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <Badge className="bg-green-100 text-green-600 mb-4">AI优化后</Badge>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{caseData.after.regionImages.length}</p>
                <p className="text-xs text-green-500">地区版本</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">98%+</p>
                <p className="text-xs text-green-500">合规通过率</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">
                {caseData.after.complianceSummary.overall}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
