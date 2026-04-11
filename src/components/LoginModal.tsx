'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedLobster } from '@/components/AnimatedLobster';
import { 
  Loader2, AlertCircle, CheckCircle2, 
  Mail, Lock, User, Scan, RefreshCw, Smartphone,
  Construction
} from 'lucide-react';

interface User {
  user_id: string;
  nickname?: string;
  email?: string;
  avatar_url?: string;
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  // 邮箱登录状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 微信登录状态
  const [qrUrl, setQrUrl] = useState('');
  const [scanStatus, setScanStatus] = useState<'waiting' | 'scanned' | 'confirmed' | 'expired'>('waiting');
  const [sceneId, setSceneId] = useState('');
  const [pollingTimer, setPollingTimer] = useState<NodeJS.Timeout | null>(null);

  // 重置状态
  const resetStates = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterNickname('');
    setError('');
    setLoading(false);
  };

  // 关闭弹窗时重置
  useEffect(() => {
    if (!open) {
      resetStates();
      clearTimers();
    }
  }, [open]);

  // 清除定时器
  const clearTimers = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      setPollingTimer(null);
    }
  };

  // 邮箱登录
  const handleEmailLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setError('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_login',
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        onSuccess?.(data.user);
        onClose();
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 邮箱注册
  const handleEmailRegister = async () => {
    if (!registerEmail || !registerPassword) {
      setError('请输入邮箱和密码');
      return;
    }

    if (registerPassword.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_register',
          email: registerEmail,
          password: registerPassword,
          nickname: registerNickname || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        onSuccess?.(data.user);
        onClose();
      } else {
        setError(data.error || '注册失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 模拟登录（开发环境）
  const handleMockLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mock_login' })
      });

      const data = await res.json();

      if (data.success) {
        onSuccess?.(data.data.user);
        onClose();
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            <AnimatedLobster size={50} />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            登录 OneClaw
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">AI 工具导航平台</p>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login" className="text-sm">
              账号登录
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm">
              快速注册
            </TabsTrigger>
            <TabsTrigger value="wechat" className="text-sm relative">
              微信登录
              <span className="ml-1 text-[10px] bg-amber-100 text-amber-600 px-1 py-0.5 rounded">开发中</span>
            </TabsTrigger>
          </TabsList>

          {/* 邮箱登录 */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="请输入邮箱"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              登录即表示同意 <span className="text-orange-500 cursor-pointer">用户协议</span> 和 <span className="text-orange-500 cursor-pointer">隐私政策</span>
            </p>
          </TabsContent>

          {/* 邮箱注册 */}
          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="请输入邮箱"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="请输入昵称（选填）"
                  value={registerNickname}
                  onChange={(e) => setRegisterNickname(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleEmailRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              注册即表示同意 <span className="text-orange-500 cursor-pointer">用户协议</span> 和 <span className="text-orange-500 cursor-pointer">隐私政策</span>
            </p>
          </TabsContent>

          {/* 微信登录（开发中） */}
          <TabsContent value="wechat" className="mt-4">
            <div className="flex flex-col items-center py-6 text-center">
              {/* 开发中图标 */}
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Construction className="w-10 h-10 text-amber-500" />
              </div>
              
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                微信登录功能开发中
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                我们正在努力开发微信扫码登录功能，<br />
                请先使用邮箱账号登录或注册。
              </p>

              {/* 开发环境模拟登录 */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="w-full">
                  <div className="relative flex items-center justify-center my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-xs text-slate-400">开发模式</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleMockLogin}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        模拟登录
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
