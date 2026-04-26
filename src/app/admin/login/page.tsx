'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDev, setIsDev] = useState(false);

  // 检测开发环境
  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost' || window.location.hostname.includes('dev.coze'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        document.cookie = `admin_token=${data.token}; path=/; max-age=${30 * 24 * 60 * 60}`;
        router.push('/admin');
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 开发环境快速登录
  const handleDevLogin = () => {
    document.cookie = 'admin_token=dev_token; path=/; max-age=86400';
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">管理后台登录</h1>
          <p className="text-slate-400 mt-2">请输入管理员账号密码</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">用户名</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">密码</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white" 
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          {/* 开发环境快速登录 */}
          {isDev && (
            <div className="pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={handleDevLogin}
              >
                快速登录（开发环境）
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
