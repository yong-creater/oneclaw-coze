'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Scan, User, CheckCircle2, Smartphone, RefreshCw } from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: { user_id: string; nickname?: string }) => void;
}

type ScanStatus = 'waiting' | 'scanned' | 'confirmed' | 'expired';

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [sceneId, setSceneId] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('waiting');
  const [error, setError] = useState('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  const clearTimers = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 获取二维码
  const fetchQrCode = useCallback(async () => {
    try {
      setScanStatus('waiting');
      setError('');
      
      const res = await fetch('/api/auth?action=qrcode');
      const data = await res.json();
      
      if (data.success && data.data.qrUrl) {
        setQrUrl(data.data.qrUrl);
        setSceneId(data.data.sceneId);
        
        // 开始轮询检查扫码状态
        startPolling(data.data.sceneId);
        
        // 设置5分钟超时
        timeoutRef.current = setTimeout(() => {
          setScanStatus('expired');
          clearTimers();
        }, 5 * 60 * 1000);
      }
    } catch (err) {
      console.error('获取二维码失败:', err);
      setError('获取二维码失败，请重试');
    }
  }, [clearTimers]);

  // 轮询检查扫码状态
  const startPolling = useCallback((sid: string) => {
    clearTimers();
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth?action=check&sceneId=${sid}`);
        const data = await res.json();
        
        if (data.success) {
          if (data.status === 'scanned') {
            setScanStatus('scanned');
          } else if (data.status === 'confirmed' && data.data?.user) {
            setScanStatus('confirmed');
            clearTimers();
            
            // 登录成功
            setTimeout(() => {
              onSuccess?.(data.data.user);
              onClose();
            }, 500);
          } else if (data.status === 'expired') {
            setScanStatus('expired');
            clearTimers();
          }
        }
      } catch (err) {
        console.error('检查登录状态失败:', err);
      }
    }, 2000); // 每2秒检查一次
  }, [clearTimers, onSuccess, onClose]);

  // 监听弹窗打开
  useEffect(() => {
    if (open) {
      fetchQrCode();
    } else {
      clearTimers();
      setScanStatus('waiting');
      setQrUrl('');
      setSceneId('');
    }
    
    return () => clearTimers();
  }, [open, fetchQrCode, clearTimers]);

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

  // 刷新二维码
  const handleRefresh = () => {
    fetchQrCode();
  };

  // 获取状态提示信息
  const getStatusInfo = () => {
    switch (scanStatus) {
      case 'scanned':
        return {
          icon: <Smartphone className="w-5 h-5 text-green-500" />,
          text: '已扫描，请在手机上确认登录',
          color: 'text-green-600'
        };
      case 'confirmed':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          text: '登录成功，正在跳转...',
          color: 'text-green-600'
        };
      case 'expired':
        return {
          icon: <RefreshCw className="w-5 h-5 text-orange-500" />,
          text: '二维码已过期，请点击刷新',
          color: 'text-orange-500'
        };
      default:
        return {
          icon: <Scan className="w-5 h-5 text-slate-400" />,
          text: '请使用微信扫描二维码',
          color: 'text-slate-500'
        };
    }
  };

  const statusInfo = getStatusInfo();

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
          <div 
            className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative cursor-pointer group"
            onClick={scanStatus === 'expired' ? handleRefresh : undefined}
          >
            {qrUrl && scanStatus !== 'expired' ? (
              <img 
                src={qrUrl} 
                alt="微信二维码" 
                className="w-full h-full object-contain"
                onError={() => setQrUrl('')}
              />
            ) : scanStatus === 'expired' ? (
              <div className="text-center">
                <RefreshCw className="w-10 h-10 mx-auto mb-2 text-orange-500 group-hover:rotate-180 transition-transform duration-300" />
                <p className="text-sm text-orange-500">点击刷新</p>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Scan className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">二维码加载中...</p>
              </div>
            )}
            
            {/* 已扫描遮罩 */}
            {scanStatus === 'scanned' && (
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-[1px]">
                <Smartphone className="w-16 h-16 text-green-500 animate-pulse" />
              </div>
            )}
          </div>
          
          {/* 状态提示 */}
          <div className={`flex items-center gap-2 mb-4 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="text-sm">{statusInfo.text}</span>
          </div>
          
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
