'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bot, QrCode, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginUrl, setLoginUrl] = useState('');
  const [sceneId, setSceneId] = useState('');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'scanned' | 'confirmed'>('idle');
  const [loading, setLoading] = useState(false);
  const [mockLogin, setMockLogin] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='));
    
    if (token) {
      fetch('/api/auth?action=check', {
        headers: { Cookie: `user_token=${token.value}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            router.push('/');
          }
        })
        .catch(() => {});
    }
  }, [router]);

  // 获取登录二维码
  const getQrcode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth?action=qrcode');
      const data = await res.json();
      if (data.success) {
        setLoginUrl(data.data.url);
        setSceneId(data.data.scene_id);
        setStatus('waiting');
        pollStatus(data.data.scene_id);
      }
    } catch (e) {
      console.error('获取二维码失败', e);
    }
    setLoading(false);
  };

  // 轮询扫码状态
  const pollStatus = (sceneId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth?action=check&scene_id=${sceneId}`);
        const data = await res.json();
        if (data.success) {
          const state = data.data.state;
          if (state === 'scanned') {
            setStatus('scanned');
          } else if (state === 'confirmed') {
            setStatus('confirmed');
            clearInterval(interval);
            // 设置cookie
            document.cookie = `user_token=${data.data.token}; path=/; max-age=${30 * 24 * 60 * 60}`;
            router.push('/');
          } else if (state === 'expired') {
            setStatus('idle');
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error('检查状态失败', e);
      }
    }, 2000);
  };

  // 模拟登录（开发环境用）
  const handleMockLogin = async () => {
    setMockLogin(true);
    try {
      const res = await fetch('/api/auth?action=mock');
      const data = await res.json();
      if (data.success) {
        document.cookie = `user_token=${data.data.token}; path=/; max-age=${30 * 24 * 60 * 60}`;
        router.push('/');
      }
    } catch (e) {
      console.error('模拟登录失败', e);
    }
    setMockLogin(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300 flex items-center justify-center"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">登录 OneClaw</h1>
            <p className="text-sm text-muted-foreground mt-2">
              扫码登录以使用收藏、评分等功能
            </p>
          </div>

          {/* 登录卡片 */}
          <div className="bg-card rounded-2xl p-8 shadow-sm">
            {status === 'idle' ? (
              <div className="text-center">
                <div className="w-48 h-48 bg-muted rounded-xl mx-auto mb-6 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <Button 
                  onClick={getQrcode} 
                  disabled={loading}
                  className="w-full cursor-pointer"
                >
                  {loading ? '加载中...' : '获取登录二维码'}
                </Button>
                
                {/* 开发环境模拟登录 */}
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    onClick={handleMockLogin}
                    disabled={mockLogin}
                    className="w-full mt-3 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {mockLogin ? '登录中...' : '模拟登录 (开发环境)'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center">
                {/* 二维码 */}
                <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 overflow-hidden">
                  {loginUrl ? (
                    <img src={loginUrl} alt="登录二维码" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 状态提示 */}
                <div className="space-y-2">
                  {status === 'waiting' && (
                    <p className="text-sm text-muted-foreground">
                      请使用微信扫码登录
                    </p>
                  )}
                  {status === 'scanned' && (
                    <p className="text-sm text-primary">
                      已扫码，请在手机上确认登录
                    </p>
                  )}
                  {status === 'confirmed' && (
                    <p className="text-sm text-green-600">
                      登录成功，跳转中...
                    </p>
                  )}
                </div>

                {/* 重新获取 */}
                <Button 
                  variant="ghost" 
                  onClick={() => setStatus('idle')}
                  className="mt-4 cursor-pointer"
                >
                  重新获取二维码
                </Button>
              </div>
            )}
          </div>

          {/* 底部说明 */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            登录即表示同意我们的服务条款和隐私政策
          </p>
        </div>
      </main>
    </div>
  );
}
