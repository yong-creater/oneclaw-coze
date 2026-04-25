'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, Database, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">系统设置</h1>
        <p className="text-sm text-slate-500 mt-1">管理网站的基本配置</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="appearance">外观</TabsTrigger>
          <TabsTrigger value="security">安全</TabsTrigger>
        </TabsList>

        {/* 基本设置 */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>网站信息</CardTitle>
              <CardDescription>设置网站的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">网站名称</Label>
                <Input id="siteName" defaultValue="OneClaw" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">网站地址</Label>
                <Input id="siteUrl" defaultValue="https://oneclaw.shop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">联系邮箱</Label>
                <Input id="contactEmail" defaultValue="1017760688@qq.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icpCode">ICP备案号</Label>
                <Input id="icpCode" defaultValue="渝ICP备2026004291号-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>数据库状态</CardTitle>
              <CardDescription>查看数据库连接状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">已连接</Badge>
                  <span className="text-sm text-slate-500">Supabase PostgreSQL</span>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外观设置 */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>主题设置</CardTitle>
              <CardDescription>自定义网站外观</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>深色模式</Label>
                  <p className="text-sm text-slate-500">启用深色主题</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>紧凑模式</Label>
                  <p className="text-sm text-slate-500">减少页面间距</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>管理网站安全选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>启用维护模式</Label>
                  <p className="text-sm text-slate-500">维护期间只允许管理员访问</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>注册审核</Label>
                  <p className="text-sm text-slate-500">新用户注册需要管理员审核</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-500">保存成功</span>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
