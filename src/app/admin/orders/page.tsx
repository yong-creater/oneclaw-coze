'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  CreditCard, Search, Calendar, User, Clock,
  CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import AnimatedLobster from '@/components/AnimatedLobster';

// 订单状态配置
const ORDER_STATUS = {
  pending: { name: '待支付', color: 'bg-yellow-500', icon: Clock },
  paid: { name: '已支付', color: 'bg-green-500', icon: CheckCircle },
  failed: { name: '支付失败', color: 'bg-red-500', icon: XCircle },
  refunded: { name: '已退款', color: 'bg-slate-500', icon: RefreshCw },
};

// 产品类型配置
const PRODUCT_TYPES = {
  monthly: { name: '月度会员', price: 19 },
  yearly: { name: '年度会员', price: 99 },
  lifetime: { name: '终身会员', price: 299 },
};

interface Order {
  id: number;
  order_no: string;
  user_id: string;
  product_type: string;
  amount: number;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    pendingCount: 0,
    paidCount: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data || []);
        
        // 计算统计
        const paidOrders = (data.data || []).filter((o: Order) => o.status === 'paid');
        const pendingOrders = (data.data || []).filter((o: Order) => o.status === 'pending');
        
        setStats({
          total: data.data?.length || 0,
          totalAmount: paidOrders.reduce((sum: number, o: Order) => sum + (o.amount || 0), 0),
          pendingCount: pendingOrders.length,
          paidCount: paidOrders.length,
        });
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw Admin
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">订单管理</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">前台首页</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">总订单数</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
                </div>
                <CreditCard className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">总收入</p>
                  <p className="text-2xl font-bold text-green-500">{formatAmount(stats.totalAmount)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">待支付</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">已完成</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.paidCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索订单号或用户ID..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="订单状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待支付</SelectItem>
              <SelectItem value="paid">已支付</SelectItem>
              <SelectItem value="failed">支付失败</SelectItem>
              <SelectItem value="refunded">已退款</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 订单列表 */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">加载中...</div>
        ) : filteredOrders.length > 0 ? (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">订单号</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">用户ID</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">产品</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">金额</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">状态</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">支付时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const StatusIcon = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.icon || AlertCircle;
                    return (
                      <tr key={order.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm">{order.order_no}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">{order.user_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{PRODUCT_TYPES[order.product_type as keyof typeof PRODUCT_TYPES]?.name || order.product_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-green-600 dark:text-green-400">{formatAmount(order.amount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-slate-500'} text-white`}>
                            {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.name || order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(order.paid_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="py-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">暂无订单数据</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
