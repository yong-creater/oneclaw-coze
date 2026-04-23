'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, Upload, Loader2, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type Step = 'input' | 'preview';

export default function ResumePage() {
  const [step, setStep] = useState<Step>('input');
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [originalResume, setOriginalResume] = useState('');
  const [optimizedResume, setOptimizedResume] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!originalResume.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resume: originalResume,
          jobDescription 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOptimizedResume(data.data);
        setStep('preview');
      }
    } catch (error) {
      console.error('优化失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep('input');
    setOriginalResume('');
    setJobDescription('');
    setOptimizedResume('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xl font-semibold tracking-tight">简历优化</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {step === 'input' ? (
          <>
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-2">AI 简历优化</h1>
              <p className="text-[var(--muted-foreground)]">
                使用 AI 优化你的简历，提升面试机会
              </p>
            </div>

            {/* Input Form */}
            <Card className="mb-6">
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    原始简历内容
                  </label>
                  <Textarea
                    placeholder="粘贴你的简历内容..."
                    value={originalResume}
                    onChange={(e) => setOriginalResume(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    支持粘贴简历文本，建议包含：个人信息、教育背景、工作经历、项目经验、技能等
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    目标职位描述（可选）
                  </label>
                  <Textarea
                    placeholder="粘贴目标职位的 JD，可以更精准地优化简历..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[100px] text-sm"
                  />
                </div>

                <Button 
                  onClick={handleOptimize} 
                  disabled={!originalResume.trim() || loading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      优化中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      开始优化
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-3">优化技巧</h3>
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)] mt-1.5 flex-shrink-0" />
                    使用 STAR 法则描述工作经历（情境、任务、行动、结果）
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)] mt-1.5 flex-shrink-0" />
                    量化成果，使用具体数据和百分比
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)] mt-1.5 flex-shrink-0" />
                    针对不同职位调整简历关键词
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)] mt-1.5 flex-shrink-0" />
                    保持简洁，简历控制在 1-2 页
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Preview */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">优化结果</h2>
                <p className="text-sm text-[var(--muted-foreground)]">AI 已完成简历优化</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </Button>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  重新优化
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {optimizedResume}
                </pre>
              </CardContent>
            </Card>

            {/* Comparison */}
            {originalResume && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  查看原始简历
                </summary>
                <Card className="mt-3">
                  <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-[var(--muted-foreground)]">
                      {originalResume}
                    </pre>
                  </CardContent>
                </Card>
              </details>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2024 OneClaw
          </div>
        </div>
      </footer>
    </div>
  );
}
