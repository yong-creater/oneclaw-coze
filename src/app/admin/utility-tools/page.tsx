'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Star, Edit2, Image, TrendingUp, Users, Activity, 
  BarChart3, Clock, ChevronDown, ChevronUp, X, Plus, Upload,
  GripVertical, Save
} from 'lucide-react';
import { toast } from 'sonner';

// 类型定义
interface UtilityGroup {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface ModelConfig {
  default_model: string;
  model_source: string;
  model_price_per_1k_tokens: number;
  is_free: boolean;
  is_active: boolean;
}

interface UtilityTool {
  id: number;
  group_id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  cover_image: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  use_cases: UseCase[];
  utility_groups?: { name: string; slug: string; icon: string; color: string };
  model_config?: ModelConfig;
}

interface UseCase {
  title: string;
  desc: string;
}

interface ToolStats {
  tool_slug: string;
  total_usage: number;
  unique_users: number;
  opens: number;
  uses: number;
  generations: number;
  first_use: string | null;
  last_use: string | null;
}

interface UsageLog {
  id: number;
  tool_slug: string;
  user_id: string | null;
  action_type: string;
  input_summary: string | null;
  output_summary: string | null;
  duration_ms: number | null;
  created_at: string;
}

const COLOR_OPTIONS = [
  'from-orange-500 to-amber-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500',
  'from-green-500 to-emerald-500',
  'from-red-500 to-rose-500',
];

const ICON_OPTIONS = [
  'FileText', 'Feather', 'Globe', 'Sparkle', 'Scissors', 'Layout',
  'Camera', 'Palette', 'Star', 'Wand2', 'Zap', 'Code', 'Lightbulb'
];

// 可排序的行组件
function SortableGroupRow({ group, tools, onEdit }: { 
  group: UtilityGroup; 
  tools: UtilityTool[];
  onEdit: (group: UtilityGroup) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f0f0f0' : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button 
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{group.name}</TableCell>
      <TableCell className="text-slate-500">{group.slug}</TableCell>
      <TableCell>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${group.color} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">{group.name[0]}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className={`w-6 h-6 rounded bg-gradient-to-r ${group.color}`} />
      </TableCell>
      <TableCell>{tools.filter(t => t.group_id === group.id).length}</TableCell>
      <TableCell>
        <Badge variant={group.is_active ? 'default' : 'secondary'}>
          {group.is_active ? '启用' : '禁用'}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={() => onEdit(group)}>
          <Edit2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function UtilityToolsPage() {
  const [groups, setGroups] = useState<UtilityGroup[]>([]);
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [toolStats, setToolStats] = useState<ToolStats[]>([]);
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToolSlug, setSelectedToolSlug] = useState<string | null>(null);
  const [expandedStats, setExpandedStats] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  
  // DnD 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setGroups((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 保存新排序到服务器
        saveGroupOrder(newItems);
        
        return newItems;
      });
    }
  };

  // 保存分组排序
  const saveGroupOrder = async (newGroups: UtilityGroup[]) => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/admin/utility-groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: newGroups.map((g, i) => ({ id: g.id, sort_order: i }))
        })
      });
      
      if (!res.ok) {
        toast.error('保存排序失败');
        // 刷新数据
        fetchData();
      } else {
        toast.success('排序已保存');
      }
    } catch (error) {
      toast.error('保存排序失败');
      console.error(error);
    } finally {
      setSavingOrder(false);
    }
  };
  
  // 分组表单
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UtilityGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Star',
    color: 'from-orange-500 to-amber-500',
    sort_order: 0
  });

  // 工具表单
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<UtilityTool | null>(null);
  const [toolForm, setToolForm] = useState({
    group_id: 0,
    name: '',
    slug: '',
    icon: 'Sparkle',
    description: '',
    cover_image: '',
    color: 'from-orange-500 to-amber-500',
    sort_order: 0,
    use_cases: [] as UseCase[],
    model_config: {
      default_model: 'ep-20250312145957-p8xpp',
      model_source: 'coze',
      model_price_per_1k_tokens: 0,
      is_free: true,
      is_active: true,
    } as ModelConfig
  });

  // 获取数据
  const fetchData = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token') || '';
      
      const [groupsRes, toolsRes, statsRes] = await Promise.all([
        fetch('/api/admin/utility-groups'),
        fetch('/api/admin/utility-tools?include_all=true', {
          headers: adminToken ? { 'x-admin-token': adminToken } : {}
        }),
        fetch('/api/admin/utilities/stats', {
          headers: adminToken ? { 'x-admin-token': adminToken } : {}
        })
      ]);

      const groupsData = await groupsRes.json();
      const toolsData = await toolsRes.json();
      const statsData = await statsRes.json();

      setGroups(groupsData.groups || []);
      setTools(Array.isArray(toolsData) ? toolsData : []);
      
      if (statsData.success && statsData.data) {
        setToolStats(statsData.data.toolStats || []);
        setRecentLogs(statsData.data.recentLogs || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 检查登录状态并同步 token
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.success && data.data?.token) {
          localStorage.setItem('admin_token', data.data.token);
        } else {
          // 未登录，跳转到登录页
          window.location.href = '/admin/login';
          return;
        }
      } catch {
        // 忽略错误，继续加载
      }
      fetchData();
    };
    checkAuth();
  }, []);

  // 保存分组
  const handleSaveGroup = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token') || '';
      const method = editingGroup ? 'PUT' : 'POST';
      
      const res = await fetch('/api/admin/utility-groups', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(editingGroup ? { ...groupForm, id: editingGroup.id } : groupForm)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || '保存失败');
        return;
      }

      toast.success('分组已更新');
      setGroupDialogOpen(false);
      resetGroupForm();
      fetchData();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 上传封面图
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, toolSlug: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tool_slug', toolSlug);

    try {
      const res = await fetch('/api/admin/utility-covers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setToolForm(prev => ({ ...prev, cover_image: data.url }));
        toast.success('封面上传成功');
      } else {
        toast.error(data.error || '上传失败');
      }
    } catch {
      toast.error('上传失败');
    }

    // 清空input
    e.target.value = '';
  };

  // 保存工具
  const handleSaveTool = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token') || '';
      
      const res = await fetch('/api/admin/utility-tools', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          ...toolForm,
          id: editingTool?.id,
          use_cases: toolForm.use_cases,
          model_config: toolForm.model_config
        })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || '保存失败');
        return;
      }

      toast.success('工具已更新');
      setToolDialogOpen(false);
      resetToolForm();
      fetchData();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const resetGroupForm = () => {
    setEditingGroup(null);
    setGroupForm({ name: '', slug: '', description: '', icon: 'Star', color: 'from-orange-500 to-amber-500', sort_order: groups.length });
  };

  const resetToolForm = () => {
    setEditingTool(null);
    setToolForm({
      group_id: groups[0]?.id || 0,
      name: '',
      slug: '',
      icon: 'Sparkle',
      description: '',
      cover_image: '',
      color: 'from-orange-500 to-amber-500',
      sort_order: 0,
      use_cases: [],
      model_config: {
        default_model: 'ep-20250312145957-p8xpp',
        model_source: 'coze',
        model_price_per_1k_tokens: 0,
        is_free: true,
        is_active: true,
      }
    });
  };

  const openGroupDialog = (group?: UtilityGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        slug: group.slug,
        description: group.description || '',
        icon: group.icon || 'Star',
        color: group.color,
        sort_order: group.sort_order,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', slug: '', description: '', icon: 'Star', color: 'from-orange-500 to-amber-500', sort_order: groups.length });
    }
    setGroupDialogOpen(true);
  };

  const openToolDialog = (tool: UtilityTool) => {
    setEditingTool(tool);
    setToolForm({
      group_id: tool.group_id,
      name: tool.name,
      slug: tool.slug,
      icon: tool.icon || 'Sparkle',
      description: tool.description || '',
      cover_image: tool.cover_image || '',
      color: tool.color,
      sort_order: tool.sort_order,
      use_cases: tool.use_cases || [],
      model_config: tool.model_config || {
        default_model: 'ep-20250312145957-p8xpp',
        model_source: 'coze',
        model_price_per_1k_tokens: 0,
        is_free: true,
        is_active: true,
      }
    });
    setToolDialogOpen(true);
  };

  // 添加产品亮点
  const addUseCase = () => {
    setToolForm({
      ...toolForm,
      use_cases: [...toolForm.use_cases, { title: '', desc: '' }]
    });
  };

  // 移除产品亮点
  const removeUseCase = (index: number) => {
    setToolForm({
      ...toolForm,
      use_cases: toolForm.use_cases.filter((_, i) => i !== index)
    });
  };

  // 更新产品亮点
  const updateUseCase = (index: number, field: 'title' | 'desc', value: string) => {
    const newUseCases = [...toolForm.use_cases];
    newUseCases[index][field] = value;
    setToolForm({ ...toolForm, use_cases: newUseCases });
  };

  // 获取工具统计
  const getToolStats = (slug: string) => {
    return toolStats.find(s => s.tool_slug === slug);
  };

  // 获取工具使用记录
  const getToolLogs = (slug: string) => {
    return recentLogs.filter(l => l.tool_slug === slug);
  };

  // 格式化时间
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  // 计算总统计
  const totalStats = {
    totalUsage: toolStats.reduce((sum, s) => sum + parseInt(String(s.total_usage)), 0),
    totalUsers: toolStats.reduce((sum, s) => sum + parseInt(String(s.unique_users)), 0),
    totalGenerations: toolStats.reduce((sum, s) => sum + parseInt(String(s.generations)), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold">精选工具管理</h2>
        <p className="text-sm text-slate-500">管理首页精选工具的分组、配置和查看使用数据</p>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">总使用次数</p>
                <p className="text-2xl font-bold">{totalStats.totalUsage}</p>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">独立用户</p>
                <p className="text-2xl font-bold">{totalStats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">生成次数</p>
                <p className="text-2xl font-bold">{totalStats.totalGenerations}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">工具总数</p>
                <p className="text-2xl font-bold">{tools.length}</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools">工具配置</TabsTrigger>
          <TabsTrigger value="groups">分组配置</TabsTrigger>
          <TabsTrigger value="stats">使用统计</TabsTrigger>
        </TabsList>

        {/* 工具配置 */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-orange-500" />
                工具列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>封面</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>分组</TableHead>
                    <TableHead>亮点数</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map(tool => {
                    const stats = getToolStats(tool.slug);
                    return (
                      <TableRow key={tool.id}>
                        <TableCell>
                          {tool.cover_image ? (
                            <img src={tool.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center`}>
                              <span className="text-white font-bold">{tool.name[0]}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{tool.name}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{tool.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tool.utility_groups?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>{tool.use_cases?.length || 0}</TableCell>
                        <TableCell>
                          <span className="text-orange-600 font-medium">{stats?.total_usage || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => openToolDialog(tool)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分组配置 */}
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-500" />
                    分组列表
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    拖动左侧手柄调整排序，排序自动保存
                    {savingOrder && <span className="text-orange-500 ml-2">保存中...</span>}
                  </p>
                </div>
                <Button onClick={() => openGroupDialog()} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  新增分组
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">拖动</TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>图标</TableHead>
                        <TableHead>颜色</TableHead>
                        <TableHead>工具数</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map(group => (
                        <SortableGroupRow 
                          key={group.id} 
                          group={group} 
                          tools={tools}
                          onEdit={openGroupDialog}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 使用统计 */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                各工具使用详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>工具</TableHead>
                    <TableHead>访问次数</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>生成次数</TableHead>
                    <TableHead>独立用户</TableHead>
                    <TableHead>最近使用</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map(tool => {
                    const stats = getToolStats(tool.slug);
                    const isExpanded = selectedToolSlug === tool.slug;
                    return (
                      <>
                        <TableRow key={tool.id}>
                          <TableCell className="font-medium">{tool.name}</TableCell>
                          <TableCell>{stats?.opens || 0}</TableCell>
                          <TableCell>{stats?.uses || 0}</TableCell>
                          <TableCell className="text-orange-600 font-medium">{stats?.generations || 0}</TableCell>
                          <TableCell>{stats?.unique_users || 0}</TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {stats?.last_use ? formatTime(stats.last_use) : '暂无数据'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedToolSlug(isExpanded ? null : tool.slug)}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {isExpanded ? '收起' : '查看'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${tool.id}-detail`}>
                            <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-800/50 p-4">
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm">最近使用记录</h4>
                                {getToolLogs(tool.slug).length > 0 ? (
                                  <div className="space-y-2">
                                    {getToolLogs(tool.slug).slice(0, 5).map(log => (
                                      <div key={log.id} className="flex items-center gap-4 text-sm bg-white dark:bg-slate-800 p-3 rounded-lg">
                                        <Badge variant="outline" className="shrink-0">
                                          {log.action_type === 'open' ? '打开' : 
                                           log.action_type === 'use' ? '使用' : '生成'}
                                        </Badge>
                                        <span className="flex-1 truncate text-slate-600 dark:text-slate-300">
                                          {log.input_summary || '-'}
                                        </span>
                                        {log.output_summary && (
                                          <span className="text-slate-500 truncate max-w-[200px]">
                                            → {log.output_summary}
                                          </span>
                                        )}
                                        {log.duration_ms && (
                                          <span className="text-slate-400 text-xs shrink-0">
                                            {log.duration_ms}ms
                                          </span>
                                        )}
                                        <span className="text-slate-400 text-xs shrink-0">
                                          {formatTime(log.created_at)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-slate-400 text-sm">暂无使用记录</p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑分组弹窗 */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑分组</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">分组名称</label>
              <Input
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                placeholder="例如：精选工具"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Slug</label>
              <Input
                value={groupForm.slug}
                onChange={(e) => setGroupForm({ ...groupForm, slug: e.target.value })}
                placeholder="例如：featured"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">描述</label>
              <Input
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                placeholder="分组描述（可选）"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">图标</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setGroupForm({ ...groupForm, icon })}
                    className={`px-3 py-1.5 text-xs rounded-lg border-2 transition-colors ${
                      groupForm.icon === icon 
                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">颜色</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setGroupForm({ ...groupForm, color })}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} border-2 transition-all ${
                      groupForm.color === color ? 'border-slate-900 scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>取消</Button>
              <Button onClick={handleSaveGroup} className="bg-orange-500 hover:bg-orange-600">
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑工具弹窗 */}
      <Dialog open={toolDialogOpen} onOpenChange={setToolDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>编辑工具 - {editingTool?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[calc(85vh-80px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">所属分组</label>
                <select
                  value={toolForm.group_id}
                  onChange={(e) => setToolForm({ ...toolForm, group_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">排序</label>
                <Input
                  type="number"
                  value={toolForm.sort_order}
                  onChange={(e) => setToolForm({ ...toolForm, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">工具名称</label>
                <Input
                  value={toolForm.name}
                  onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                  placeholder="例如：STAR简历优化"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Slug</label>
                <Input
                  value={toolForm.slug}
                  onChange={(e) => setToolForm({ ...toolForm, slug: e.target.value })}
                  placeholder="例如：resume"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">描述</label>
              <textarea
                value={toolForm.description}
                onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                placeholder="工具简短描述"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl resize-none h-20"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">封面图</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4">
                {toolForm.cover_image ? (
                  <div className="relative">
                    <img 
                      src={toolForm.cover_image} 
                      alt="封面预览" 
                      className="w-full h-32 object-contain rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setToolForm({ ...toolForm, cover_image: '' })}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">点击上传封面图</span>
                    <span className="text-xs text-slate-400 mt-1">支持 JPG、PNG，最大 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCoverUpload(e, toolForm.slug)}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">建议尺寸 600x400 像素，如未设置将使用默认渐变背景</p>
            </div>

            {/* 产品亮点 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">产品亮点</label>
                <Button variant="outline" size="sm" onClick={addUseCase}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加亮点
                </Button>
              </div>
              <div className="space-y-3">
                {toolForm.use_cases.map((uc, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={uc.title}
                        onChange={(e) => updateUseCase(index, 'title', e.target.value)}
                        placeholder="亮点标题，如：智能优化"
                        className="text-sm"
                      />
                      <Input
                        value={uc.desc}
                        onChange={(e) => updateUseCase(index, 'desc', e.target.value)}
                        placeholder="亮点描述，如：基于GPT-4自动分析简历与JD匹配度"
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeUseCase(index)}
                      className="shrink-0 text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {toolForm.use_cases.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    暂无亮点配置，点击上方按钮添加
                  </p>
                )}
              </div>
            </div>

            {/* 图标和颜色设置 - 仅在无封面图时显示 */}
            {!toolForm.cover_image && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">图标</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setToolForm({ ...toolForm, icon })}
                        className={`px-3 py-1.5 text-xs rounded-lg border-2 transition-colors ${
                          toolForm.icon === icon 
                            ? 'border-orange-500 bg-orange-50 text-orange-600' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">颜色</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color}
                        onClick={() => setToolForm({ ...toolForm, color })}
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} border-2 transition-all ${
                          toolForm.color === color ? 'border-slate-900 scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
            {toolForm.cover_image && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <span className="font-medium">封面图已设置</span>，将优先显示封面图，不再使用图标和颜色背景
                </p>
              </div>
            )}

            {/* AI 模型配置 */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">AI 模型配置</h3>
              <p className="text-xs text-slate-500 mb-4">
                配置该工具调用的 AI 模型。扣子内置模型免费，4sAPI 模型需付费。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">模型来源</label>
                  <select
                    value={toolForm.model_config.model_source}
                    onChange={(e) => setToolForm(prev => ({ 
                      ...prev, 
                      model_config: { 
                        ...prev.model_config, 
                        model_source: e.target.value,
                        is_free: e.target.value === 'coze',
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                      bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="coze">扣子内置 (免费)</option>
                    <option value="4sapi">4sAPI (付费)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">选择模型</label>
                  <select
                    value={toolForm.model_config.default_model}
                    onChange={(e) => setToolForm(prev => ({ 
                      ...prev, 
                      model_config: { ...prev.model_config, default_model: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                      bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {toolForm.model_config.model_source === 'coze' ? (
                      <>
                        <option value="ep-20250312145957-p8xpp">Doubao-Pro (扣子)</option>
                        <option value="ep-20250410165509-dtk4n">Doubao-Seed (扣子)</option>
                      </>
                    ) : (
                      <>
                        <option value="gpt-4o">GPT-4o ($0.0025/1K)</option>
                        <option value="gpt-4o-mini">GPT-4o Mini ($0.00015/1K)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo ($0.01/1K)</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet ($0.003/1K)</option>
                        <option value="claude-3-opus">Claude 3 Opus ($0.015/1K)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro ($0.00125/1K)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash ($0.000075/1K)</option>
                        <option value="dall-e-3">DALL-E 3 ($0.04/图)</option>
                        <option value="gpt-image-1">GPT-Image 1 ($0.01/图)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">价格 (元/千token)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={toolForm.model_config.model_price_per_1k_tokens}
                    onChange={(e) => setToolForm(prev => ({ 
                      ...prev, 
                      model_config: { 
                        ...prev.model_config, 
                        model_price_per_1k_tokens: parseFloat(e.target.value) || 0 
                      }
                    }))}
                    disabled={toolForm.model_config.model_source === 'coze'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                      bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500
                      disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">启用状态</label>
                  <div className="flex items-center gap-3 h-[38px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toolForm.model_config.is_active}
                        onChange={(e) => setToolForm(prev => ({ 
                          ...prev, 
                          model_config: { ...prev.model_config, is_active: e.target.checked }
                        }))}
                        className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">启用</span>
                    </label>
                    {toolForm.model_config.is_free ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        免费
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        付费
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" onClick={() => setToolDialogOpen(false)}>取消</Button>
              <Button onClick={handleSaveTool} className="bg-orange-500 hover:bg-orange-600">
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
