'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Link2,
  ExternalLink,
  Rocket,
  Info
} from 'lucide-react';

interface PushResult {
  success: boolean;
  message: string;
  data?: {
    success_count: number;
    remain: number;
    not_same_site: number;
    not_valid: number;
  };
}

export default function BaiduPushPage() {
  const [urls, setUrls] = useState('');
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<PushResult | null>(null);
  const [checkingConfig, setCheckingConfig] = useState(false);

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

  // 推送所有工具页面
  const handlePushAllTools = async () => {
    setPushing(true);
    setResult(null);

    try {
      // 调用批量推送 API
      const res = await fetch('/api/admin/tools/push-baidu', {
        method: 'POST',
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: '请求失败，请重试' });
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          百度主动推送
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          快速将页面推送给百度搜索，加快收录速度
        </p>
      </div>

      {/* 说明卡片 */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <p><strong>主动推送</strong>：实时推送新页面到百度，百度蜘蛛会立即抓取。</p>
              <p><strong>推送额度</strong>：每日有推送次数限制，请合理使用。</p>
              <p className="flex items-center gap-2">
                <span>配置位置：</span>
                <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">
                  .env.local → BAIDU_PUSH_API_URL
                </code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 手动推送 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            手动推送 URL
          </CardTitle>
          <CardDescription>
            每行一个 URL，最多 10 条
          </CardDescription>
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
          <div className="flex gap-3">
            <Button 
              onClick={handlePush} 
              disabled={pushing || !urls.trim()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {pushing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  推送中...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  立即推送
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setUrls('')}
              disabled={pushing}
            >
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            快捷操作
          </CardTitle>
          <CardDescription>
            一键推送重要页面
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handlePushAllTools}
              disabled={pushing}
              className="border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              推送所有工具页
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                setUrls('https://oneclaw.shop\nhttps://oneclaw.shop/tools\nhttps://oneclaw.shop/rankings\nhttps://oneclaw.shop/prompts\nhttps://oneclaw.shop/tutorials');
              }}
              disabled={pushing}
              className="border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
            >
              填充首页/列表页
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 推送结果 */}
      {result && (
        <Card className={result.success ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {result.success ? '推送成功' : '推送失败'}
                </h4>
                <p className="text-sm mt-1">{result.message}</p>
                
                {result.data && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                      成功: {result.data.success_count} 条
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">
                      剩余: {result.data.remain} 次
                    </Badge>
                    {result.data.not_same_site > 0 && (
                      <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                        非本站: {result.data.not_same_site} 条
                      </Badge>
                    )}
                    {result.data.not_valid > 0 && (
                      <Badge variant="outline" className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                        无效: {result.data.not_valid} 条
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 状态提示 */}
      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <strong>提示：</strong>百度推送需要先在 
              <a 
                href="https://ziyuan.baidu.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 underline mx-1"
              >
                百度搜索资源平台
              </a>
              获取 API 地址和 Token，然后在 <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env.local</code> 中配置。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
