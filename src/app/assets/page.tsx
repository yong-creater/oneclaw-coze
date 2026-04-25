'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FolderOpen, Upload, Image, FileText, Video, Download, Trash2, Star, Search, Grid3X3, List, Folder, Share2, Check } from 'lucide-react';
import { Sidebar, Header, Footer } from '@/components/common';

// 资产数据
const ASSETS = [
  { id: 1, type: 'image', name: '产品主图_01.jpg', size: '2.4MB', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', createdAt: '2024-04-20' },
  { id: 2, type: 'image', name: '模特展示图_02.jpg', size: '3.1MB', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', createdAt: '2024-04-19' },
  { id: 3, type: 'image', name: '场景图_户外音响.jpg', size: '4.5MB', thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop', createdAt: '2024-04-18' },
  { id: 4, type: 'image', name: '详情页Banner.jpg', size: '1.8MB', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop', createdAt: '2024-04-17' },
  { id: 5, type: 'video', name: '产品视频_v1.mp4', size: '45MB', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop', createdAt: '2024-04-16' },
  { id: 6, type: 'document', name: '设计源文件.ai', size: '12MB', thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop', createdAt: '2024-04-15' },
  { id: 7, type: 'image', name: '小红书封面图.jpg', size: '2.1MB', thumbnail: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop', createdAt: '2024-04-14' },
  { id: 8, type: 'image', name: '亚马逊主图_A+.jpg', size: '3.3MB', thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop', createdAt: '2024-04-13' },
];

// 文件夹
const FOLDERS = [
  { id: 1, name: '电商素材', count: 24 },
  { id: 2, name: '小红书内容', count: 18 },
  { id: 3, name: '产品视频', count: 8 },
  { id: 4, name: '设计源文件', count: 12 },
];

// 类型图标
const TYPE_ICONS = {
  image: Image,
  video: Video,
  document: FileText,
};

// 类型名称
const TYPE_NAMES = {
  image: '图片',
  video: '视频',
  document: '文档',
};

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // 筛选
  const filteredAssets = ASSETS.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 选择
  const toggleSelect = (id: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 全选
  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAssets.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAssets.map(a => a.id)));
    }
  };

  // 删除
  const handleDelete = () => {
    if (selectedItems.size === 0) return;
    setToast(`已删除 ${selectedItems.size} 个文件`);
    setSelectedItems(new Set());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧统一导航 */}
      <Sidebar searchPlaceholder="搜索资产..." />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 统一顶部 */}
        <Header 
          title="资产库" 
          subtitle={`共 ${ASSETS.length} 个文件`} 
          showRightArea={false}
        />

        <div className="p-6">
          <div className="flex items-center gap-2">
            {/* 上传按钮 */}
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
              <Upload className="w-4 h-4" />
              上传
            </button>
          </div>

          {/* 搜索和视图切换 */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文件名..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <>
                  <span className="text-sm text-slate-500">已选择 {selectedItems.size} 项</span>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </>
              )}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}>
                  <Grid3X3 className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100' : ''}`}>
                  <List className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 文件夹 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">文件夹</h3>
            <div className="grid grid-cols-4 gap-3">
              {FOLDERS.map(folder => (
                <button
                  key={folder.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">{folder.name}</h4>
                    <p className="text-xs text-slate-400">{folder.count} 个文件</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 文件列表 */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3">所有文件</h3>
            {filteredAssets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-base font-medium text-slate-500">暂无文件</h3>
                <p className="text-sm text-slate-400 mt-1">点击上方「上传」按钮添加文件</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAssets.map(asset => {
                  const TypeIcon = TYPE_ICONS[asset.type as keyof typeof TYPE_ICONS] || FileText;
                  const isSelected = selectedItems.has(asset.id);
                  return (
                    <div
                      key={asset.id}
                      className={`group relative bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                        isSelected ? 'border-orange-400 ring-2 ring-orange-100' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {/* 选中标记 */}
                      <div 
                        className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected ? 'bg-orange-500 border-orange-500' : 'bg-white/90 border-slate-300 hover:border-orange-400'
                        }`}
                        onClick={() => toggleSelect(asset.id)}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      
                      {/* 缩略图 */}
                      <div className="aspect-square bg-slate-50">
                        <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* 信息 */}
                      <div className="p-2">
                        <h4 className="text-xs font-medium text-slate-700 truncate">{asset.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400">{asset.size}</span>
                          <span className="text-[10px] text-slate-400">{asset.createdAt}</span>
                        </div>
                      </div>

                      {/* 悬停操作 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                          <Download className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                          <Share2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="w-10 p-3"></th>
                      <th className="text-left p-3 text-sm font-medium text-slate-500">文件名</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-500">类型</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-500">大小</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-500">上传时间</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(asset => {
                      const TypeIcon = TYPE_ICONS[asset.type as keyof typeof TYPE_ICONS] || FileText;
                      const isSelected = selectedItems.has(asset.id);
                      return (
                        <tr key={asset.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-orange-50' : ''}`}>
                          <td className="p-3">
                            <div 
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                                isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300'
                              }`}
                              onClick={() => toggleSelect(asset.id)}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <img src={asset.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                              </div>
                              <span className="text-sm text-slate-700">{asset.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-slate-500">{TYPE_NAMES[asset.type as keyof typeof TYPE_NAMES]}</td>
                          <td className="p-3 text-sm text-slate-500">{asset.size}</td>
                          <td className="p-3 text-sm text-slate-500">{asset.createdAt}</td>
                          <td className="p-3 text-right">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* 底部 - 全宽 */}
      <div className="ml-56">
        <Footer />
      </div>
    </div>
  );
}
