'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, Calendar, Clock, Play, Pause, CheckCircle, 
  AlertCircle, Loader2, Trash2, Info, Key, Save
} from 'lucide-react';

interface UpdateConfig {
  auto_update_enabled: boolean;
  update_schedule: string; // cron 表达式或 daily/weekly
  update_time: string; // HH:mm 格式
  last_update: string;
  next_update: string;
}

interface UpdateLog {
  id: number;
  update_month: string;
  update_type: string;
  status: string;
  total_count: number;
  error_count: number;
  created_at: string;
}

export default function SchedulerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateLog, setUpdateLog] = useState<UpdateLog | null>(null);
  const [config, setConfig] = useState<UpdateConfig>({
    auto_update_enabled: false,
    update_schedule: 'daily',
    update_time: '02:00',
    last_update: '',
    next_update: '',
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // 获取配置和更新日志
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 获取配置（从 ranking_configs 表）
      const configRes = await fetch('/api/admin/rankings/config');
      const configData = await configRes.json();
      
      if (configData.success && configData.data) {
        const cfg = configData.data;
        setConfig({
          auto_update_enabled: cfg.auto_update_enabled || false,
          update_schedule: cfg.update_schedule || 'daily',
          update_time: cfg.update_time || '02:00',
          last_update: cfg.last_update || '',
          next_update: calculateNextUpdate(cfg.update_schedule || 'daily', cfg.update_time || '02:00'),
        });
      }
      
      // 获取最近一次更新日志
      const logsRes = await fetch('/api/admin/rankings/logs?limit=1');
      const logsData = await logsRes.json();
      
      if (logsData.success && logsData.data?.length > 0) {
        setUpdateLog(logsData.data[0]);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 手动触发更新
  const handleManualUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/rankings/auto-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUpdateLog({
          id: Date.now(),
          update_month: data.data?.month,
          update_type: 'manual',
          status: 'success',
          total_count: data.data?.count || 0,
          error_count: 0,
          created_at: data.data?.updated_at || new Date().toISOString(),
        });
        // 刷新配置
        fetchData();
      } else {
        alert(`更新失败: ${data.error}`);
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setUpdating(false);
    }
  };

  // 保存配置
  const handleSaveConfig = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/rankings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        alert(`保存失败: ${data.error}`);
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setSaveStatus('idle');
    }
  };

  // 计算下次更新时间
  const calculateNextUpdate = (schedule: string, time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 生成 Cron 表达式帮助
  const getCronHelp = (schedule: string, time: string) => {
    const [hours, minutes] = time.split(':');
    switch (schedule) {
      case 'daily':
        return `0 ${hours} * * *  (每天 ${time})`;
      case 'weekly':
        return `0 ${hours} * * 1  (每周一 ${time})`;
      case 'monthly':
        return `0 ${hours} 1 * *  (每月1号 ${time})`;
      default:
        return `0 ${hours} * * *`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          定时任务设置
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          配置榜单数据的自动更新计划
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：配置表单 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 更新配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                更新计划
              </CardTitle>
              <CardDescription>
                设置榜单数据的自动更新频率和时间
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 启用自动更新 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>启用自动更新</Label>
                  <p className="text-xs text-slate-500">开启后系统将按计划自动更新榜单数据</p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, auto_update_enabled: !prev.auto_update_enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.auto_update_enabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.auto_update_enabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* 更新频率 */}
              <div>
                <Label>更新频率</Label>
                <div className="flex gap-4 mt-2">
                  {[
                    { value: 'daily', label: '每天', desc: '每日凌晨更新' },
                    { value: 'weekly', label: '每周', desc: '每周一更新' },
                    { value: 'monthly', label: '每月', desc: '每月1号更新' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        config.update_schedule === option.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="schedule"
                        value={option.value}
                        checked={config.update_schedule === option.value}
                        onChange={(e) => setConfig(prev => ({ ...prev, update_schedule: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{option.label}</span>
                        <p className="text-xs text-slate-500">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 更新时间 */}
              <div>
                <Label htmlFor="updateTime">更新时间</Label>
                <Input
                  id="updateTime"
                  type="time"
                  value={config.update_time}
                  onChange={(e) => setConfig(prev => ({ ...prev, update_time: e.target.value }))}
                  className="mt-1 w-40"
                />
              </div>

              {/* Cron 表达式预览 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Info className="w-4 h-4" />
                  <span>Cron 表达式：{getCronHelp(config.update_schedule, config.update_time)}</span>
                </div>
              </div>

              {/* 保存按钮 */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveConfig}
                  disabled={saveStatus === 'saving'}
                  className="gap-2"
                >
                  {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                  <Save className="w-4 h-4" />
                  保存配置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 手动更新 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                手动更新
              </CardTitle>
              <CardDescription>
                立即触发一次榜单数据更新
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    当前月份：{new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'long' })}
                  </p>
                  {updateLog && (
                    <p className="text-xs text-slate-500 mt-1">
                      最近更新：{formatDate(updateLog.created_at)}，更新了 {updateLog.total_count} 条数据
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleManualUpdate}
                  disabled={updating}
                  className="gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      立即更新
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：状态和说明 */}
        <div className="space-y-6">
          {/* 当前状态 */}
          <Card>
            <CardHeader>
              <CardTitle>当前状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">自动更新</span>
                <Badge variant={config.auto_update_enabled ? 'default' : 'secondary'}>
                  {config.auto_update_enabled ? '已启用' : '已禁用'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">更新频率</span>
                <span className="text-sm font-medium">
                  {config.update_schedule === 'daily' ? '每天' : config.update_schedule === 'weekly' ? '每周' : '每月'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">更新时间</span>
                <span className="text-sm font-medium">{config.update_time}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">上次更新</span>
                  <span className="text-sm font-medium">
                    {updateLog ? formatDate(updateLog.created_at) : '暂无'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API 配置说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API 调用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                外部调度器（如 GitHub Actions、Vercel Cron）可通过以下方式调用：
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-xs overflow-x-auto">
                <code>
                  curl -X POST https://oneclaw.shop/api/rankings/auto-update \<br />
                  -H "x-api-key: YOUR_API_KEY"
                </code>
              </div>
              <p className="text-xs text-slate-500">
                请在环境变量中设置 <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">RANKING_UPDATE_KEY</code> 来启用外部调用
              </p>
            </CardContent>
          </Card>

          {/* 最近更新日志 */}
          <Card>
            <CardHeader>
              <CardTitle>最近更新</CardTitle>
            </CardHeader>
            <CardContent>
              {updateLog ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {updateLog.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {updateLog.status === 'success' ? '更新成功' : '更新失败'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>月份：{updateLog.update_month}</p>
                    <p>类型：{updateLog.update_type === 'auto' ? '自动' : '手动'}</p>
                    <p>数据量：{updateLog.total_count} 条</p>
                    <p>时间：{formatDate(updateLog.created_at)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  暂无更新记录
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
