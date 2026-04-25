'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WechatConfig {
  id?: number;
  app_id: string;
  qr_code_url: string;
  updated_at?: string;
}

export default function WechatConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<WechatConfig>({
    app_id: '',
    qr_code_url: ''
  });
  const [appSecret, setAppSecret] = useState('');
  const [token, setToken] = useState('');
  const [encodingAesKey, setEncodingAesKey] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/wechat');
      const data = await res.json();
      
      if (data.success && data.data) {
        setConfig({
          id: data.data.id,
          app_id: data.data.app_id || '',
          qr_code_url: data.data.qr_code_url || ''
        });
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: config.app_id,
          app_secret: appSecret || undefined,
          qr_code_url: config.qr_code_url,
          token: token || undefined,
          encoding_aes_key: encodingAesKey || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '保存成功！' });
        fetchConfig();
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' });
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">微信配置</h1>
        <p className="text-slate-500 mt-1">配置微信公众号，用于用户扫码登录</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>配置说明</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2 text-sm">
            <li>登录微信公众平台，获取 AppID 和 AppSecret</li>
            <li>配置服务器地址（URL）为：https://oneclaw.shop/api/wechat/callback</li>
            <li>设置 Token 和 EncodingAESKey（消息加密）</li>
            <li>生成带参数的二维码，将二维码图片URL填入下方</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>公众号配置</CardTitle>
          <CardDescription>填写微信公众号的基本配置信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app_id">AppID (应用ID)</Label>
              <Input
                id="app_id"
                value={config.app_id}
                onChange={(e) => setConfig({ ...config, app_id: e.target.value })}
                placeholder="wx1234567890abcdef"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_secret">AppSecret (应用密钥)</Label>
              <Input
                id="app_secret"
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="请输入AppSecret（修改时填写）"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token (令牌)</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="自定义Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="encoding_aes_key">EncodingAESKey (消息加密密钥)</Label>
              <Input
                id="encoding_aes_key"
                value={encodingAesKey}
                onChange={(e) => setEncodingAesKey(e.target.value)}
                placeholder="43位字符"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>二维码配置</CardTitle>
          <CardDescription>用于用户扫码登录的二维码图片URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr_code_url">二维码图片URL</Label>
            <Textarea
              id="qr_code_url"
              value={config.qr_code_url}
              onChange={(e) => setConfig({ ...config, qr_code_url: e.target.value })}
              placeholder="https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=..."
              rows={3}
            />
            <p className="text-xs text-slate-500">
              从微信公众平台生成带参数的二维码后，将图片URL粘贴到这里
            </p>
          </div>

          {config.qr_code_url && (
            <div className="border rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-500 mb-2">二维码预览：</p>
              <img 
                src={config.qr_code_url} 
                alt="微信二维码" 
                className="w-40 h-40 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).alt = '二维码加载失败';
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => fetchConfig()}>
          重置
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
