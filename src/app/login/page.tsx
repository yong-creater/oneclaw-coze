'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Heart, Crown, Zap, Mail, Lock, Eye, EyeOff, Loader2, Send } from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

export default function LoginPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  
  // 邮箱登录状态
  const [loginMode, setLoginMode] = useState<'tabs' | 'email' | 'code'>('tabs');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // 发送验证码
  const handleSendCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setCodeLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'login' }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setToast('验证码已发送到邮箱');
        setLoginMode('code');
        setCountdown(60);
      } else {
        setError(data.error || '发送失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setCodeLoading(false);
    }
  };

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 邮箱验证码登录
  const handleCodeLogin = async () => {
    if (!email || !code) {
      setError('请输入邮箱和验证码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'email_code_login', email, code }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setToast('登录成功');
        setTimeout(() => router.push('/'), 1000);
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 邮箱密码登录
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'email_login', email, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setToast('登录成功');
        setTimeout(() => router.push('/'), 1000);
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 模拟登录
  const handleMockLogin = () => {
    setToast('模拟登录成功');
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20 flex items-center justify-center p-4">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 登录卡片 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg shadow-orange-500/30">
              <AnimatedLobster size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">OneClaw</h1>
            <p className="text-sm text-slate-500 mt-1">登录以使用更多功能</p>
          </div>

          {/* 登录模式切换 */}
          {loginMode === 'tabs' && (
            <div className="space-y-3">
              {/* 邮箱登录入口 */}
              <button
                onClick={() => setLoginMode('email')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">邮箱登录 / 注册</span>
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-400">其他方式</span>
                </div>
              </div>

              {/* 模拟登录 */}
              <button
                onClick={handleMockLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <User className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">快速体验（模拟登录）</span>
              </button>

              {/* 微信扫码 */}
              <button
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.69 6.95c-.17-.58-.67-.95-1.23-.95-.72 0-1.28.48-1.28 1.17 0 .75.66 1.12 1.74 1.5 1.25.43 2.31 1.17 2.31 2.85 0 1.85-1.63 3.04-3.7 3.04-1.63 0-2.93-.61-3.63-1.7l1.57-1.03c.31.66.9 1.05 1.7 1.05.67 0 1.2-.38 1.2-1.03 0-.61-.43-.96-1.53-1.32-1.08-.36-2.36-.96-2.36-2.62 0-1.67 1.37-2.86 3.3-2.86 1.25 0 2.31.53 2.95 1.52l-1.46 1.03c-.19-.46-.57-.73-1.08-.73-.52 0-.9.28-.9.72 0 .36.28.59 1.07.85.93.31 2.05.66 2.05 1.91 0 1.13-1.08 1.98-2.36 1.98-.98 0-1.88-.43-2.36-1.25l1.68-1.12c.17.59.67.98 1.28.98.72 0 1.28-.48 1.28-1.17 0-.72-.59-1.08-1.47-1.37-.08-.04-.17-.08-.25-.11l.25-.01c.17 0 .33-.01.5-.01z"/>
                </svg>
                <span className="text-sm font-medium">微信扫码登录</span>
              </button>
            </div>
          )}

          {/* 邮箱登录表单 */}
          {(loginMode === 'email' || loginMode === 'code') && (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}
              
              {/* 邮箱输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              {loginMode === 'email' && (
                <>
                  {/* 密码输入 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* 登录按钮 */}
                  <button
                    onClick={handleEmailLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    <span>{loading ? '登录中...' : '登录'}</span>
                  </button>

                  {/* 切换到验证码登录 */}
                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={() => { setLoginMode('code'); setError(''); }}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      验证码登录
                    </button>
                    <Link href="/forgot-password" className="text-slate-500 hover:text-slate-700">
                      忘记密码？
                    </Link>
                  </div>
                </>
              )}

              {loginMode === 'code' && (
                <>
                  {/* 验证码输入 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">验证码</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="请输入验证码"
                        maxLength={6}
                        className="w-full pl-10 pr-28 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      <button
                        onClick={handleSendCode}
                        disabled={codeLoading || countdown > 0}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-orange-500 hover:text-orange-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {codeLoading ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                      </button>
                    </div>
                  </div>

                  {/* 验证登录按钮 */}
                  <button
                    onClick={handleCodeLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    <span>{loading ? '验证中...' : '验证并登录'}</span>
                  </button>

                  {/* 切换回密码登录 */}
                  <button
                    onClick={() => { setLoginMode('email'); setError(''); }}
                    className="w-full text-sm text-orange-500 hover:text-orange-600"
                  >
                    密码登录
                  </button>
                </>
              )}

              {/* 返回选项 */}
              <button
                onClick={() => { setLoginMode('tabs'); setError(''); setEmail(''); setPassword(''); setCode(''); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                返回其他登录方式
              </button>
            </div>
          )}

          {/* 会员提示 */}
          {loginMode === 'tabs' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-800">开通会员享更多权益</h3>
                  <p className="text-xs text-slate-500 mt-0.5">专属AI功能、无限使用、优先体验</p>
                  <button
                    onClick={() => router.push('/membership')}
                    className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    了解会员权益 →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 协议 */}
        <p className="text-center text-xs text-slate-400 mt-4">
          登录即表示同意{' '}
          <Link href="/terms" className="text-slate-500 hover:underline">用户协议</Link>
          {' '}和{' '}
          <Link href="/privacy" className="text-slate-500 hover:underline">隐私政策</Link>
        </p>
      </div>
    </div>
  );
}
