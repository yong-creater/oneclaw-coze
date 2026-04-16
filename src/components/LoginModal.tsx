'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone
} from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';
import EmailInput from './ui/email-input';
import WechatPromo from './WechatPromo';
import { useUser } from '@/contexts/UserContext';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

type LoginStep = 'choose' | 'password' | 'code' | 'set-password';
type RegisterStep = 'email' | 'verify' | 'password';

export default function LoginModal({ open, onOpenChange, defaultTab = 'login' }: LoginModalProps) {
  const { user, loading } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>(defaultTab);
  
  // 刷新登录状态
  const refresh = async () => {
    const res = await fetch('/api/auth');
    const data = await res.json();
    if (data.success && data.authenticated) {
      window.location.reload();
    }
  };
  
  // 登录状态
  const [loginStep, setLoginStep] = useState<LoginStep>('choose');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // 注册状态
  const [registerStep, setRegisterStep] = useState<RegisterStep>('email');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerCode, setRegisterCode] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [devCode, setDevCode] = useState(''); // 开发环境显示的验证码
  
  // 微信登录
  const [wechatQRUrl, setWechatQRUrl] = useState('');
  const [wechatSceneId, setWechatSceneId] = useState('');
  const [wechatChecking, setWechatChecking] = useState(false);

  // 登录成功
  useEffect(() => {
    if (user && !loading) {
      onOpenChange(false);
      refresh();
    }
  }, [user, loading, onOpenChange]);

  // 倒计时
  useEffect(() => {
    if (codeCooldown > 0) {
      const timer = setTimeout(() => setCodeCooldown(codeCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCooldown]);

  // 发送验证码
  const sendCode = async (email: string, type: 'register' | 'login') => {
    setRegisterLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch('/api/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCodeSent(true);
        setCodeCooldown(60);
        // 开发环境显示验证码
        if (data.devCode) {
          setDevCode(data.devCode);
        }
      } else {
        setLoginError(data.error || '发送失败');
      }
    } catch {
      setLoginError('网络错误，请重试');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 登录方式选择
  const handleChooseLogin = (step: LoginStep) => {
    setLoginStep(step);
    setLoginError('');
    setLoginPassword('');
    setLoginCode('');
    setLoginEmail('');
  };

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('请输入邮箱和密码');
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_login',
          email: loginEmail,
          password: loginPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refresh?.();
      } else {
        setLoginError(data.error || '登录失败');
      }
    } catch {
      setLoginError('网络错误，请重试');
    } finally {
      setLoginLoading(false);
    }
  };

  // 验证码登录
  const handleCodeLogin = async () => {
    if (!loginEmail || !loginCode) {
      setLoginError('请输入邮箱和验证码');
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_code_login',
          email: loginEmail,
          code: loginCode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 如果是新用户（没有设置过密码），引导设置密码
        if (data.isNewUser) {
          setLoginStep('set-password');
        } else {
          await refresh?.();
        }
      } else {
        setLoginError(data.error || '登录失败');
      }
    } catch {
      setLoginError('网络错误，请重试');
    } finally {
      setLoginLoading(false);
    }
  };

  // 设置密码
  const handleSetPassword = async () => {
    if (!registerPassword || !registerConfirmPassword) {
      setLoginError('请输入密码');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setLoginError('两次密码不一致');
      return;
    }
    
    if (registerPassword.length < 6) {
      setLoginError('密码至少6个字符');
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_password',
          email: loginEmail,
          password: registerPassword,
          confirmPassword: registerConfirmPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refresh?.();
      } else {
        setLoginError(data.error || '设置失败');
      }
    } catch {
      setLoginError('网络错误，请重试');
    } finally {
      setLoginLoading(false);
    }
  };

  // 发送注册验证码
  const handleSendRegisterCode = async () => {
    if (!registerEmail) {
      setRegisterError('请输入邮箱');
      return;
    }
    
    await sendCode(registerEmail, 'register');
  };

  // 注册验证码登录
  const handleVerifyRegisterCode = async () => {
    if (!registerCode) {
      setRegisterError('请输入验证码');
      return;
    }
    
    setRegisterLoading(true);
    setRegisterError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_code_login',
          email: registerEmail,
          code: registerCode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 新用户引导设置密码
        if (data.isNewUser) {
          setRegisterStep('password');
        } else {
          await refresh?.();
        }
      } else {
        setRegisterError(data.error || '验证失败');
      }
    } catch {
      setRegisterError('网络错误，请重试');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 完成注册（设置密码）
  const handleCompleteRegister = async () => {
    if (!registerPassword || !registerConfirmPassword) {
      setRegisterError('请输入密码');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('两次密码不一致');
      return;
    }
    
    if (registerPassword.length < 6) {
      setRegisterError('密码至少6个字符');
      return;
    }
    
    setRegisterLoading(true);
    setRegisterError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_password',
          email: registerEmail,
          password: registerPassword,
          confirmPassword: registerConfirmPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refresh?.();
      } else {
        setRegisterError(data.error || '设置失败');
      }
    } catch {
      setRegisterError('网络错误，请重试');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 模拟登录（开发环境）
  const handleMockLogin = async () => {
    setLoginLoading(true);
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mock_login' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refresh?.();
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // 微信扫码登录
  const handleWechatLogin = async () => {
    setWechatChecking(true);
    
    try {
      // 获取二维码
      const qrResponse = await fetch('/api/auth?action=qrcode');
      const qrData = await qrResponse.json();
      
      if (qrData.success) {
        setWechatQRUrl(qrData.data.qrUrl);
        setWechatSceneId(qrData.data.sceneId);
        
        // 轮询检查扫码状态
        const checkLogin = async () => {
          const checkResponse = await fetch(`/api/auth?action=check&sceneId=${wechatSceneId}`);
          const checkData = await checkResponse.json();
          
          if (checkData.status === 'confirmed') {
            await refresh?.();
            setWechatChecking(false);
          } else if (checkData.status === 'scanned') {
            // 用户已扫码，等待确认
            setTimeout(checkLogin, 1000);
          } else {
            // 继续轮询
            setTimeout(checkLogin, 2000);
          }
        };
        
        checkLogin();
      }
    } catch {
      setWechatChecking(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* 弹窗 */}
      <Card className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <AnimatedLobster size={32} />
            </div>
          </div>
          <CardTitle className="text-xl">欢迎来到 OneClaw</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            登录后解锁更多功能
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 登录选项 */}
          {loginStep === 'choose' && (
            <>
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>
                
                {/* 登录表单 */}
                <TabsContent value="login" className="space-y-4 mt-4">
                  {/* 密码登录 */}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-4"
                    onClick={() => handleChooseLogin('password')}
                  >
                    <Lock className="w-5 h-5 mr-3 text-orange-500" />
                    <div className="text-left">
                      <div className="font-medium">邮箱密码登录</div>
                      <div className="text-xs text-slate-500">使用邮箱和密码登录</div>
                    </div>
                  </Button>
                  
                  {/* 验证码登录 */}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-4"
                    onClick={() => handleChooseLogin('code')}
                  >
                    <Smartphone className="w-5 h-5 mr-3 text-orange-500" />
                    <div className="text-left">
                      <div className="font-medium">验证码登录</div>
                      <div className="text-xs text-slate-500">输入验证码快速登录</div>
                    </div>
                  </Button>
                  
                  <Separator />
                  
                  {/* 微信登录 */}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-4"
                    onClick={handleWechatLogin}
                    disabled={wechatChecking}
                  >
                    <div className="w-5 h-5 mr-3 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      W
                    </div>
                    <div className="text-left">
                      <div className="font-medium">微信登录</div>
                      <div className="text-xs text-slate-500">使用微信扫码登录</div>
                    </div>
                  </Button>
                  
                  {/* 开发环境模拟登录 */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <Separator />
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={handleMockLogin}
                        disabled={loginLoading}
                      >
                        <Loader2 className={`w-4 h-4 mr-2 ${loginLoading ? 'animate-spin' : ''}`} />
                        模拟登录（开发环境）
                      </Button>
                    </>
                  )}
                </TabsContent>
                
                {/* 注册表单 */}
                <TabsContent value="register" className="space-y-4 mt-4">
                  {registerStep === 'email' && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            邮箱地址
                          </label>
                          <EmailInput
                            value={registerEmail}
                            onChange={setRegisterEmail}
                            placeholder="输入邮箱地址"
                            className="mt-1"
                          />
                        </div>
                        
                        {registerError && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            {registerError}
                          </div>
                        )}
                        
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={handleSendRegisterCode}
                          disabled={registerLoading || codeCooldown > 0}
                        >
                          {registerLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {codeCooldown > 0 ? `${codeCooldown}秒后重发` : '发送验证码'}
                        </Button>
                        
                        {/* 开发环境显示验证码 */}
                        {devCode && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              开发环境验证码：<span className="font-mono font-bold">{devCode}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {registerStep === 'verify' && (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-sm text-slate-500">
                          验证码已发送至
                        </div>
                        <div className="font-medium text-orange-500">{registerEmail}</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            验证码
                          </label>
                          <Input
                            type="text"
                            placeholder="输入6位验证码"
                            value={registerCode}
                            onChange={(e) => setRegisterCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="mt-1 text-center text-lg tracking-widest font-mono"
                            maxLength={6}
                          />
                        </div>
                        
                        {registerError && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            {registerError}
                          </div>
                        )}
                        
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={handleVerifyRegisterCode}
                          disabled={registerLoading || registerCode.length !== 6}
                        >
                          {registerLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          验证并登录
                        </Button>
                        
                        <div className="flex justify-between text-sm">
                          <button
                            type="button"
                            className="text-slate-500 hover:text-orange-500"
                            onClick={() => setRegisterStep('email')}
                          >
                            返回修改邮箱
                          </button>
                          <button
                            type="button"
                            className="text-slate-500 hover:text-orange-500"
                            onClick={handleSendRegisterCode}
                            disabled={codeCooldown > 0}
                          >
                            {codeCooldown > 0 ? `${codeCooldown}秒后重发` : '重新发送'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {registerStep === 'password' && (
                    <>
                      <div className="text-center mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <div className="text-lg font-medium">邮箱验证成功！</div>
                        <div className="text-sm text-slate-500">
                          最后一步：设置密码
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            设置密码
                          </label>
                          <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showRegisterPassword ? 'text' : 'password'}
                              placeholder="至少6个字符"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              className="pl-10 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            确认密码
                          </label>
                          <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showRegisterPassword ? 'text' : 'password'}
                              placeholder="再次输入密码"
                              value={registerConfirmPassword}
                              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        {registerError && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            {registerError}
                          </div>
                        )}
                        
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={handleCompleteRegister}
                          disabled={registerLoading}
                        >
                          {registerLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          完成注册
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* 密码登录表单 */}
          {loginStep === 'password' && (
            <>
              <Button
                variant="ghost"
                className="mb-2"
                onClick={() => handleChooseLogin('choose')}
              >
                ← 返回
              </Button>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    邮箱地址
                  </label>
                  <EmailInput
                    value={loginEmail}
                    onChange={setLoginEmail}
                    placeholder="输入邮箱地址"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    密码
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入密码"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {loginError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </div>
                )}
                
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handlePasswordLogin}
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  登录
                </Button>
              </div>
            </>
          )}

          {/* 验证码登录表单 */}
          {loginStep === 'code' && (
            <>
              <Button
                variant="ghost"
                className="mb-2"
                onClick={() => handleChooseLogin('choose')}
              >
                ← 返回
              </Button>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    邮箱地址
                  </label>
                  <EmailInput
                    value={loginEmail}
                    onChange={setLoginEmail}
                    placeholder="输入邮箱地址"
                    className="mt-1"
                  />
                </div>
                
                {!codeSent ? (
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => sendCode(loginEmail, 'login')}
                    disabled={loginLoading || !loginEmail}
                  >
                    {loginLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    发送验证码
                  </Button>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        验证码
                      </label>
                      <Input
                        type="text"
                        placeholder="输入6位验证码"
                        value={loginCode}
                        onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="mt-1 text-center text-lg tracking-widest font-mono"
                        maxLength={6}
                        onKeyDown={(e) => e.key === 'Enter' && handleCodeLogin()}
                      />
                    </div>
                    
                    {/* 开发环境显示验证码 */}
                    {devCode && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          开发环境验证码：<span className="font-mono font-bold">{devCode}</span>
                        </div>
                      </div>
                    )}
                    
                    {loginError && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {loginError}
                      </div>
                    )}
                    
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={handleCodeLogin}
                      disabled={loginLoading || loginCode.length !== 6}
                    >
                      {loginLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      验证并登录
                    </Button>
                    
                    <div className="flex justify-between text-sm">
                      <button
                        type="button"
                        className="text-slate-500 hover:text-orange-500"
                        onClick={() => { setCodeSent(false); setDevCode(''); }}
                      >
                        返回修改邮箱
                      </button>
                      <button
                        type="button"
                        className="text-slate-500 hover:text-orange-500"
                        onClick={() => sendCode(loginEmail, 'login')}
                        disabled={codeCooldown > 0}
                      >
                        {codeCooldown > 0 ? `${codeCooldown}秒后重发` : '重新发送'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* 设置密码表单（验证码登录后） */}
          {loginStep === 'set-password' && (
            <>
              <div className="text-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-medium">登录成功！</div>
                <div className="text-sm text-slate-500">
                  为提升账号安全，建议设置密码
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    设置密码
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="至少6个字符"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    确认密码
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="再次输入密码"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {loginError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </div>
                )}
                
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleSetPassword}
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  设置密码并完成
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => refresh?.()}
                >
                  跳过，稍后设置
                </Button>
              </div>
            </>
          )}
          
          <WechatPromo />
        </CardContent>
      </Card>
    </div>
  );
}
