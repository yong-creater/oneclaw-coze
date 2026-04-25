import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Wand2, Sparkles, BookOpen, Eye, MousePointer,
  TrendingUp, Clock, ArrowRight
} from 'lucide-react';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getStats() {
  const supabase = getSupabaseClient();
  
  const [toolsRes, promptsRes, tutorialsRes] = await Promise.all([
    supabase.from('tools').select('id', { count: 'exact', head: true }),
    supabase.from('prompts').select('id', { count: 'exact', head: true }),
    supabase.from('tutorials').select('id', { count: 'exact', head: true }),
  ]);

  return {
    toolsCount: toolsRes.count || 0,
    promptsCount: promptsRes.count || 0,
    tutorialsCount: tutorialsRes.count || 0,
  };
}

async function getRecentItems() {
  const supabase = getSupabaseClient();
  
  const [toolsRes, promptsRes, tutorialsRes] = await Promise.all([
    supabase.from('tools').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('prompts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('tutorials').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    tools: toolsRes.data || [],
    prompts: promptsRes.data || [],
    tutorials: tutorialsRes.data || [],
  };
}

export default async function AdminDashboard() {
  // 检查登录状态 - 开发环境跳过验证
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken) {
      redirect('/admin/login');
    }
  }

  const stats = await getStats();
  const recent = await getRecentItems();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold">仪表盘</h2>
        <p className="text-sm text-muted-foreground">系统数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">AI 工具</p>
                <p className="text-3xl font-bold">{stats.toolsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <Link href="/admin/tools" className="inline-flex items-center gap-1 text-sm text-blue-500 mt-3 hover:underline">
              管理工具 <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">提示词</p>
                <p className="text-3xl font-bold">{stats.promptsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <Link href="/admin/prompts" className="inline-flex items-center gap-1 text-sm text-purple-500 mt-3 hover:underline">
              管理提示词 <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">教程</p>
                <p className="text-3xl font-bold">{stats.tutorialsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <Link href="/admin/tutorials" className="inline-flex items-center gap-1 text-sm text-emerald-500 mt-3 hover:underline">
              管理教程 <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 最近添加 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近工具 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-500" />
              最近添加工具
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.tools.length > 0 ? (
              <div className="space-y-3">
                {recent.tools.map((tool: any) => (
                  <div key={tool.id} className="flex items-center justify-between">
                    <span className="text-sm">{tool.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(tool.created_at).toLocaleDateString('zh-CN')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 最近提示词 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              最近添加提示词
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.prompts.length > 0 ? (
              <div className="space-y-3">
                {recent.prompts.map((prompt: any) => (
                  <div key={prompt.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{prompt.title}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {new Date(prompt.created_at).toLocaleDateString('zh-CN')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 最近教程 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              最近添加教程
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.tutorials.length > 0 ? (
              <div className="space-y-3">
                {recent.tutorials.map((tutorial: any) => (
                  <div key={tutorial.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{tutorial.title}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {new Date(tutorial.created_at).toLocaleDateString('zh-CN')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快捷入口 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/tools/new">
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-muted">
                + 添加新工具
              </Badge>
            </Link>
            <Link href="/admin/prompts/new">
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-muted">
                + 添加提示词
              </Badge>
            </Link>
            <Link href="/admin/tutorials/new">
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-muted">
                + 添加教程
              </Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
