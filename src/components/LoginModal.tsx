'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, MessageSquare, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailInput from '@/components/ui/email-input';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: any) => void;
}

// 登录方式
type LoginType = 'wechat' | 'email-code';

export default function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [loginType, setLoginType] = useState<LoginType | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devMode, setDevMode] = useState(false);

  // 发送验证码
  const sendCode = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'register' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // 开发环境直接显示验证码
        if (data.devCode) {
          setSuccess(`验证码: ${data.devCode} (开发环境演示)`);
        } else {
          setSuccess('验证码已发送，请查收邮件');
        }
        setCountdown(60);
      } else {
        setError(data.error || '发送失败');
      }
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 验证码登录
  const handleEmailLogin = async () => {
    if (!email || !code) {
      setError('请填写完整信息');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_code_login',
          email,
          code
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('登录成功！');
        if (onSuccess) {
          onSuccess(data.user);
        }
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 500);
      } else {
        setError(data.error || '登录失败');
      }
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 微信扫码登录
  const handleWechatLogin = () => {
    // TODO: 实现微信扫码登录
    setError('微信登录功能开发中，请使用邮箱验证码登录');
  };

  // 模拟登录（开发环境）
  const handleMockLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mock_login',
          userId: 'dev_user_001'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('模拟登录成功！');
        if (onSuccess) {
          onSuccess(data.user);
        }
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 500);
      } else {
        setError(data.error || '登录失败');
      }
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 检测开发环境
  useEffect(() => {
    setDevMode(process.env.NODE_ENV === 'development');
  }, []);

  if (!open) return null;

  // ==================== 选择登录方式 ====================
  if (!loginType) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[400px] max-w-[90vw] overflow-hidden">
          {/* 头部 */}
          <div className="relative p-6 pb-4 bg-gradient-to-r from-orange-500 to-red-500">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">欢迎来到 OneClaw</h2>
            <p className="text-sm text-white/80 mt-1">登录后解锁更多功能</p>
          </div>

          {/* 登录方式选择 */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-500 mb-3">选择登录方式</h3>
            
            {/* 微信扫码登录 */}
            <div className="relative">
              <button
                onClick={() => setLoginType('wechat')}
                className="w-full p-4 rounded-xl border-2 border-green-200 dark:border-green-800 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white">
                    <path fill="currentColor" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.053 2.986c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">微信扫码登录</div>
                  <div className="text-sm text-slate-500">使用微信扫一扫快速登录</div>
                </div>
                <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                  开发中
                </span>
              </button>
            </div>

            {/* 邮箱验证码登录 */}
            <button
              onClick={() => setLoginType('email-code')}
              className="w-full p-4 rounded-xl border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800 dark:text-slate-200">邮箱验证码登录</div>
                <div className="text-sm text-slate-500">输入邮箱，通过验证码登录</div>
              </div>
            </button>

            {/* 开发环境模拟登录 */}
            {devMode && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleMockLogin}
                  className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm text-slate-500 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  模拟登录（开发环境）
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 微信扫码登录 ====================
  if (loginType === 'wechat') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[400px] max-w-[90vw] overflow-hidden">
          <div className="p-6 pb-4 bg-gradient-to-r from-green-500 to-emerald-500">
            <button
              onClick={() => setLoginType(null)}
              className="absolute top-4 left-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">微信扫码登录</h2>
            <p className="text-sm text-white/80 mt-1">使用微信扫描下方二维码</p>
          </div>

          <div className="p-6 text-center">
            <div className="w-48 h-48 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <div className="text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-sm">二维码加载中...</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">打开微信扫一扫</p>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setLoginType(null)}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700"
            >
              返回选择其他登录方式
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 邮箱验证码登录 ====================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[400px] max-w-[90vw] overflow-hidden">
        <div className="p-6 pb-4 bg-gradient-to-r from-orange-500 to-red-500">
          <button
            onClick={() => setLoginType(null)}
            className="absolute top-4 left-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">邮箱验证码登录</h2>
          <p className="text-sm text-white/80 mt-1">输入邮箱，我们会发送验证码到您的邮箱</p>
        </div>

        <div className="p-6 space-y-4">
          {/* 邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              邮箱地址
            </label>
            <EmailInput
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
            />
          </div>

          {/* 验证码输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              验证码
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="输入6位验证码"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={sendCode}
                disabled={loading || countdown > 0}
                className="whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>• 如果邮箱未注册，系统会自动创建新账号</p>
            <p>• 验证码10分钟内有效</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* 登录按钮 */}
          <Button
            onClick={handleEmailLogin}
            disabled={loading || !email || code.length < 6}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {loading ? '登录中...' : '登录 / 注册'}
          </Button>

          <button
            onClick={() => setLoginType(null)}
            className="w-full text-sm text-slate-500 hover:text-slate-700 text-center"
          >
            返回选择其他登录方式
          </button>
        </div>
      </div>
    </div>
  );
}
