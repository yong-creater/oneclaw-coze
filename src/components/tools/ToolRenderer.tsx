'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, RefreshCw, Download, Wand2, Check, 
  AlertCircle, Plus, X, Eye, Copy, Share2
} from 'lucide-react';
import { 
  getToolConfig, 
  ToolConfig, 
  ToolResult, 
  canUseTool,
  getQuotaInfo,
  QuotaInfo
} from './registry';

interface ToolRendererProps {
  toolKey: string;
  user?: {
    isAuthenticated: boolean;
    isMember: boolean;
    isAdmin: boolean;
  };
  onComplete?: (result: ToolResult) => void;
  onError?: (error: string) => void;
  onLoginRequired?: () => void;
}

type ProcessingStep = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export default function ToolRenderer({
  toolKey,
  user = { isAuthenticated: false, isMember: false, isAdmin: false },
  onComplete,
  onError,
  onLoginRequired
}: ToolRendererProps) {
  const config = getToolConfig(toolKey);
  
  if (!config) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">工具不存在</h3>
        <p className="text-sm text-red-600">未找到配置：{toolKey}</p>
      </div>
    );
  }
  
  return <ToolCore config={config} user={user} onComplete={onComplete} onError={onError} onLoginRequired={onLoginRequired} />;
}

// ============================================
// 核心工具渲染组件
// ============================================

interface ToolCoreProps {
  config: ToolConfig;
  user: { isAuthenticated: boolean; isMember: boolean; isAdmin: boolean };
  onComplete?: (result: ToolResult) => void;
  onError?: (error: string) => void;
  onLoginRequired?: () => void;
}

function ToolCore({ config, user, onComplete, onError, onLoginRequired }: ToolCoreProps) {
  // 状态
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usedToday, setUsedToday] = useState(0);
  
  // 权限检查
  const permission = canUseTool(config.key, {
    isAuthenticated: user.isAuthenticated,
    isMember: user.isMember,
    isAdmin: user.isAdmin
  });
  
  // 额度信息
  const quota = getQuotaInfo(config.key, usedToday);
  
  // 文件输入
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件大小
    if (config.maxFileSize && file.size > config.maxFileSize * 1024 * 1024) {
      setErrorMessage(`文件大小不能超过 ${config.maxFileSize}MB`);
      return;
    }
    
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setErrorMessage(null);
    setStep('idle');
  }, [config.maxFileSize]);
  
  // 处理开始
  const handleProcess = useCallback(async () => {
    if (!uploadedFile || step !== 'idle') return;
    
    // 检查权限
    if (!permission.allowed) {
      if (permission.reason === '请先登录') {
        onLoginRequired?.();
      } else {
        setErrorMessage(permission.reason || '无法使用');
      }
      return;
    }
    
    setStep('uploading');
    setErrorMessage(null);
    
    try {
      // 模拟上传和处理
      await new Promise(resolve => setTimeout(resolve, 500));
      setStep('processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 生成结果（实际会调用 API）
      const result = await processTool(config.key, uploadedFile);
      
      setResultUrl(result.url || previewUrl);
      setStep('complete');
      setUsedToday(prev => prev + 1);
      onComplete?.(result);
    } catch (err) {
      setStep('error');
      const msg = err instanceof Error ? err.message : '处理失败';
      setErrorMessage(msg);
      onError?.(msg);
    }
  }, [uploadedFile, step, permission, previewUrl, config.key, onComplete, onError, onLoginRequired]);
  
  // 下载结果
  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${config.key}-result.${config.outputFormats?.[0] || 'png'}`;
    link.click();
  }, [resultUrl, config.key, config.outputFormats]);
  
  // 重置
  const handleReset = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setErrorMessage(null);
    setStep('idle');
  }, []);
  
  return (
    <div className="space-y-6">
      {/* 权限提示 */}
      {!permission.allowed && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {permission.reason}
            {permission.reason === '请先登录' && (
              <button onClick={onLoginRequired} className="ml-2 text-amber-600 underline">
                去登录
              </button>
            )}
          </p>
        </div>
      )}
      
      {/* 使用提示 */}
      <div className={`bg-gradient-to-r ${config.color.gradient} rounded-xl p-4`}>
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          {config.guide}
        </p>
      </div>
      
      {/* 额度显示 */}
      {quota.limit && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">今日剩余次数</span>
          <span className={quota.remaining === 0 ? 'text-red-500 font-medium' : 'text-slate-700'}>
            {quota.remaining} / {quota.limit}
          </span>
        </div>
      )}
      
      {/* 上传区域 */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${previewUrl 
            ? 'border-green-300 bg-green-50/50' 
            : 'border-slate-300 hover:border-orange-400'
          }
        `}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="flex items-center gap-6">
            <img 
              src={previewUrl} 
              alt="" 
              className="w-20 h-20 rounded-xl object-cover shadow" 
            />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">{uploadedFile?.name}</p>
              <p className="text-sm text-slate-500">
                {formatFileSize(uploadedFile?.size || 0)}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        ) : (
          <>
            <Upload className={`w-12 h-12 mx-auto mb-3 ${step === 'uploading' ? 'text-blue-400 animate-bounce' : 'text-slate-400'}`} />
            <p className="font-medium text-slate-800">上传图片</p>
            <p className="text-sm text-slate-500 mt-1">支持 JPG、PNG、WebP</p>
            {config.maxFileSize && (
              <p className="text-xs text-slate-400 mt-2">最大 {config.maxFileSize}MB</p>
            )}
          </>
        )}
      </div>
      
      {/* 处理按钮 */}
      {previewUrl && step !== 'complete' && (
        <button 
          onClick={handleProcess}
          disabled={step !== 'idle' || !permission.allowed || quota.remaining === 0}
          className={`
            w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg
            transition-all
            ${step !== 'idle' || !permission.allowed || quota.remaining === 0
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-xl hover:scale-[1.02]'
            }
          `}
        >
          {step === 'uploading' && <><RefreshCw className="w-5 h-5 animate-spin" />上传中...</>}
          {step === 'processing' && <><RefreshCw className="w-5 h-5 animate-spin" />AI处理中...</>}
          {step === 'idle' && <><Wand2 className="w-5 h-5" />开始处理</>}
        </button>
      )}
      
      {/* 结果展示 */}
      {step === 'complete' && resultUrl && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-slate-800 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              处理完成
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 结果预览 */}
          <div className="bg-slate-100 rounded-xl p-4">
            <img 
              src={resultUrl} 
              alt="处理结果" 
              className="max-w-full mx-auto rounded-lg"
            />
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleDownload}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              下载结果
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(resultUrl);
              }}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-orange-400 transition-colors"
            >
              <Copy className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      )}
      
      {/* 错误提示 */}
      {errorMessage && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// 辅助函数
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 模拟工具处理（实际会调用后端 API）
async function processTool(toolKey: string, file: File): Promise<ToolResult> {
  // TODO: 实现实际 API 调用
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch(`/api/tools/${toolKey}/process`, { method: 'POST', body: formData });
  // return response.json();
  
  // 模拟处理
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    success: true,
    url: URL.createObjectURL(file)
  };
}
