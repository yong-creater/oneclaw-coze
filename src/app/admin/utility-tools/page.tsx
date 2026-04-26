'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Star, Plus, Edit2, Trash2, Image, Palette, ArrowUp, ArrowDown,
  GripVertical, X, Check
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
  use_cases: any[];
  utility_groups?: { name: string; slug: string; icon: string; color: string };
}

interface UseCase {
  title: string;
  desc: string;
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

export default function UtilityToolsPage() {
  const [groups, setGroups] = useState<UtilityGroup[]>([]);
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  
  // 分组表单
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UtilityGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Star',
    color: 'from-orange-500 to-amber-500'
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
    use_cases: [] as UseCase[]
  });

  // 获取数据
  const fetchData = async () => {
    try {
      const [groupsRes, toolsRes] = await Promise.all([
        fetch('/api/admin/utility-groups', {
          headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' }
        }),
        fetch('/api/admin/utility-tools', {
          headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' }
        })
      ]);

      const groupsData = await groupsRes.json();
      const toolsData = await toolsRes.json();

      setGroups(groupsData.groups || []);
      setTools(Array.isArray(toolsData) ? toolsData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 保存分组
  const handleSaveGroup = async () => {
    try {
      const method = editingGroup ? 'PUT' : 'POST';
      const url = editingGroup ? '/api/admin/utility-groups' : '/api/admin/utility-groups';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify(editingGroup ? { ...groupForm, id: editingGroup.id } : groupForm)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || '保存失败');
        return;
      }

      toast.success(editingGroup ? '分组已更新' : '分组已创建');
      setGroupDialogOpen(false);
      resetGroupForm();
      fetchData();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 删除分组
  const handleDeleteGroup = async (id: number) => {
    if (!confirm('确定删除该分组？该分组下的工具也会被删除。')) return;

    try {
      const res = await fetch(`/api/admin/utility-groups?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' }
      });

      if (!res.ok) {
        toast.error('删除失败');
        return;
      }

      toast.success('分组已删除');
      fetchData();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 保存工具
  const handleSaveTool = async () => {
    try {
      const method = editingTool ? 'PUT' : 'POST';
      const url = '/api/admin/utility-tools';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify(editingTool ? { ...toolForm, id: editingTool.id } : toolForm)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || '保存失败');
        return;
      }

      toast.success(editingTool ? '工具已更新' : '工具已创建');
      setToolDialogOpen(false);
      resetToolForm();
      fetchData();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 删除工具
  const handleDeleteTool = async (id: number) => {
    if (!confirm('确定删除该工具？')) return;

    try {
      const res = await fetch(`/api/admin/utility-tools?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': localStorage.getItem('admin_token') || '' }
      });

      if (!res.ok) {
        toast.error('删除失败');
        return;
      }

      toast.success('工具已删除');
      fetchData();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const resetGroupForm = () => {
    setEditingGroup(null);
    setGroupForm({ name: '', slug: '', description: '', icon: 'Star', color: 'from-orange-500 to-amber-500' });
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
      use_cases: []
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
        color: group.color
      });
    } else {
      resetGroupForm();
    }
    setGroupDialogOpen(true);
  };

  const openToolDialog = (tool?: UtilityTool) => {
    if (tool) {
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
        use_cases: tool.use_cases || []
      });
    } else {
      resetToolForm();
      if (selectedGroup) {
        setToolForm(prev => ({ ...prev, group_id: selectedGroup }));
      }
    }
    setToolDialogOpen(true);
  };

  const filteredTools = selectedGroup 
    ? tools.filter(t => t.group_id === selectedGroup)
    : tools;

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
        <p className="text-sm text-slate-500">管理首页精选工具的分组和工具配置</p>
      </div>

      {/* 分组管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            分组管理
          </CardTitle>
          <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openGroupDialog()} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                新增分组
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGroup ? '编辑分组' : '新增分组'}</DialogTitle>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排序</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>图标</TableHead>
                <TableHead>颜色</TableHead>
                <TableHead>工具数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(group => (
                <TableRow key={group.id}>
                  <TableCell>{group.sort_order}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openGroupDialog(group)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 工具管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-orange-500" />
            工具管理
          </CardTitle>
          <div className="flex gap-2">
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">全部分组</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <Dialog open={toolDialogOpen} onOpenChange={setToolDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openToolDialog()} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  新增工具
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingTool ? '编辑工具' : '新增工具'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm font-medium mb-2 block">所属分组</label>
                    <select
                      value={toolForm.group_id}
                      onChange={(e) => setToolForm({ ...toolForm, group_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
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
                    <label className="text-sm font-medium mb-2 block">封面图URL</label>
                    <Input
                      value={toolForm.cover_image}
                      onChange={(e) => setToolForm({ ...toolForm, cover_image: e.target.value })}
                      placeholder="https://example.com/cover.jpg（可选）"
                    />
                    <p className="text-xs text-slate-500 mt-1">支持外部图片URL，如未设置将使用默认渐变背景</p>
                  </div>
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">排序</label>
                    <Input
                      type="number"
                      value={toolForm.sort_order}
                      onChange={(e) => setToolForm({ ...toolForm, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setToolDialogOpen(false)}>取消</Button>
                    <Button onClick={handleSaveTool} className="bg-orange-500 hover:bg-orange-600">
                      保存
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排序</TableHead>
                <TableHead>封面</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>颜色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map(tool => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.sort_order}</TableCell>
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
                    <div className={`w-6 h-6 rounded bg-gradient-to-r ${tool.color}`} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.is_active ? 'default' : 'secondary'}>
                      {tool.is_active ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openToolDialog(tool)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTool(tool.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
