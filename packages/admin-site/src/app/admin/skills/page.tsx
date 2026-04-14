'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit2, Trash2, Search, 
  ChevronLeft, ChevronRight, Star, StarOff,
  Sparkles, FolderOpen, Database, Download
} from 'lucide-react';

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Skill {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  logo: string | null;
  category_id: number | null;
  official_url: string | null;
  documentation_url: string | null;
  github_url: string | null;
  pricing: string;
  difficulty: string;
  tags: string[];
  feature_list: string[];
  is_featured: boolean;
  is_active: boolean;
  skill_categories: { id: number; name: string; slug: string; color: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export default function AdminSkillsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [initStatus, setInitStatus] = useState<{ categories: number; skills: number; initialized?: boolean } | null>(null);
  const [initLoading, setInitLoading] = useState(false);
  
  // 分类状态
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; data?: SkillCategory }>({ open: false, mode: 'create' });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#FF6B35',
    sort_order: 0
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number; name?: string }>({ open: false });

  // 技能状态
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillDialog, setSkillDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; data?: Skill }>({ open: false, mode: 'create' });
  const [skillForm, setSkillForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    logo: '',
    category_id: null as number | null,
    official_url: '',
    documentation_url: '',
    github_url: '',
    pricing: '免费',
    difficulty: '入门',
    tags: [] as string[],
    feature_list: [] as string[],
    is_featured: false
  });
  const [skillSearch, setSkillSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<'all' | 'featured'>('all');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, total_pages: 0 });

  // 检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.success) {
        setToken(data.data?.token || 'authenticated');
        checkInitStatus();
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  // 检查初始化状态
  useEffect(() => {
    if (token) {
      checkInitStatus();
    }
  }, [token]);

  const checkInitStatus = async () => {
    try {
      // 从分类 API 获取状态
      const res = await fetch('/api/admin/skills/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // 同时获取技能数量
        const skillsRes = await fetch('/api/skills?limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const skillsData = await skillsRes.json();
        setInitStatus({
          categories: data.data?.length || 0,
          skills: skillsData.pagination?.total || 0,
          initialized: (data.data?.length || 0) > 0
        });
      }
    } catch (error) {
      console.error('检查初始化状态失败:', error);
    }
  };

  const handleImportFromSkillHub = async () => {
    if (!confirm('将从 SkillHub 导入精选技能数据（会覆盖现有数据），是否继续？')) {
      return;
    }
    setInitLoading(true);
    try {
      const res = await fetch('/api/admin/skills/import', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        checkInitStatus();
        fetchCategories();
        if (activeTab === 'skills') {
          fetchSkills(1);
        }
      } else {
        alert(data.error || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败');
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'categories') {
        fetchCategories();
      } else {
        fetchSkills(1);
      }
    }
  }, [token, activeTab]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/admin/skills/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchSkills = async (page: number) => {
    setSkillsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (skillFilter === 'featured') params.set('featured', 'true');
      if (skillSearch) params.set('search', skillSearch);

      const res = await fetch(`/api/admin/skills?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSkills(data.data || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取技能失败:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      const url = categoryDialog.mode === 'create' 
        ? '/api/admin/skills/categories'
        : `/api/admin/skills/categories/${categoryDialog.data?.id}`;
      
      const res = await fetch(url, {
        method: categoryDialog.mode === 'create' ? 'POST' : 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      
      if (data.success) {
        setCategoryDialog({ open: false, mode: 'create' });
        setCategoryForm({ name: '', slug: '', description: '', icon: '', color: '#FF6B35', sort_order: 0 });
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('保存分类失败:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteDialog.id) return;
    try {
      const res = await fetch(`/api/admin/skills/categories/${deleteDialog.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setDeleteDialog({ open: false });
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('删除分类失败:', error);
    }
  };

  const handleSkillSubmit = async () => {
    try {
      const url = skillDialog.mode === 'create' 
        ? '/api/admin/skills'
        : `/api/admin/skills/${skillDialog.data?.id}`;
      
      const res = await fetch(url, {
        method: skillDialog.mode === 'create' ? 'POST' : 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(skillForm)
      });
      const data = await res.json();
      
      if (data.success) {
        setSkillDialog({ open: false, mode: 'create' });
        setSkillForm({
          name: '', slug: '', description: '', icon: '', logo: '', category_id: null,
          official_url: '', documentation_url: '', github_url: '',
          pricing: '免费', difficulty: '入门', tags: [], feature_list: [], is_featured: false
        });
        fetchSkills(pagination.page);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('保存技能失败:', error);
    }
  };

  const handleToggleFeatured = async (skill: Skill) => {
    try {
      await fetch(`/api/admin/skills/${skill.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_featured: !skill.is_featured })
      });
      fetchSkills(pagination.page);
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const openEditCategory = (cat: SkillCategory) => {
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      color: cat.color,
      sort_order: cat.sort_order
    });
    setCategoryDialog({ open: true, mode: 'edit', data: cat });
  };

  const openEditSkill = (skill: Skill) => {
    setSkillForm({
      name: skill.name,
      slug: skill.slug,
      description: skill.description || '',
      icon: skill.icon || '',
      logo: skill.logo || '',
      category_id: skill.category_id,
      official_url: skill.official_url || '',
      documentation_url: skill.documentation_url || '',
      github_url: skill.github_url || '',
      pricing: skill.pricing,
      difficulty: skill.difficulty,
      tags: skill.tags || [],
      feature_list: skill.feature_list || [],
      is_featured: skill.is_featured
    });
    setSkillDialog({ open: true, mode: 'edit', data: skill });
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">请先登录</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">技能管理</h1>
        <p className="text-sm text-slate-500">管理技能分类和技能卡片</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            分类管理
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            技能管理
          </TabsTrigger>
        </TabsList>

        {/* 分类管理 */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>技能分类</CardTitle>
                {initStatus && (
                  <p className="text-sm text-slate-500 mt-1">
                    当前 {initStatus.categories} 个分类，{initStatus.skills} 个技能
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleImportFromSkillHub}
                  disabled={initLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {initLoading ? '导入中...' : '导入 SkillHub 数据'}
                </Button>
                <Button onClick={() => setCategoryDialog({ open: true, mode: 'create' })}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加分类
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        {cat.icon && <span className="text-xl">{cat.icon}</span>}
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{cat.name}</p>
                          <p className="text-sm text-slate-500">{cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cat.is_active ? 'default' : 'secondary'}>
                          {cat.is_active ? '启用' : '禁用'}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => openEditCategory(cat)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, id: cat.id, name: cat.name })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  暂无分类
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 技能管理 */}
        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>技能列表</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="搜索技能..." 
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchSkills(1)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={skillFilter}
                    onChange={(e) => { setSkillFilter(e.target.value as 'all' | 'featured'); fetchSkills(1); }}
                    className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="all">全部</option>
                    <option value="featured">仅推荐</option>
                  </select>
                  <Button onClick={() => setSkillDialog({ open: true, mode: 'create' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加技能
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : skills.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {skills.map(skill => (
                      <div 
                        key={skill.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          {skill.logo || skill.icon ? (
                            <img src={skill.logo || skill.icon || ''} alt="" className="w-10 h-10 rounded-lg object-contain bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">{skill.name}</p>
                              {skill.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1">{skill.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {skill.skill_categories && (
                            <Badge style={{ backgroundColor: skill.skill_categories.color }}>
                              {skill.skill_categories.name}
                            </Badge>
                          )}
                          <Badge variant="outline">{skill.pricing}</Badge>
                          <Badge variant="outline">{skill.difficulty}</Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleToggleFeatured(skill)}>
                            {skill.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEditSkill(skill)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 分页 */}
                  {pagination.total_pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => fetchSkills(pagination.page - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-slate-500">{pagination.page} / {pagination.total_pages}</span>
                      <Button variant="outline" size="sm" disabled={pagination.page === pagination.total_pages} onClick={() => fetchSkills(pagination.page + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  暂无技能
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 分类弹窗 */}
      <Dialog open={categoryDialog.open} onOpenChange={(open) => !open && setCategoryDialog({ open: false, mode: 'create' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{categoryDialog.mode === 'create' ? '添加分类' : '编辑分类'}</DialogTitle>
            <DialogDescription>填写分类信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="如：前端开发" />
            </div>
            <div className="space-y-2">
              <Label>标识</Label>
              <Input value={categoryForm.slug} onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="如：frontend" />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea value={categoryForm.description || ''} onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} placeholder="分类描述" />
            </div>
            <div className="space-y-2">
              <Label>图标 (Emoji)</Label>
              <Input value={categoryForm.icon || ''} onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))} placeholder="如：🚀" />
            </div>
            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
                <Input value={categoryForm.color} onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>排序</Label>
              <Input type="number" value={categoryForm.sort_order} onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog({ open: false, mode: 'create' })}>取消</Button>
            <Button onClick={handleCategorySubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>确定要删除分类 "{deleteDialog.name}" 吗？此操作会同时删除该分类下的所有技能。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 技能弹窗 */}
      <Dialog open={skillDialog.open} onOpenChange={(open) => !open && setSkillDialog({ open: false, mode: 'create' })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{skillDialog.mode === 'create' ? '添加技能' : '编辑技能'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input value={skillForm.name} onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))} placeholder="技能名称" />
            </div>
            <div className="space-y-2">
              <Label>标识</Label>
              <Input value={skillForm.slug} onChange={(e) => setSkillForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="slug（可选，自动生成）" />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea value={skillForm.description || ''} onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))} placeholder="技能描述" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>图标 URL</Label>
                <Input value={skillForm.icon || ''} onChange={(e) => setSkillForm(prev => ({ ...prev, icon: e.target.value }))} placeholder="图标链接" />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={skillForm.logo || ''} onChange={(e) => setSkillForm(prev => ({ ...prev, logo: e.target.value }))} placeholder="Logo链接" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <select
                value={skillForm.category_id || ''}
                onChange={(e) => setSkillForm(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="">选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>官网链接</Label>
                <Input value={skillForm.official_url || ''} onChange={(e) => setSkillForm(prev => ({ ...prev, official_url: e.target.value }))} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>文档链接</Label>
                <Input value={skillForm.documentation_url || ''} onChange={(e) => setSkillForm(prev => ({ ...prev, documentation_url: e.target.value }))} placeholder="https://" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>GitHub 链接</Label>
              <Input value={skillForm.github_url || ''} onChange={(e) => setSkillForm(prev => ({ ...prev, github_url: e.target.value }))} placeholder="https://github.com/" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>定价</Label>
                <select
                  value={skillForm.pricing}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, pricing: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="免费">免费</option>
                  <option value="Freemium">Freemium</option>
                  <option value="付费">付费</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>难度</Label>
                <select
                  value={skillForm.difficulty}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="入门">入门</option>
                  <option value="进阶">进阶</option>
                  <option value="高级">高级</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={skillForm.is_featured}
                onChange={(e) => setSkillForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="featured" className="cursor-pointer">推荐到首页</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillDialog({ open: false, mode: 'create' })}>取消</Button>
            <Button onClick={handleSkillSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
