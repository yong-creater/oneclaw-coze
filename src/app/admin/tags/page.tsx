'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';

// 默认标签
const DEFAULT_TAGS = [
  { id: 1, name: '热门', color: 'bg-red-100 text-red-600 border-red-200' },
  { id: 2, name: '推荐', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 3, name: '新版', color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 4, name: '实用', color: 'bg-green-100 text-green-600 border-green-200' },
  { id: 5, name: '限时', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 6, name: '免费', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { id: 7, name: 'AI', color: 'bg-sky-100 text-sky-600 border-sky-200' },
  { id: 8, name: 'VIP', color: 'bg-amber-100 text-amber-600 border-amber-200' },
];

export default function TagsAdminPage() {
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (tag: typeof DEFAULT_TAGS[0]) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const handleSave = () => {
    if (editingId) {
      setTags(prev => prev.map(t => 
        t.id === editingId ? { ...t, name: editName } : t
      ));
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此标签吗？')) {
      setTags(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">标签管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理工具标签，共 {tags.length} 个标签</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加标签
        </Button>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="搜索标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 标签列表 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {filteredTags.map((tag) => (
              <div 
                key={tag.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {editingId === tag.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-24 h-7"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={handleSave}
                  />
                ) : (
                  <>
                    <Tag className="w-4 h-4 text-slate-400" />
                    <Badge className={tag.color} variant="outline">
                      {tag.name}
                    </Badge>
                    <div className="flex items-center gap-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleEdit(tag)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(tag.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 批量添加 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-slate-800 dark:text-white mb-3">快速添加</h3>
          <div className="flex flex-wrap gap-2">
            {['热门工具', '限时优惠', '新手推荐', '进阶技巧'].map(name => (
              <Button 
                key={name} 
                variant="outline" 
                size="sm"
                onClick={() => setTags(prev => [...prev, { 
                  id: Date.now(), 
                  name, 
                  color: 'bg-slate-100 text-slate-600 border-slate-200' 
                }])}
              >
                <Plus className="w-3 h-3 mr-1" />
                {name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 空状态 */}
      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">没有找到匹配的标签</h3>
          <p className="text-sm text-slate-400 mt-1">点击上方按钮添加新标签</p>
        </div>
      )}
    </div>
  );
}
