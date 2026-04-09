'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle,
  CheckCircle, XCircle, Loader2, Trash2
} from 'lucide-react';

interface ParsedTool {
  rank: number;
  tool_name: string;
  tool_url: string;
  tool_logo?: string;
  monthly_visits: string;
  growth?: string;
  growth_rate?: string;
  category?: string;
  tool_description?: string;
  _error?: string;
}

export default function RankingsImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importMonth, setImportMonth] = useState(() => {
    // 默认当前月份
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [parsedData, setParsedData] = useState<ParsedTool[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 解析 CSV 数据
  const parseCSV = (text: string): ParsedTool[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV 文件至少需要包含标题行和数据行');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // 字段映射
    const fieldMap: Record<string, string[]> = {
      rank: ['rank', '排行', '排名', 'no'],
      tool_name: ['tool_name', 'name', 'tool', '工具名称', '工具名'],
      tool_url: ['tool_url', 'url', 'link', '官网', '官网链接'],
      tool_logo: ['tool_logo', 'logo', '图标'],
      monthly_visits: ['monthly_visits', 'visits', '访问量', '月访问量'],
      growth: ['growth', '增长'],
      growth_rate: ['growth_rate', 'rate', '增长率'],
      category: ['category', '分类'],
      tool_description: ['tool_description', 'description', 'desc', '简介', '描述'],
    };

    const getFieldIndex = (fieldName: string): number => {
      const aliases = fieldMap[fieldName] || [fieldName];
      return headers.findIndex(h => aliases.includes(h));
    };

    const data: ParsedTool[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 简单 CSV 解析（处理带引号的字段）
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const rankIdx = getFieldIndex('rank');
      const nameIdx = getFieldIndex('tool_name');
      const urlIdx = getFieldIndex('tool_url');
      const visitsIdx = getFieldIndex('monthly_visits');

      if (nameIdx === -1 || urlIdx === -1) {
        parseErrors.push(`第 ${i + 1} 行：缺少必要的工具名称或链接字段`);
        continue;
      }

      const tool: ParsedTool = {
        rank: rankIdx !== -1 && values[rankIdx] ? parseInt(values[rankIdx]) || (i) : i,
        tool_name: values[nameIdx]?.replace(/^"|"$/g, '') || '',
        tool_url: values[urlIdx]?.replace(/^"|"$/g, '') || '',
        tool_logo: getFieldIndex('tool_logo') !== -1 ? values[getFieldIndex('tool_logo')]?.replace(/^"|"$/g, '') : undefined,
        monthly_visits: visitsIdx !== -1 ? values[visitsIdx]?.replace(/^"|"$/g, '') || '-' : '-',
        growth: getFieldIndex('growth') !== -1 ? values[getFieldIndex('growth')]?.replace(/^"|"$/g, '') : undefined,
        growth_rate: getFieldIndex('growth_rate') !== -1 ? values[getFieldIndex('growth_rate')]?.replace(/^"|"$/g, '') : undefined,
        category: getFieldIndex('category') !== -1 ? values[getFieldIndex('category')]?.replace(/^"|"$/g, '') : undefined,
        tool_description: getFieldIndex('tool_description') !== -1 ? values[getFieldIndex('tool_description')]?.replace(/^"|"$/g, '') : undefined,
      };

      // 验证必填字段
      if (!tool.tool_name) {
        tool._error = '缺少工具名称';
        parseErrors.push(`第 ${i + 1} 行：缺少工具名称`);
      }
      if (!tool.tool_url) {
        tool._error = '缺少官网链接';
        parseErrors.push(`第 ${i + 1} 行：缺少官网链接`);
      }

      data.push(tool);
    }

    setErrors(parseErrors);
    return data;
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      setImportResult(null);
    } catch (error) {
      setErrors([(error as Error).message]);
      setParsedData([]);
    }
  };

  // 处理导入
  const handleImport = async () => {
    if (parsedData.length === 0) {
      setErrors(['请先上传数据文件']);
      return;
    }

    setImporting(true);
    setImportResult(null);
    setErrors([]);

    try {
      const res = await fetch('/api/rankings/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: importMonth,
          tools: parsedData,
          mode: importMode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setImportResult({
          success: true,
          message: `成功导入 ${data.data?.length || 0} 条数据`,
          count: data.data?.length || 0,
        });
        // 清空已解析数据
        setParsedData([]);
      } else {
        setImportResult({
          success: false,
          message: data.error || '导入失败',
        });
        if (data.details) {
          setErrors([JSON.stringify(data.details)]);
        }
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: (error as Error).message || '导入失败',
      });
    } finally {
      setImporting(false);
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    const template = `rank,tool_name,tool_url,tool_logo,monthly_visits,growth,growth_rate,category,tool_description
1,ChatGPT,https://chat.openai.com,https://chat.openai.com/favicon.ico,1.4B,+169.7M,14.36%,AI聊天,OpenAI开发的AI聊天机器人
2,Claude,https://claude.ai,https://claude.ai/favicon.ico,562.3M,+23.5M,4.36%,AI聊天,Anthropic开发的AI助手
3,Midjourney,https://www.midjourney.com,https://www.midjourney.com/favicon.ico,89.2M,-12.3M,-12.12%,AI图像,AI图像生成工具`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankings_template_${importMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/rankings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">导入榜单数据</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            支持 CSV 格式导入，按月管理 AI 工具排名数据
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 导入配置 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本配置 */}
          <Card>
            <CardHeader>
              <CardTitle>导入配置</CardTitle>
              <CardDescription>设置导入的月份和数据处理方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="importMonth">统计月份</Label>
                  <Input
                    id="importMonth"
                    type="month"
                    value={importMonth}
                    onChange={(e) => setImportMonth(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>导入模式</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-orange-500"
                      />
                      <span className="text-sm">替换</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-orange-500"
                      />
                      <span className="text-sm">追加</span>
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {importMode === 'replace' 
                  ? '替换模式将删除该月份原有数据，请谨慎使用' 
                  : '追加模式将保留原有数据，仅新增新条目'}
              </p>
            </CardContent>
          </Card>

          {/* 文件上传 */}
          <Card>
            <CardHeader>
              <CardTitle>上传数据文件</CardTitle>
              <CardDescription>支持 CSV 格式，建议使用 UTF-8 编码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
              >
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  点击或拖拽上传 CSV 文件
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  支持 .csv 格式，最大 10MB
                </p>
              </div>

              <Button variant="outline" className="w-full gap-2" onClick={downloadTemplate}>
                <Download className="w-4 h-4" />
                下载 CSV 模板
              </Button>
            </CardContent>
          </Card>

          {/* 数据预览 */}
          {parsedData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>数据预览</CardTitle>
                  <CardDescription>
                    共 {parsedData.length} 条数据，其中 {parsedData.filter(d => d._error).length} 条有错误
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParsedData([])}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                      <tr className="text-left">
                        <th className="px-4 py-2 font-medium">排行</th>
                        <th className="px-4 py-2 font-medium">工具名称</th>
                        <th className="px-4 py-2 font-medium">官网链接</th>
                        <th className="px-4 py-2 font-medium">月访问量</th>
                        <th className="px-4 py-2 font-medium">增长率</th>
                        <th className="px-4 py-2 font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {parsedData.slice(0, 50).map((item, idx) => (
                        <tr key={idx} className={item._error ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                          <td className="px-4 py-2">{item.rank}</td>
                          <td className="px-4 py-2">{item.tool_name}</td>
                          <td className="px-4 py-2 truncate max-w-xs">{item.tool_url}</td>
                          <td className="px-4 py-2">{item.monthly_visits}</td>
                          <td className="px-4 py-2">{item.growth_rate || '-'}</td>
                          <td className="px-4 py-2">
                            {item._error ? (
                              <span className="text-red-500 text-xs">{item._error}</span>
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 50 && (
                    <div className="text-center py-2 text-sm text-slate-500">
                      仅显示前 50 条...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 错误信息 */}
          {errors.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2 text-base">
                  <AlertCircle className="w-5 h-5" />
                  解析错误
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  {errors.slice(0, 10).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {errors.length > 10 && (
                    <li>... 还有 {errors.length - 10} 条错误</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 导入结果 */}
          {importResult && (
            <Card className={importResult.success ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {importResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <div>
                    <p className={`font-medium ${importResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {importResult.message}
                    </p>
                    {importResult.success && (
                      <p className="text-sm text-slate-500 mt-1">
                        <Link href="/admin/rankings" className="text-orange-500 hover:underline">
                          返回榜单管理
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 操作按钮 */}
          <Card>
            <CardHeader>
              <CardTitle>开始导入</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                disabled={parsedData.length === 0 || importing}
                onClick={handleImport}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    开始导入
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/admin/rankings')}
              >
                取消
              </Button>
            </CardContent>
          </Card>

          {/* 导入说明 */}
          <Card>
            <CardHeader>
              <CardTitle>导入说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
              <div>
                <h4 className="font-medium mb-1">必填字段</h4>
                <ul className="list-disc list-inside text-slate-500 text-xs space-y-1">
                  <li>tool_name - 工具名称</li>
                  <li>tool_url - 官网链接</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">可选字段</h4>
                <ul className="list-disc list-inside text-slate-500 text-xs space-y-1">
                  <li>rank - 排名</li>
                  <li>tool_logo - Logo URL</li>
                  <li>monthly_visits - 月访问量</li>
                  <li>growth - 增长绝对值</li>
                  <li>growth_rate - 增长率</li>
                  <li>category - 分类</li>
                  <li>tool_description - 工具简介</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">格式要求</h4>
                <ul className="list-disc list-inside text-slate-500 text-xs space-y-1">
                  <li>使用 UTF-8 编码</li>
                  <li>第一行为表头</li>
                  <li>逗号分隔</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
