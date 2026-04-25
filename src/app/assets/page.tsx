'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FolderOpen, 
  Trash2, 
  Download,
  Star,
  Image,
  MoreHorizontal,
  Upload,
  Grid3X3,
  List,
  Search,
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 模拟资产数据
const assets = [
  { id: 1, name: '产品展示图_001', type: 'image', size: '2.4MB', date: '2024-01-15', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', favorite: true },
  { id: 2, name: '模特图_001', type: 'image', size: '3.1MB', date: '2024-01-14', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', favorite: false },
  { id: 3, name: '详情页模板', type: 'design', size: '1.8MB', date: '2024-01-13', thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop', favorite: true },
  { id: 4, name: '商品主图_002', type: 'image', size: '2.2MB', date: '2024-01-12', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', favorite: false },
  { id: 5, name: '海报设计_v2', type: 'design', size: '4.5MB', date: '2024-01-11', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop', favorite: true },
  { id: 6, name: '证件照_标准', type: 'image', size: '0.8MB', date: '2024-01-10', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', favorite: false },
];

export default function AssetsPage() {
  const [assetsList, setAssetsList] = useState(assets);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const { collapsed } = useSidebar();

  const filteredAssets = assetsList.filter(asset => 
    asset.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setAssetsList(assetsList.filter(item => item.id !== id));
  };

  const handleToggleFavorite = (id: number) => {
    setAssetsList(assetsList.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="资产库" subtitle={`${filteredAssets.length} 个文件`} />
        
        <div className="p-8">
          {/* 工具栏 */}
          <div className="flex items-center gap-4 mb-6">
            {/* 搜索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索文件名..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* 上传按钮 */}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              上传
            </button>

            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无资产</h3>
              <p className="text-slate-500 mb-6">上传你的设计作品，统一管理</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                上传资产
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map((asset, idx) => (
                <div
                  key={asset.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* 预览图 */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img 
                      src={asset.thumbnail} 
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* 收藏 */}
                    <button
                      onClick={() => handleToggleFavorite(asset.id)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-all cursor-pointer ${
                        asset.favorite 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-white/90 text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    {/* 类型标签 */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-md">
                      {asset.type === 'image' ? '图片' : '设计'}
                    </div>
                  </div>
                  {/* 信息 */}
                  <div className="p-3">
                    <h3 className="font-medium text-slate-900 text-sm line-clamp-1 mb-1">{asset.name}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{asset.size}</span>
                      <span>{asset.date}</span>
                    </div>
                  </div>
                  {/* 操作 */}
                  <div className="px-3 pb-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      下载
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssets.map((asset, idx) => (
                <div
                  key={asset.id}
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* 预览图 */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-md ${
                        asset.type === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {asset.type === 'image' ? '图片' : '设计'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{asset.size}</span>
                      <span>{asset.date}</span>
                    </div>
                  </div>
                  {/* 操作 */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleFavorite(asset.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        asset.favorite 
                          ? 'text-amber-500 bg-amber-50' 
                          : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
          <Footer />
        </div>
      </main>
    </div>
  );
}
