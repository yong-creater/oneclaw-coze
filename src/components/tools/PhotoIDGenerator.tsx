'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Camera, X, Check, Download, RefreshCw, 
  Sparkles, Shield, ChevronRight, ChevronLeft,
  ZoomIn, ZoomOut, Move, Eraser, Undo2, Loader2,
  Monitor, Smartphone, Tablet, FileImage, Trash2,
  Lock, Crown, Zap, Eye, EyeOff, HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

// 简易 Palette 图标
const Palette = (props: React.ComponentProps<'svg'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);
import { cn } from '@/lib/utils';
import UtilityHeader from '../common/UtilityHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ==================== 常量 ====================

// 证件照尺寸库
const PHOTO_SIZES = [
  { id: '1inch', name: '1寸', width: 25, height: 35, unit: 'mm', usage: '入职、体检、简历' },
  { id: '2inch', name: '2寸', width: 35, height: 49, unit: 'mm', usage: '签证、学历认证' },
  { id: 'small2inch', name: '小二寸', width: 33, height: 48, unit: 'mm', usage: '护照、港澳通行证' },
  { id: 'big2inch', name: '大二寸', width: 40, height: 55, unit: 'mm', usage: '签证、公务员报名' },
  { id: 'passport', name: '护照', width: 33, height: 48, unit: 'mm', usage: '各国护照申请' },
  { id: 'visa-us', name: '美国签证', width: 51, height: 51, unit: 'mm', usage: '美国签证申请' },
  { id: 'visa-jp', name: '日本签证', width: 45, height: 45, unit: 'mm', usage: '日本签证申请' },
  { id: 'exam', name: '考试报名', width: 30, height: 40, unit: 'mm', usage: '高考、公务员等考试' },
  { id: 'driver', name: '驾照', width: 22, height: 32, unit: 'mm', usage: '驾驶证申请' },
  { id: 'social', name: '社保卡', width: 26, height: 32, unit: 'mm', usage: '社保卡申请' },
];

// 背景底色
const BACKGROUNDS = [
  { id: 'white', name: '白色', color: '#FFFFFF', hex: 'rgb(255,255,255)' },
  { id: 'blue', name: '蓝色', color: '#4A90E2', hex: 'rgb(74,144,226)' },
  { id: 'red', name: '红色', color: '#E63946', hex: 'rgb(230,57,70)' },
  { id: 'gray', name: '浅灰', color: '#F5F5F5', hex: 'rgb(245,245,245)' },
  { id: 'lightblue', name: '浅蓝', color: '#E8F4FD', hex: 'rgb(232,244,253)' },
];

// 步骤定义
const STEPS = [
  { id: 'upload', label: '上传照片', icon: Upload },
  { id: 'size', label: '选择尺寸', icon: FileImage },
  { id: 'background', label: '底色切换', icon: Palette },
  { id: 'beautify', label: '美颜优化', icon: Sparkles },
  { id: 'preview', label: '预览导出', icon: Eye },
];

// ==================== 类型 ====================
interface PhotoState {
  original: string | null;
  processed: string | null;
  fileName: string;
}

