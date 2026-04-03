'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, Check, X, Star, ExternalLink, ArrowLeftRight,
  Video
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import Link from 'next/link';

// 类型定义
interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  free_type: string;
  free_quota_desc: string;
  feature_tags: string[];
  max_duration: string;
  official_url: string;
  promotion_url: string;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  rating: number;
  rating_count: number;
  click_count: number;
  categories: { name: string };
}

interface Comparison {
  tools: Tool[];
  dimensions: {
    name: string;
    key: string;
    values: string[];
  }[];
}

// 免费类型颜色
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700',
  '免费额度': 'bg-blue-100 text-blue-700',
  '限时免费': 'bg-orange-100 text-orange-700',
  '付费工具': 'bg-slate-100 text-slate-700',
};

export default function ComparePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(false);

  // 搜索工具
  const searchTools = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/tools?search=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  // 添加工具到对比列表
  const addTool = (tool: Tool) => {
    if (selectedTools.length >= 4) {
      alert('最多选择4个工具进行对比');
      return;
    }
    if (selectedTools.find(t => t.id === tool.id)) {
      return;
    }
    setSelectedTools([...selectedTools, tool]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 移除工具
  const removeTool = (toolId: number) => {
    setSelectedTools(selectedTools.filter(t => t.id !== toolId));
    setComparison(null);
  };

  // 执行对比
  const doCompare = async () => {
    if (selectedTools.length < 2) {
      alert('请至少选择2个工具');
      return;
    }

    setLoading(true);
    try {
      const ids = selectedTools.map(t => t.id).join(',');
      const res = await fetch(`/api/compare?ids=${ids}`);
      const data = await res.json();
      if (data.success) {
        setComparison(data.data);
      }
    } catch (error) {
      console.error('对比失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">工具对比</p>
              </div>
            </Link>

            <Link href="/">
              <Button variant="outline" size="sm">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 选择工具区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            选择要对比的工具 (2-4个)
          </h2>

          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索工具名称..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchTools(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            
            {/* 搜索结果下拉 */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchResults.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => addTool(tool)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                  >
                    <img src={tool.logo} alt="" className="w-8 h-8 rounded object-contain" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{tool.name}</p>
                      <p className="text-xs text-slate-500">{tool.highlight}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 已选择的工具 */}
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedTools.map(tool => (
              <div 
                key={tool.id}
                className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
              >
                <img src={tool.logo} alt="" className="w-6 h-6 rounded object-contain" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{tool.name}</span>
                <button
                  onClick={() => removeTool(tool.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {selectedTools.length === 0 && (
              <p className="text-sm text-slate-500">请在上方搜索并添加工具</p>
            )}
          </div>

          <Button
            onClick={doCompare}
            disabled={selectedTools.length < 2 || loading}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {loading ? '对比中...' : '开始对比'}
          </Button>
        </div>

        {/* 对比结果 */}
        {comparison && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32 bg-slate-50 dark:bg-slate-900 font-medium">
                      对比维度
                    </TableHead>
                    {comparison.tools.map(tool => (
                      <TableHead key={tool.id} className="min-w-48">
                        <div className="flex items-center gap-3">
                          <img src={tool.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-100" />
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-slate-500">{tool.producer}</p>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.dimensions.map((dim, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium bg-slate-50 dark:bg-slate-900">
                        {dim.name}
                      </TableCell>
                      {dim.values.map((value, vidx) => (
                        <TableCell key={vidx}>
                          {dim.key === 'free_type' ? (
                            <Badge className={FREE_TYPE_COLORS[value] || ''}>{value}</Badge>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300">{value}</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  
                  {/* 核心优势 */}
                  <TableRow>
                    <TableCell className="font-medium bg-slate-50 dark:bg-slate-900">核心优势</TableCell>
                    {comparison.tools.map(tool => (
                      <TableCell key={tool.id}>
                        <ul className="space-y-1">
                          {tool.advantages.map((adv, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {adv}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 局限性 */}
                  <TableRow>
                    <TableCell className="font-medium bg-slate-50 dark:bg-slate-900">局限性</TableCell>
                    {comparison.tools.map(tool => (
                      <TableCell key={tool.id}>
                        <ul className="space-y-1">
                          {tool.limitations.map((lim, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              {lim}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 功能标签 */}
                  <TableRow>
                    <TableCell className="font-medium bg-slate-50 dark:bg-slate-900">功能标签</TableCell>
                    {comparison.tools.map(tool => (
                      <TableCell key={tool.id}>
                        <div className="flex flex-wrap gap-1">
                          {tool.feature_tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 操作 */}
                  <TableRow>
                    <TableCell className="font-medium bg-slate-50 dark:bg-slate-900">操作</TableCell>
                    {comparison.tools.map(tool => (
                      <TableCell key={tool.id}>
                        <Button
                          size="sm"
                          onClick={() => window.open(tool.promotion_url || tool.official_url, '_blank')}
                          className="bg-gradient-to-r from-orange-500 to-red-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          访问官网
                        </Button>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!comparison && selectedTools.length < 2 && (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
              选择2-4个工具进行对比
            </h3>
            <p className="text-sm text-slate-500">
              搜索并添加工具，然后点击"开始对比"按钮
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
