'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileJson, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BatchImportPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // 读取文件内容
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setJsonInput(content);
          
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setPreview(parsed.slice(0, 5));
          } else if (parsed.tools && Array.isArray(parsed.tools)) {
            setPreview(parsed.tools.slice(0, 5));
          }
        } catch (error) {
          console.error('解析文件失败:', error);
          setPreview(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      alert('请输入或上传JSON数据');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      let tools = [];
      const parsed = JSON.parse(jsonInput);
      
      if (Array.isArray(parsed)) {
        tools = parsed;
      } else if (parsed.tools && Array.isArray(parsed.tools)) {
        tools = parsed.tools;
      } else {
        throw new Error('无效的数据格式');
      }

      const response = await fetch('/api/admin/tools/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: data.data?.inserted || tools.length,
          failed: 0,
          errors: [],
        });
        setJsonInput('');
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setResult({
          success: 0,
          failed: tools.length,
          errors: [data.error || '导入失败'],
        });
      }
    } catch (error) {
      console.error('导入失败:', error);
      setResult({
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : '解析JSON失败'],
      });
    } finally {
      setImporting(false);
    }
  };

  const sampleData = [
    {
      name: '示例工具1',
      logo: 'https://example.com/logo.png',
      producer: '示例出品方',
      category: '视频生成',
      pricing: '免费试用，付费版 $19/月起',
      description: '这是一个示例工具的简短描述',
      url: 'https://example.com',
      featured: false,
      tags: ['AI生成', '视频制作'],
      features: ['高清输出', '快速生成', '多种模板']
    },
    {
      name: '示例工具2',
      logo: 'https://example2.com/logo.png',
      producer: '示例出品方2',
      category: '数字人',
      pricing: '完全免费',
      description: '这是另一个示例工具',
      url: 'https://example2.com',
      featured: true,
      tags: ['数字人', 'AI主播'],
      features: ['实时互动', '多语言支持']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/admin/tools"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回工具列表
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">批量导入工具</h1>
          <p className="text-sm text-slate-500 mt-1">
            支持JSON格式数据，可一次导入多个工具
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* 文件上传 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              上传JSON文件
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {file ? (
                  <>
                    <FileJson className="w-12 h-12 text-orange-500 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">点击或拖拽上传JSON文件</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* JSON输入框 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              或直接粘贴JSON数据
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (Array.isArray(parsed)) {
                    setPreview(parsed.slice(0, 5));
                  } else if (parsed.tools && Array.isArray(parsed.tools)) {
                    setPreview(parsed.tools.slice(0, 5));
                  }
                } catch {
                  setPreview(null);
                }
              }}
              placeholder={`示例格式：
[
  {
    "name": "工具名称",
    "logo": "https://...",
    "producer": "出品方",
    "category": "视频生成",
    "pricing": "免费试用，付费版 $19/月起",
    "description": "工具描述",
    "url": "https://...",
    "tags": ["AI生成", "视频制作"],
    "features": ["特性1", "特性2"]
  }
]`}
              className="w-full h-64 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 
                font-mono text-sm text-slate-600 dark:text-slate-300"
            />
          </div>

          {/* 数据预览 */}
          {preview && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                数据预览（前5条）
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 导入结果 */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.failed === 0 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.failed === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    导入完成
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    成功: {result.success} 个，失败: {result.failed} 个
                  </p>
                  {result.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {result.errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setJsonInput(JSON.stringify(sampleData, null, 2));
                setPreview(sampleData);
              }}
            >
              填充示例数据
            </Button>

            <Button
              onClick={handleImport}
              disabled={importing || !jsonInput.trim()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  开始导入
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            数据格式说明
          </h3>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p>• <strong>name</strong>: 工具名称（必填）</p>
            <p>• <strong>logo</strong>: Logo图片URL</p>
            <p>• <strong>producer</strong>: 出品方名称</p>
            <p>• <strong>category</strong>: 分类名称（视频生成/数字人/视频编辑/AI配音/动漫创作）</p>
            <p>• <strong>pricing</strong>: 价格信息（完全免费/免费试用/付费工具等）</p>
            <p>• <strong>description</strong>: 工具描述</p>
            <p>• <strong>url</strong>: 官网链接</p>
            <p>• <strong>tags</strong>: 功能标签数组</p>
            <p>• <strong>features</strong>: 特性列表数组</p>
            <p>• <strong>featured</strong>: 是否推荐（true/false）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