// ==================== 主组件 ====================
export default function PhotoIDGenerator() {
  // 步骤状态
  const [currentStep, setCurrentStep] = useState(0);
  
  // 照片状态
  const [photoState, setPhotoState] = useState<PhotoState>({
    original: null,
    processed: null,
    fileName: '',
  });
  
  // 选择状态
  const [selectedSize, setSelectedSize] = useState(PHOTO_SIZES[0]);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [beautyLevel, setBeautyLevel] = useState(30);
  
  // 处理状态
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  
  // 导出状态
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportQuality, setExportQuality] = useState<'standard' | 'hd' | 'ultra'>('standard');
  const [showWatermark, setShowWatermark] = useState(true);
  
  // 引导状态
  const [showGuide, setShowGuide] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 处理照片（模拟AI抠图）
  const processPhoto = useCallback(async () => {
    if (!photoState.original) return;
    
    setProcessing(true);
    setProcessingStep('正在分析人像...');
    await new Promise(r => setTimeout(r, 500));
    
    setProcessingStep('正在抠图...');
    await new Promise(r => setTimeout(r, 800));
    
    setProcessingStep('正在优化边缘...');
    await new Promise(r => setTimeout(r, 400));
    
    setProcessingStep('正在应用底色...');
    await new Promise(r => setTimeout(r, 300));
    
    // 模拟处理结果
    setPhotoState(prev => ({
      ...prev,
      processed: photoState.original,
    }));
    
    setProcessing(false);
    setProcessingStep('');
  }, [photoState.original]);

  // 上传照片
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoState({
          original: event.target?.result as string,
          processed: null,
          fileName: file.name,
        });
        setShowGuide(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoState({
          original: event.target?.result as string,
          processed: null,
          fileName: file.name,
        });
        setShowGuide(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 重新上传
  const handleReset = () => {
    setPhotoState({
      original: null,
      processed: null,
      fileName: '',
    });
    setCurrentStep(0);
    setShowGuide(true);
  };

  // 下一步
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      if (currentStep === 0 && photoState.original) {
        processPhoto();
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 生成预览图
  const generatePreview = useCallback(() => {
    if (!canvasRef.current || !photoState.original) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new window.Image();
    img.onload = () => {
      canvas.width = selectedSize.width * 4;
      canvas.height = selectedSize.height * 4;
      
      // 绘制背景
      ctx.fillStyle = selectedBg.hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制人像（简化模拟）
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = photoState.original;
  }, [photoState.original, selectedSize, selectedBg]);

  useEffect(() => {
    if (photoState.processed) {
      generatePreview();
    }
  }, [photoState.processed, selectedBg, generatePreview]);

  // 导出照片
  const handleExport = async () => {
    setExporting(true);
    
    await new Promise(r => setTimeout(r, 1500));
    
    // 模拟下载
    const link = document.createElement('a');
    link.download = `证件照_${selectedSize.name}_${selectedBg.name}_${Date.now()}.jpg`;
    link.href = photoState.processed || photoState.original || '';
    link.click();
    
    setExporting(false);
    setShowExport(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!photoState.original;
      case 1: return !!selectedSize;
      case 2: return !!selectedBg;
      case 3: return true;
      case 4: return !!photoState.processed;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <UtilityHeader
        toolIcon={<FileImage />}
        toolName="AI证件照生成"
        toolDescription="上传照片 · 智能抠图 · 合规导出"
        gradient="from-primary to-blue-600"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 隐私提示 */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">您的照片仅在本地处理，不上传、不存储，保障您的隐私安全</span>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => index < currentStep && setCurrentStep(index)}
                    disabled={index > currentStep}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                      isCompleted && "cursor-pointer",
                      isCurrent && "bg-primary text-primary-foreground shadow-md",
                      isCompleted && "bg-primary/10 text-primary",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧 - 操作区 */}
          <div className="lg:col-span-2">
            <Card className="min-h-[500px]">
              <CardContent className="p-6">
                {/* 步骤0: 上传照片 */}
                {currentStep === 0 && (
                  <div className="h-full flex flex-col">
                    {showGuide && (
                      <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-primary" />
                          上传指引
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 请上传正面免冠照片，五官清晰可见</li>
                          <li>• 建议使用近期照片，表情自然</li>
                          <li>• 确保光线均匀，面部无遮挡</li>
                          <li>• 支持 JPG、PNG 格式，大小不超过 10MB</li>
                        </ul>
                      </div>
                    )}
                    
                    <div
                      className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 transition-colors hover:border-primary/50 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />
                      
                      {photoState.original ? (
                        <div className="text-center">
                          <div className="w-48 h-48 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-border">
                            <img
                              src={photoState.original}
                              alt="上传的照片"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{photoState.fileName}</p>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            重新上传
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="w-10 h-10 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            点击上传或拖拽照片
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            支持 JPG、PNG、WEBP 格式
                          </p>
                          <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            选择文件
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 步骤1: 选择尺寸 */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">选择证件照尺寸</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PHOTO_SIZES.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            selectedSize.id === size.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">{size.name}</span>
                            {selectedSize.id === size.id && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {size.width}×{size.height}{size.unit}
                          </p>
                          <p className="text-xs text-primary">{size.usage}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 步骤2: 底色切换 */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">选择背景底色</h3>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                      {BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setSelectedBg(bg)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-center transition-all",
                            selectedBg.id === bg.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div
                            className="w-16 h-16 mx-auto mb-2 rounded-lg border shadow-sm"
                            style={{ backgroundColor: bg.color }}
                          />
                          <span className="text-sm font-medium text-foreground">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* 预览 */}
                    <div className="border-t border-border pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">效果预览</h4>
                      <div className="flex items-center justify-center">
                        <div
                          className="rounded-lg shadow-lg overflow-hidden"
                          style={{
                            width: selectedSize.width * 4,
                            height: selectedSize.height * 4,
                            maxWidth: '100%',
                            backgroundColor: selectedBg.color,
                          }}
                        >
                          {photoState.original && (
                            <img
                              src={photoState.original}
                              alt="预览效果"
                              className="w-full h-full object-contain"
                              style={{ mixBlendMode: 'multiply' }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 步骤3: 美颜优化 */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">美颜优化</h3>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">美颜强度</span>
                        <span className="text-sm text-primary font-medium">{beautyLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={beautyLevel}
                        onChange={(e) => setBeautyLevel(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>自然</span>
                        <span>强力</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30 mb-6">
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        提示：证件照美颜仅优化肤质，不改变五官，请放心使用。建议美颜强度不超过50%以确保合规。
                      </p>
                    </div>
                    
                    {/* 预览对比 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">原图</p>
                        <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                          {photoState.original && (
                            <img
                              src={photoState.original}
                              alt="原图"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">美颜后</p>
                        <div 
                          className="aspect-square rounded-xl overflow-hidden"
                          style={{ backgroundColor: selectedBg.color }}
                        >
                          {photoState.original && (
                            <img
                              src={photoState.original}
                              alt="美颜后"
                              className="w-full h-full object-contain"
                              style={{ filter: `brightness(${1 + beautyLevel/500}) contrast(${1 - beautyLevel/500})` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 步骤4: 预览导出 */}
                {currentStep === 4 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">预览效果</h3>
                    
                    {/* 证件照预览 */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div
                          className="rounded-lg overflow-hidden shadow-inner"
                          style={{
                            width: Math.min(selectedSize.width * 8, 320),
                            height: Math.min(selectedSize.height * 8, 320),
                          }}
                        >
                          {photoState.original && (
                            <img
                              src={photoState.original}
                              alt="证件照预览"
                              className="w-full h-full object-contain"
                              style={{ 
                                backgroundColor: selectedBg.color,
                                mixBlendMode: 'multiply'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 规格信息 */}
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
                      <span>尺寸：{selectedSize.width}×{selectedSize.height}{selectedSize.unit}</span>
                      <span>•</span>
                      <span>底色：{selectedBg.name}</span>
                      <span>•</span>
                      <span>用途：{selectedSize.usage}</span>
                    </div>
                    
                    {/* 导出按钮 */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto"
                        onClick={() => setShowExport(true)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        导出证件照
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full sm:w-auto"
                        onClick={handleReset}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新制作
                      </Button>
                    </div>
                    
                    {/* 合规提示 */}
                    <p className="text-xs text-muted-foreground text-center mt-6">
                      本工具生成的证件照仅供个人合法用途（办证、报名等），禁止用于虚假身份、违法违规用途。
                    </p>
                  </div>
                )}

                {/* 处理中状态 */}
                {processing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-foreground font-medium">{processingStep}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 导航按钮 */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>
              
              {currentStep < STEPS.length - 1 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  {currentStep === 0 ? '上传并处理' : '下一步'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* 右侧 - 信息面板 */}
          <div className="space-y-6">
            {/* 当前配置 */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">当前配置</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">尺寸</span>
                    <Badge variant="secondary">{selectedSize.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">底色</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: selectedBg.color }}
                      />
                      <Badge variant="secondary">{selectedBg.name}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">美颜</span>
                    <Badge variant="secondary">{beautyLevel}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 隐私保障 */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  隐私保障
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>本地处理，不上传云端</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>不存储用户图像数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>关闭页面自动清理</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>符合个人信息保护法</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 会员权益 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">升级会员</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>高清导出 (300dpi)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>无水印导出</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>多底色打包下载</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>批量处理</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  <Crown className="w-4 h-4 mr-2" />
                  9.9元 开通会员
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 导出弹窗 */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">导出设置</h3>
                <button
                  onClick={() => setShowExport(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {/* 清晰度选择 */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">清晰度</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: '基础', desc: '72-150dpi', free: true },
                    { id: 'hd', label: '高清', desc: '300dpi', free: false },
                    { id: 'ultra', label: '超高清', desc: '600dpi', free: false },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setExportQuality(q.id as any)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-center transition-all",
                        exportQuality === q.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium text-foreground">{q.label}</div>
                      <div className="text-xs text-muted-foreground">{q.desc}</div>
                      {q.free && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">免费</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 水印选项 */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">水印设置</label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div className="flex items-center gap-2">
                    {showWatermark ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-sm text-foreground">
                      {showWatermark ? '带水印' : '无水印'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWatermark(!showWatermark)}
                  >
                    {showWatermark ? '去除水印' : '恢复水印'}
                  </Button>
                </div>
                {showWatermark && (
                  <p className="text-xs text-muted-foreground mt-2">
                    水印内容：「AI证件照生成，仅供参考」
                  </p>
                )}
              </div>
              
              {/* 导出按钮 */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    确认导出
                  </>
                )}
              </Button>
              
              {!showWatermark && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  开通会员可享无水印导出
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 隐藏的Canvas用于生成导出图 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
