'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Check } from 'lucide-react';

export default function ImportToolsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [previewCount, setPreviewCount] = useState(0);

  const handleImportFromExisting = async () => {
    if (!confirm('确定要从现有数据导入工具吗？这将导入 src/data/tools.ts 中的所有工具。')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 动态导入现有工具数据
      const { aiTools } = await import('@/data/tools');
      setPreviewCount(aiTools.length);

      const res = await fetch('/api/admin/tools/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: aiTools }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('导入失败:', error);
      setResult({ success: false, message: '导入失败，请查看控制台' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const tools = JSON.parse(text);
      
      if (!Array.isArray(tools)) {
        throw new Error('无效的JSON格式，需要数组');
      }

      setPreviewCount(tools.length);

      const res = await fetch('/api/admin/tools/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('导入失败:', error);
      setResult({ 
        success: false, 
        message: '导入失败: ' + (error instanceof Error ? error.message : '未知错误') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/admin/tools"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回工具列表
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
          批量导入工具
        </h1>

        {/* 从现有数据导入 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
            从现有数据导入
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            从项目中的 src/data/tools.ts 文件导入现有的 117 个工具数据到数据库。
          </p>
          <button
            onClick={handleImportFromExisting}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white 
              font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                导入中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                从现有数据导入
              </>
            )}
          </button>
        </div>

        {/* 分割线 */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">或者</span>
          </div>
        </div>

        {/* 从JSON文件导入 */}
        <div>
          <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
            从JSON文件导入
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            上传JSON格式的工具数据文件。格式参考：
          </p>
          <pre className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-4 overflow-x-auto">
{`[
  {
    "name": "工具名称",
    "logo": "https://example.com/logo.png",
    "producer": "出品方名称",
    "description": "工具简介",
    "category": "视频生成",
    "url": "https://example.com",
    "tags": ["功能标签"],
    "features": ["功能1", "功能2"],
    "pricing": "免费试用",
    "featured": true
  }
]`}
          </pre>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white 
            font-medium hover:bg-blue-600 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            选择JSON文件
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>

        {/* 导入结果 */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-red-500">✕</span>
              )}
              <span className={`font-medium ${
                result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {result.message}
              </span>
            </div>
            {previewCount > 0 && result.success && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                共处理 {previewCount} 个工具
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
