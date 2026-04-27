'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  BarChart3, Clock, ChevronDown, ChevronUp, ChevronRight, X, Plus, Upload,
  GripVertical, Save, Settings2, Bot, Globe, DollarSign,
  Settings, Layers, Palette, Trash2, Lightbulb, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { ModelSelector } from '@/components/admin/ModelSelector';

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
  model_provider_id?: number | null;
  model_name?: string | null;
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

interface Model {
  id: number;
  name: string;
  display_name: string;
  description: string;
  model_type: string;
  price_per_1k_tokens: number | null;
  is_available: boolean;
}

interface ModelProvider {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  is_system: boolean;
  models: Model[];
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
        <Badge variant="outline">{group.icon || 'Star'}</Badge>
      </TableCell>
      <TableCell>
        <div className={`w-8 h-8 rounded bg-gradient-to-r ${group.color}`} />
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
  const [savingOrder, setSavingOrder] = useState(false);
  const [selectedToolSlug, setSelectedToolSlug] = useState<string | null>(null);
  
  // 模型提供商数据
  const [providers, setProviders] = useState<Record<string, ModelProvider[]>>({});
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [modelSelectorTool, setModelSelectorTool] = useState<UtilityTool | null>(null);

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
  
  // 获取模型提供商数据
  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/tool-models', {
        credentials: 'include', // 包含 cookie
      });
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
      } else if (data.error) {
        console.error('获取模型提供商失败:', data.error);
      }
    } catch (error) {
      console.error('获取模型提供商失败:', error);
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
    model_provider_id: null as number | null,
    model_name: null as string | null,
  });

  // 获取数据
  const fetchData = async () => {
    try {
      const [groupsRes, toolsRes, statsRes] = await Promise.all([
        fetch('/api/admin/utility-groups', { credentials: 'include' }),
        fetch('/api/admin/utility-tools?include_all=true', { credentials: 'include' }),
        fetch('/api/admin/utilities/stats', { credentials: 'include' })
      ]);

      const groupsData = await groupsRes.json();
      const toolsData = await toolsRes.json();
      const statsData = await statsRes.json();

      setGroups(groupsData.groups || []);
      setTools(toolsData.tools || []);
      
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
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth', { credentials: 'include' });
        const data = await res.json();
        if (!data.success || !data.user) {
          // 未登录，跳转到登录页
          window.location.href = '/admin/login';
          return;
        }
      } catch {
        // 忽略错误，继续加载
      }
      fetchData();
      fetchProviders();
    };
    checkAuth();
  }, []);

  // 打开模型选择器
  const openModelSelector = (tool: UtilityTool) => {
    setModelSelectorTool(tool);
    setModelSelectorOpen(true);
  };

  // 处理模型选择
  const handleModelSelect = (providerId: number, modelName: string) => {
    // 更新工具列表中的显示
    setTools(prev => prev.map(t => {
      if (t.id === modelSelectorTool?.id) {
        return { ...t, model_provider_id: providerId, model_name: modelName };
      }
      return t;
    }));
    
    // 如果编辑弹窗已打开，也更新表单
    if (toolDialogOpen && editingTool?.id === modelSelectorTool?.id) {
      setToolForm(prev => ({
        ...prev,
        model_provider_id: providerId,
        model_name: modelName,
      }));
    }
    
    setModelSelectorOpen(false);
    setModelSelectorTool(null);
  };

  // 获取工具当前的模型提供商信息
  const getToolModelInfo = (tool: UtilityTool) => {
    const allProviders = Object.values(providers).flat();
    const provider = allProviders.find(p => p.id === tool.model_provider_id);
    return {
      provider,
      modelName: tool.model_name,
      isCoze: provider?.slug?.includes('coze'),
    };
  };

  // 保存分组
  const handleSaveGroup = async () => {
    try {
      const method = editingGroup ? 'PUT' : 'POST';
      
      const res = await fetch('/api/admin/utility-groups', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', `covers/${toolSlug}-${Date.now()}.jpg`);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include', // 包含认证 cookie
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setToolForm({ ...toolForm, cover_image: data.url });
        toast.success('封面上传成功');
      } else {
        toast.error(data.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传失败');
    }
    // 清空input
    e.target.value = '';
  };

  // 保存工具
  const handleSaveTool = async () => {
    try {
      const res = await fetch('/api/admin/utility-tools', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...toolForm,
          id: editingTool?.id,
          use_cases: toolForm.use_cases,
          model_provider_id: toolForm.model_provider_id,
          model_name: toolForm.model_name,
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
      model_provider_id: null,
      model_name: null,
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
      model_provider_id: tool.model_provider_id || null,
      model_name: tool.model_name || null,
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
                    <TableHead>AI模型</TableHead>
                    <TableHead>亮点数</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map(tool => {
                    const stats = getToolStats(tool.slug);
                    const modelInfo = getToolModelInfo(tool);
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
                        <TableCell>
                          {modelInfo.provider ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModelSelector(tool)}
                              className="gap-2"
                            >
                              {modelInfo.isCoze ? (
                                <Bot className="w-3 h-3 text-green-600" />
                              ) : (
                                <Globe className="w-3 h-3 text-amber-600" />
                              )}
                              <span className="max-w-[120px] truncate">
                                {modelInfo.provider.name} / {tool.model_name || '未选择'}
                              </span>
                              <Settings2 className="w-3 h-3 text-slate-400" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModelSelector(tool)}
                              className="gap-2 text-slate-500"
                            >
                              <Settings2 className="w-3 h-3" />
                              选择模型
                            </Button>
                          )}
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
                                        <div className="flex-1 min-w-0">
                                          <div className="truncate">{log.input_summary || '无输入摘要'}</div>
                                          <div className="text-xs text-slate-500 mt-1">
                                            {formatTime(log.created_at)} · {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '-'}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400 text-center py-4">暂无使用记录</p>
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

      {/* 模型选择弹框 */}
      <ModelSelector
        open={modelSelectorOpen}
        onOpenChange={setModelSelectorOpen}
        onSelect={handleModelSelect}
        currentProviderId={modelSelectorTool?.model_provider_id}
        currentModelName={modelSelectorTool?.model_name}
        providers={providers}
      />

      {/* 分组编辑弹窗 */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGroup ? '编辑分组' : '新增分组'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">名称</label>
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

	      {/* 编辑工具弹框 - 简洁2列布局 */}
      <Dialog open={toolDialogOpen} onOpenChange={setToolDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          {/* 头部 */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${editingTool?.color || 'from-orange-500 to-amber-500'} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{editingTool?.name?.[0] || 'T'}</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">编辑工具</h2>
                <p className="text-xs text-slate-500">{editingTool?.name}</p>
              </div>
            </div>
          </div>

          {/* 主体内容 */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-2 gap-5">
              {/* 左侧：基础信息 */}
              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">基本信息</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">工具名称 <span className="text-red-500">*</span></label>
                      <Input value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} placeholder="例如：STAR简历优化" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Slug标识</label>
                      <Input value={toolForm.slug} onChange={(e) => setToolForm({ ...toolForm, slug: e.target.value })} placeholder="例如：resume" className="h-9 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">简短描述</label>
                      <textarea value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} placeholder="一句话介绍..." className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg resize-none h-16 text-sm bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                </div>

                {/* 分组和排序 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">分组与排序</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">所属分组</label>
                      <select value={toolForm.group_id} onChange={(e) => setToolForm({ ...toolForm, group_id: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm h-9">
                        {groups.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">排序值</label>
                      <Input type="number" value={toolForm.sort_order} onChange={(e) => setToolForm({ ...toolForm, sort_order: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：封面图和亮点 */}
              <div className="space-y-4">
                {/* 封面图 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">封面图</h3>
                    {toolForm.cover_image && (
                      <Button variant="ghost" size="sm" onClick={() => setToolForm({ ...toolForm, cover_image: '' })} className="text-red-500 hover:text-red-600 h-6 text-xs">移除</Button>
                    )}
                  </div>
                  {toolForm.cover_image ? (
                    <div className="space-y-2">
                      <img src={toolForm.cover_image} alt="" className="w-full h-28 object-cover rounded-lg bg-slate-100" />
                      <label className="flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-orange-400 text-xs text-slate-500">
                        <Upload className="w-3 h-3" />替换
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e, toolForm.slug)} />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg py-5 cursor-pointer hover:border-orange-400">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">点击上传</span>
                      <span className="text-[10px] text-slate-400">600x400</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e, toolForm.slug)} />
                    </label>
                  )}
                </div>

                {/* 产品亮点 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">产品亮点</h3>
                    <Button variant="outline" size="sm" onClick={addUseCase} className="h-7 text-xs border-orange-200 text-orange-600">+ 添加</Button>
                  </div>
                  <div className="space-y-2">
                    {toolForm.use_cases.map((uc, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 text-[10px] flex items-center justify-center font-medium">{index + 1}</span>
                          <Input value={uc.title} onChange={(e) => updateUseCase(index, 'title', e.target.value)} placeholder="标题" className="h-7 text-xs flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => removeUseCase(index)} className="h-6 w-6 text-red-400"><X className="w-3 h-3" /></Button>
                        </div>
                        <Input value={uc.desc} onChange={(e) => updateUseCase(index, 'desc', e.target.value)} placeholder="描述..." className="h-7 text-xs" />
                      </div>
                    ))}
                    {toolForm.use_cases.length === 0 && <p className="text-xs text-slate-400 text-center py-3">暂无亮点</p>}
                  </div>
                </div>

                {/* 图标颜色 */}
                {!toolForm.cover_image && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">图标颜色</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.map(color => (
                        <button key={color} onClick={() => setToolForm({ ...toolForm, color })} className={`w-7 h-7 rounded-md bg-gradient-to-r ${color} border-2 transition-all ${toolForm.color === color ? 'border-slate-900 ring-2 ring-orange-500' : 'border-transparent'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
            <Button variant="outline" onClick={() => { setToolDialogOpen(false); resetToolForm(); }} className="h-8 text-xs px-4">取消</Button>
            <Button onClick={handleSaveTool} className="h-8 text-xs px-4 bg-orange-500 hover:bg-orange-600">保存</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
