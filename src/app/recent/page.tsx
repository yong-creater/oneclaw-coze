'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, FileText, Image, Video, Trash2, Star, Search, X } from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';

// 最近打开的数据
const RECENT_ITEMS = [
  { 
    id: 1, 
    type: 'image', 
    name: '小红书封面设计', 
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
    tool: '小红书封面',
    updatedAt: '10分钟前'
  },
  { 
    id: 2, 
    type: 'image', 
    name: '商品主图_v2', 
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    tool: '商品主图',
    updatedAt: '30分钟前'
  },
  { 
    id: 3, 
    type: 'document', 
    name: '端午节日海报', 
    thumbnail: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop',
    tool: '节日海报',
    updatedAt: '1小时前'
  },
  { 
    id: 4, 
    type: 'video', 
    name: '产品视频剪辑', 
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop',
    tool: '视频封面',
    updatedAt: '2小时前'
  },
  { 
    id: 5, 
    type: 'image', 
    name: '模特试衣效果图', 
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    tool: '服饰穿戴',
    updatedAt: '昨天'
  },
  { 
    id: 6, 
    type: 'document', 
    name: '简历形象照', 
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop',
    tool: 'AI写真',
    updatedAt: '昨天'
  },
];

// 类型图标映射
const TYPE_ICONS = {
  image: Image,
  document: FileText,
  video: Video,
};

export default function RecentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(RECENT_ITEMS);

  // 筛选
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tool.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 删除
  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧统一导航 */}
      <Sidebar searchPlaceholder="搜索最近打开..." />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 顶部栏 */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800">最近打开</h1>
            <span className="text-sm text-slate-400">共 {items.length} 个项目</span>
          </div>
        </header>

        <div className="p-6">
          {/* 搜索 */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件名或工具..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>

          {/* 项目列表 */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
              <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="text-base font-medium text-slate-500">暂无最近打开</h3>
              <p className="text-sm text-slate-400 mt-1">开始使用工具，创建你的第一个作品</p>
              <Link href="/tools" className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                去创作
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => {
                const TypeIcon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || FileText;
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all"
                  >
                    {/* 缩略图 */}
                    <div className="relative aspect-square bg-slate-50">
                      <img 
                        src={item.thumbnail} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {/* 类型标签 */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-xs text-slate-600 flex items-center gap-1">
                        <TypeIcon className="w-3 h-3" />
                        {item.type === 'image' ? '图片' : item.type === 'video' ? '视频' : '文档'}
                      </div>
                      {/* 删除按钮 */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* 信息 */}
                    <div className="p-3">
                      <h3 className="font-medium text-slate-800 text-sm truncate">{item.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-400">{item.tool}</span>
                        <span className="text-xs text-slate-400">{item.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 底部 - 全宽 */}
      <div className="ml-56">
        <Footer />
      </div>
    </div>
  );
}
