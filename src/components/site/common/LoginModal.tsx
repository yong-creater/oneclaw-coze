'use client';

import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import EmailInput from '@/components/ui/email-input';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: any) => void;
}

// 关闭按钮组件
function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
    >
      <X className="w-4 h-4 text-white" />
    </button>
  );
}

export default function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
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
        if (data.devCode) {
          setSuccess(`验证码: ${data.devCode} (开发环境演示)`);
        } else {
          setSuccess('验证码已发送，请查收邮件');
        }
        setCountdown(600);
      } else {
        setError(data.error || '发送失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 邮箱验证码登录
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
        // 关闭弹窗（不刷新页面，由 UserContext.login 处理 pendingAction）
        setTimeout(() => {
          onOpenChange(false);
        }, 500);
      } else {
        setError(data.error || '登录失败');
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
        // 关闭弹窗（不刷新页面）
        setTimeout(() => {
          onOpenChange(false);
        }, 500);
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#171717] border border-white/[0.06] rounded-2xl shadow-2xl w-[420px] max-w-[90vw] overflow-hidden animate-fade-slide-up">
        {/* 头部 - 紫蓝渐变 */}
        <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, #7B61FF, #5B8CFF)' }}>
          <CloseButton onClose={() => onOpenChange(false)} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">登录后开始创作</h2>
              <p className="text-sm text-white/80 mt-0.5">登录后即可生成内容、保存作品，并在任务中心查看进度</p>
            </div>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="p-6 space-y-4">
          {/* 邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
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
            <label className="block text-sm font-medium text-white/70 mb-2">
              验证码
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="输入6位验证码"
                className="flex-1"
              />
              <button
                onClick={sendCode}
                disabled={loading || countdown > 0}
                className="os-btn-secondary whitespace-nowrap !h-10"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-white/30 space-y-1">
            <p>• 如果邮箱未注册，系统会自动创建新账号</p>
            <p>• 验证码10分钟内有效</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleEmailLogin}
            disabled={loading || !email || code.length < 6}
            className="os-btn-primary w-full"
          >
            {loading ? '登录中...' : '登录 / 注册'}
          </button>

          {/* 开发环境模拟登录 */}
          {devMode && (
            <div className="pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleMockLogin}
                className="w-full p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-sm text-white/40 flex items-center justify-center gap-2"
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
