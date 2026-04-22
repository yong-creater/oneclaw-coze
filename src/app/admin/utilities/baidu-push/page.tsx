'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Clock, Zap, ExternalLink, AlertTriangle } from 'lucide-react';

interface PushResult {
  success: boolean;
  message: string;
  data?: {
    success_count: number;
    remain: number;
    not_same_site?: number;
    not_valid?: number;
  };
}

export default function BaiduPushPage() {
  const [urls, setUrls] = useState('');
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<PushResult | null>(null);
  const [copied, setCopied] = useState(false);

  const cronUrl = 'https://oneclaw.shop/api/cron/baidu-push';
  const cronSecret = '45e871282f696c272dd1f5fb2c72c77d864c33c15942a9ef';
  const fullCronCommand = `curl -X POST -H "Authorization: Bearer ${cronSecret}" ${cronUrl}`;

  // 手动输入 URL 推送
  const handlePush = async () => {
    if (!urls.trim()) return;
    
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urlList.length === 0) return;

    setPushing(true);
    setResult(null);

    try {
      const res = await fetch('/api/seo/baidu-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: '请求失败，请重试' });
    } finally {
      setPushing(false);
    }
  };

  // 复制命令
  const handleCopy = () => {
    navigator.clipboard.writeText(fullCronCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6" />
          百度推送
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          主动推送页面给百度，加快收录速度
        </p>
      </div>

      {/* 额度警告 */}
      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <strong>每日额度有限</strong>：百度每天只允许推送有限次数，用完需等第二天。
              <br />
              <strong>建议</strong>：设置定时任务自动每天推送一次，充分利用额度。
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto">自动定时推送</TabsTrigger>
          <TabsTrigger value="manual">手动推送</TabsTrigger>
        </TabsList>

        {/* 自动推送 */}
        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                自动定时推送
              </CardTitle>
              <CardDescription>
                设置定时任务，每天自动推送给百度
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 推送命令 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">复制以下命令，设置定时任务</label>
                <div className="relative">
                  <code className="block w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                    {fullCronCommand}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* 设置说明 */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">设置步骤：</h4>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
                  <li>
                    访问 
                    <a 
                      href="https://cron-job.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline mx-1"
                    >
                      cron-job.org
                    </a>
                    注册并登录（免费）
                  </li>
                  <li>点击「Create Cronjob」创建新任务</li>
                  <li>URL 填入：<code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">{cronUrl}</code></li>
                  <li>Schedule 设为「Daily」或每天指定时间</li>
                  <li>保存即可，每天自动推送一次</li>
                </ol>
              </div>

              {/* 推送内容说明 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">自动推送包含：</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>首页及主要页面</li>
                  <li>最近添加的 50 个工具详情页</li>
                  <li>每日更新，持续收录</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 手动推送 */}
        <TabsContent value="manual" className="space-y-4">
          {/* 说明卡片 */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>主动推送</strong>：实时推送页面到百度。</p>
                <p><strong>注意</strong>：每日额度有限，建议使用自动推送。</p>
              </div>
            </CardContent>
          </Card>

          {/* 手动推送 */}
          <Card>
            <CardHeader>
              <CardTitle>输入 URL 推送</CardTitle>
              <CardDescription>每行一个 URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`https://oneclaw.shop/tools/1
https://oneclaw.shop/tools/2
https://oneclaw.shop`}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
              <Button 
                onClick={handlePush} 
                disabled={pushing || !urls.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {pushing ? '推送中...' : '立即推送'}
              </Button>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷填充</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUrls('https://oneclaw.shop\nhttps://oneclaw.shop/tools\nhttps://oneclaw.shop/rankings\nhttps://oneclaw.shop/prompts\nhttps://oneclaw.shop/tutorials');
                }}
                className="border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
              >
                填充首页/列表页
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 推送结果 */}
      {result && (
        <Card className={result.success ? 'bg-green-50 dark:bg-green-950/30 border-green-200' : 'bg-red-50 dark:bg-red-950/30 border-red-200'}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {result.success ? '✓' : '✗'}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {result.success ? '推送成功' : '推送失败'}
                </h4>
                <p className="text-sm mt-1">{result.message}</p>
                
                {result.data && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      成功: {result.data.success_count} 条
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                      剩余: {result.data.remain} 次
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
