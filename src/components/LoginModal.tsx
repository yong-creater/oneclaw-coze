'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Scan, User } from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: { user_id: string; nickname?: string }) => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  // 获取二维码
  useEffect(() => {
    if (open) {
      fetchQrCode();
    }
  }, [open]);

  const fetchQrCode = async () => {
    try {
      const res = await fetch('/api/auth?action=qrcode');
      const data = await res.json();
      if (data.success && data.data.qrUrl) {
        setQrUrl(data.data.qrUrl);
      }
    } catch (err) {
      console.error('获取二维码失败:', err);
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
    } catch (err) {
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
            微信扫码登录
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">扫码关注公众号即可登录</p>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {/* 二维码区域 */}
          <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
            {qrUrl ? (
              <img 
                src={qrUrl} 
                alt="微信二维码" 
                className="w-full h-full object-contain"
                onError={() => setQrUrl('')}
              />
            ) : (
              <div className="text-center text-slate-400">
                <Scan className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">二维码加载中...</p>
              </div>
            )}
          </div>
          
          {/* 提示文字 */}
          <p className="text-xs text-slate-400 text-center mb-4">
            使用微信扫描二维码<br/>
            关注公众号完成登录
          </p>
          
          {error && (
            <p className="text-sm text-red-500 mb-3">{error}</p>
          )}
          
          {/* 开发环境模拟登录 */}
          {process.env.NODE_ENV !== 'production' && (
            <>
              <div className="relative w-full flex items-center justify-center my-3">
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
            </>
          )}
        </div>
        
        <p className="text-xs text-slate-400 text-center">
          登录即表示同意 <span className="text-orange-500">用户协议</span> 和 <span className="text-orange-500">隐私政策</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
