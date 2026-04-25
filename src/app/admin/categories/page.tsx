'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, FolderTree, GripVertical } from 'lucide-react';

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'AI生图', slug: 'ai-image', count: 7, color: 'bg-orange-100 text-orange-600' },
  { id: 2, name: '头像表情', slug: 'avatar', count: 1, color: 'bg-pink-100 text-pink-600' },
  { id: 3, name: '封面设计', slug: 'cover', count: 2, color: 'bg-purple-100 text-purple-600' },
  { id: 4, name: '营销海报', slug: 'marketing', count: 1, color: 'bg-red-100 text-red-600' },
  { id: 5, name: '电商设计', slug: 'ecommerce', count: 1, color: 'bg-emerald-100 text-emerald-600' },
];

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (cat: typeof DEFAULT_CATEGORIES[0]) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSave = () => {
    if (editingId) {
      setCategories(prev => prev.map(c => 
        c.id === editingId ? { ...c, name: editName } : c
      ));
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此分类吗？')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">分类管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理工具分类，共 {categories.length} 个分类</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加分类
        </Button>
      </div>

      {/* 分类列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                
                <div className="flex-1 flex items-center gap-3">
                  {editingId === cat.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="max-w-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <>
                      <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-slate-400">/ {cat.slug}</p>
                      </div>
                    </>
                  )}
                </div>

                <Badge variant="secondary">
                  {cat.count} 个工具
                </Badge>

                <div className="flex items-center gap-2">
                  {editingId === cat.id ? (
                    <Button size="sm" onClick={handleSave}>保存</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 空状态 */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">暂无分类</h3>
          <p className="text-sm text-slate-400 mt-1">点击上方按钮添加第一个分类</p>
        </div>
      )}
    </div>
  );
}
