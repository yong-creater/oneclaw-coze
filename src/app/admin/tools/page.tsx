'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, ExternalLink, Grid3X3, Trash2 } from 'lucide-react';

// 7个AI生图工具
const AI_IMAGE_TOOLS = [
  { 
    id: 1,
    name: 'AI头像表情包', 
    desc: '上传照片，一键生成精美头像和表情包', 
    tag: '热门',
    color: 'from-pink-100 to-rose-100',
    key: 'avatar-emoji',
    url: '/avatar-emoji'
  },
  { 
    id: 2,
    name: '形象照生成', 
    desc: 'AI生成专业简历形象照', 
    tag: '推荐',
    color: 'from-sky-100 to-blue-100',
    key: 'resume-photo',
    url: '/resume-photo'
  },
  { 
    id: 3,
    name: '小红书配图', 
    desc: '爆款小红书封面图一键生成', 
    tag: '热门',
    color: 'from-pink-50 to-red-50',
    key: 'xiaohongshu',
    url: '/xiaohongshu'
  },
  { 
    id: 4,
    name: '抖音封面生成', 
    desc: '视频封面一键生成，支持多种风格', 
    tag: '新版',
    color: 'from-purple-100 to-pink-100',
    key: 'douyin',
    url: '/douyin'
  },
  { 
    id: 5,
    name: '餐饮菜单设计', 
    desc: '上传菜品图片，智能生成精美菜单', 
    tag: '实用',
    color: 'from-amber-100 to-orange-100',
    key: 'restaurant-menu',
    url: '/restaurant-menu'
  },
  { 
    id: 6,
    name: '节日营销海报', 
    desc: '端午、中秋等节日海报一键生成', 
    tag: '限时',
    color: 'from-red-100 to-orange-100',
    key: 'festival-poster',
    url: '/festival-poster'
  },
  { 
    id: 7,
    name: '商品详情页', 
    desc: '电商主图和详情页设计', 
    tag: '新版',
    color: 'from-emerald-100 to-teal-100',
    key: 'productpage',
    url: '/productpage'
  },
];

export default function ToolsAdminPage() {
  const [tools] = useState(AI_IMAGE_TOOLS);
  const [search, setSearch] = useState('');

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">工具管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理AI生图工具，共 {tools.length} 个工具</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加工具
        </Button>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="搜索工具..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 工具列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="overflow-hidden">
            {/* 预览图 */}
            <div className={`h-32 bg-gradient-to-br ${tool.color} flex items-center justify-center relative`}>
              <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-600 dark:text-slate-300">{tool.name.slice(0, 2)}</span>
              </div>
              <Badge className="absolute top-3 right-3" variant="secondary">
                {tool.tag}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{tool.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{tool.desc}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Link href={tool.url} target="_blank" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    访问
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Grid3X3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">没有找到匹配的工具</h3>
          <p className="text-sm text-slate-400 mt-1">尝试其他关键词</p>
        </div>
      )}
    </div>
  );
}
