'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, RefreshCw, Download, Wand2, Check, 
  AlertCircle, Plus, X, Eye, Copy, Share2
} from 'lucide-react';
import { 
  getToolByKey,
  ToolConfig 
} from './registry';
import { TOOLS_CONFIG } from './config';

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

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
  // 优先从静态配置获取
  const config = TOOLS_CONFIG.find(t => t.key === toolKey) || getToolByKey(toolKey);
  
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

function ToolCore({
  config,
  user,
  onComplete,
  onError,
  onLoginRequired
}: {
  config: ToolConfig;
  user: ToolRendererProps['user'];
  onComplete?: (result: ToolResult) => void;
  onError?: (error: string) => void;
  onLoginRequired?: () => void;
}) {
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
      onError?.('请上传 JPG、PNG、WebP 或 GIF 格式的图片');
      return;
    }

    // 验证文件大小 (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      onError?.('图片大小不能超过 10MB');
      return;
    }

    setFile(selectedFile);
    
    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
    
    setStep('idle');
    setResult(null);
  }, [onError]);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    // 检查登录
    if (config.requiresAuth && !user?.isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    setStep('uploading');
    setProgress(10);

    try {
      // 模拟处理过程
      setStep('processing');
      setProgress(30);

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(70);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(100);

      // 模拟结果（实际项目中这里应该是真实 API 返回）
      setResult(preview);
      setStep('complete');
      onComplete?.({ success: true, data: preview });

    } catch (err) {
      setStep('error');
      onError?.('处理失败，请重试');
    }
  }, [file, config, user, preview, onComplete, onError, onLoginRequired]);

  const handleReset = useCallback(() => {
    setStep('idle');
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* 工具标题 */}
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color.gradient} flex items-center justify-center text-2xl shadow-lg`}>
          {config.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{config.name}</h1>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-orange-600">使用提示：</span>
          {config.guide}
        </p>
      </div>

      {/* 上传区域 */}
      {(step === 'idle' || step === 'error') && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">
            <span className="text-orange-500 font-medium">点击上传</span> 或拖拽图片到这里
          </p>
          <p className="text-xs text-slate-400">支持 JPG、PNG、WebP，最大 10MB</p>
        </div>
      )}

      {/* 预览区域 */}
      {preview && step !== 'complete' && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200">
          <img src={preview} alt="Preview" className="w-full max-h-96 object-contain bg-slate-50" />
          <button
            onClick={handleReset}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* 进度条 */}
      {(step === 'uploading' || step === 'processing') && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              {step === 'uploading' ? '上传中...' : 'AI 处理中...'}
            </span>
            <span className="text-orange-500 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 处理按钮 */}
      {preview && step !== 'processing' && (
        <button
          onClick={handleProcess}
          disabled={step !== 'idle'}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          {step === 'complete' ? '处理完成' : '开始处理'}
        </button>
      )}

      {/* 结果展示 */}
      {step === 'complete' && result && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-green-200 bg-green-50">
            <img src={result} alt="Result" className="w-full max-h-96 object-contain" />
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
              <Check className="w-4 h-4" />
              处理完成
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = result;
                link.download = `processed-${Date.now()}.png`;
                link.click();
              }}
              className="flex-1 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              下载图片
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
