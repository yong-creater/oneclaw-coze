'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Zap, Shield, Save, RefreshCw, Infinity, AlertTriangle } from 'lucide-react';

interface DailyLimitConfig {
  limit: number;
  unlimited: boolean;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<DailyLimitConfig>({ limit: 3, unlimited: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('获取配置失败');
      const json = await res.json();
      // API 返回 { success: true, data: [{ key, value, description }] }
      const rows: Array<{ key: string; value: DailyLimitConfig }> = json.data || [];
      const dailyLimitRow = rows.find((r) => r.key === 'daily_generation_limit');
      if (dailyLimitRow?.value) {
        setConfig(dailyLimitRow.value);
      }
    } catch (err) {
      toast.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    if (!config.unlimited && config.limit < 0) {
      toast.error('生成次数不能为负数');
      return;
    }
    if (!config.unlimited && config.limit === 0) {
      toast.error('生成次数不能为 0，如需禁止请设置负数或联系开发者');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'daily_generation_limit',
          value: { limit: config.unlimited ? -1 : config.limit, unlimited: config.unlimited },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || '保存失败');
      toast.success('配置已保存，立即生效');
      await fetchSettings();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          站点配置
        </h2>
        <p className="text-sm text-slate-500 mt-1">管理 OneClaw 站点的全局配置参数</p>
      </div>

      {/* 每日生成额度配置 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <CardTitle>每日生成额度</CardTitle>
            </div>
            {config.unlimited ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Infinity className="w-3 h-3 mr-1" />
                不限制
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                每天 {config.limit} 次
              </Badge>
            )}
          </div>
          <CardDescription>
            配置每位用户每天可以免费生成内容的次数。修改后立即生效，无需重启服务。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              加载配置中...
            </div>
          ) : (
            <>
              {/* 不限制开关 */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <div>
                    <Label className="text-sm font-medium">不限制次数</Label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      开启后用户每天可无限次生成，不受次数限制
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.unlimited}
                  onCheckedChange={(checked: boolean) =>
                    setConfig((prev) => ({ ...prev, unlimited: checked }))
                  }
                />
              </div>

              {/* 次数输入 */}
              {!config.unlimited && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">每天免费生成次数</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={config.limit}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          limit: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-32 text-center text-lg font-semibold"
                    />
                    <span className="text-sm text-slate-500">次 / 每天 / 每用户</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      每次图片生成消耗模型积分（约 10 倍 LLM 调用成本）。建议免费用户设置 3-5 次/天，
                      付费会员可通过会员体系提升额度。设为 0 将禁止所有免费生成。
                    </p>
                  </div>

                  {/* 快捷预设 */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400">快捷设置：</span>
                    {[1, 3, 5, 10, 20].map((n) => (
                      <Button
                        key={n}
                        variant={config.limit === n ? 'default' : 'outline'}
                        size="sm"
                        className={config.limit === n ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'text-xs'}
                        onClick={() => setConfig((prev) => ({ ...prev, limit: n }))}
                      >
                        {n} 次
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 保存按钮 */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  保存配置
                </Button>
                <Button variant="outline" onClick={fetchSettings} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
