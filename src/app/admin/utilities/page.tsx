'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  BookOpen, 
  ShoppingBag, 
  TestTube2,
  Search,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ToolStats {
  resume: { total: number; success: number; failed: number };
  novel: { total: number; success: number; failed: number };
  product_page: { total: number; success: number; failed: number };
  testcraft: { total: number; success: number; failed: number };
}

interface UsageLog {
  id: number;
  tool_type: string;
  user_id: string | null;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  status: string;
  error_message: string | null;
  ip_address: string | null;
  created_at: string;
}

const TOOL_INFO: Record<string, { name: string; icon: typeof FileText; color: string }> = {
  resume: { name: '简历优化', icon: FileText, color: 'text-blue-500' },
  novel: { name: '网文创作', icon: BookOpen, color: 'text-purple-500' },
  product_page: { name: '出海详情页', icon: ShoppingBag, color: 'text-green-500' },
  testcraft: { name: 'AI测试用例', icon: TestTube2, color: 'text-orange-500' },
};

export default function UtilitiesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ToolStats | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/utilities/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data.toolStats);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 获取使用记录
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (selectedTool !== 'all') params.set('tool_type', selectedTool);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/admin/utilities?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取使用记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedTool, selectedStatus]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchLogs();
      return;
    }
    const filtered = logs.filter(log => {
      const inputStr = JSON.stringify(log.input_data || {});
      const outputStr = JSON.stringify(log.output_data || {});
      return inputStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
             outputStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (log.ip_address && log.ip_address.includes(searchQuery));
    });
    setLogs(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const res = await fetch(`/api/admin/utilities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchLogs(pagination.page);
        fetchStats();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleViewDetail = (log: UsageLog) => {
    setSelectedLog(log);
    setShowDetail(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  const getToolIcon = (toolType: string) => {
    const info = TOOL_INFO[toolType] || { name: toolType, icon: FileText, color: 'text-gray-500' };
    const Icon = info.icon;
    return <Icon className={`w-4 h-4 ${info.color}`} />;
  };

  const getToolName = (toolType: string) => {
    return TOOL_INFO[toolType]?.name || toolType;
  };

  // 计算总计
  const totalUsage = stats ? 
    stats.resume.total + stats.novel.total + stats.product_page.total + stats.testcraft.total : 0;
  const totalSuccess = stats ?
    stats.resume.success + stats.novel.success + stats.product_page.success + stats.testcraft.success : 0;
  const totalFailed = stats ?
    stats.resume.failed + stats.novel.failed + stats.product_page.failed + stats.testcraft.failed : 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold">实用工具管理</h2>
        <p className="text-sm text-slate-500">查看和管理实用工具的使用记录</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">总使用次数</p>
                <p className="text-3xl font-bold">{totalUsage}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">成功次数</p>
                <p className="text-3xl font-bold">{totalSuccess}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">失败次数</p>
                <p className="text-3xl font-bold">{totalFailed}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <XCircle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">成功率</p>
                <p className="text-3xl font-bold">
                  {totalUsage > 0 ? ((totalSuccess / totalUsage) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 各工具统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TOOL_INFO).map(([key, info]) => {
          const Icon = info.icon;
          const toolStats = stats?.[key as keyof ToolStats] || { total: 0, success: 0, failed: 0 };
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`w-5 h-5 ${info.color}`} />
                  {info.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">使用次数</span>
                    <span className="font-semibold">{toolStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">成功</span>
                    <span className="text-green-600 font-medium">{toolStats.success}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">失败</span>
                    <span className="text-red-600 font-medium">{toolStats.failed}</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: toolStats.total > 0 ? `${(toolStats.success / toolStats.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 使用记录列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>使用记录</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="选择工具" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部工具</SelectItem>
                  <SelectItem value="resume">简历优化</SelectItem>
                  <SelectItem value="novel">网文创作</SelectItem>
                  <SelectItem value="product_page">出海详情页</SelectItem>
                  <SelectItem value="testcraft">AI测试用例</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input 
                  placeholder="搜索内容/IP..." 
                  className="w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              暂无使用记录
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>工具类型</TableHead>
                    <TableHead>用户ID</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>使用时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getToolIcon(log.tool_type)}
                          <span>{getToolName(log.tool_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {log.user_id || '-'}
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge className="bg-green-500">成功</Badge>
                        ) : (
                          <Badge variant="destructive">失败</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {log.ip_address || '-'}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewDetail(log)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(log.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    第 {pagination.page} / {pagination.total_pages} 页，共 {pagination.total} 条
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchLogs(pagination.page - 1)}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages}
                      onClick={() => fetchLogs(pagination.page + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>使用记录详情</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">工具类型</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getToolIcon(selectedLog.tool_type)}
                    <span className="font-medium">{getToolName(selectedLog.tool_type)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">状态</p>
                  <div className="mt-1">
                    {selectedLog.status === 'success' ? (
                      <Badge className="bg-green-500">成功</Badge>
                    ) : (
                      <Badge variant="destructive">失败</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">用户ID</p>
                  <p className="font-medium mt-1">{selectedLog.user_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">IP地址</p>
                  <p className="font-medium mt-1">{selectedLog.ip_address || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">使用时间</p>
                  <p className="font-medium mt-1">{formatDate(selectedLog.created_at)}</p>
                </div>
              </div>

              {selectedLog.error_message && (
                <div>
                  <p className="text-sm text-slate-500">错误信息</p>
                  <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500">输入数据</p>
                <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.input_data, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedLog.output_data && (
                <div>
                  <p className="text-sm text-slate-500">输出数据</p>
                  <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.output_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
