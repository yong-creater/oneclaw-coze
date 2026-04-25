'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FolderOpen, Upload, Search, Grid3X3, List,
  Clock, Star, Trash2, Download, Eye, MoreHorizontal,
  Image, FileText, Music, Video, Archive, X,
  ChevronRight, Sparkles, Copy, Share2, Check
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 文件类型配置
const FILE_TYPES = {
  image: { icon: Image, color: 'from-pink-100 to-rose-100', label: '图片', ext: ['jpg', 'png', 'webp', 'svg'] },
  document: { icon: FileText, color: 'from-blue-100 to-sky-100', label: '文档', ext: ['pdf', 'doc', 'docx', 'txt'] },
  audio: { icon: Music, color: 'from-purple-100 to-violet-100', label: '音频', ext: ['mp3', 'wav', 'ogg'] },
  video: { icon: Video, color: 'from-red-100 to-orange-100', label: '视频', ext: ['mp4', 'webm', 'avi'] },
  archive: { icon: Archive, color: 'from-amber-100 to-yellow-100', label: '压缩包', ext: ['zip', 'rar', '7z'] },
};

// 模拟资产数据
const ASSETS = [
  { id: 1, name: '产品主图-001.jpg', type: 'image', size: '2.4 MB', createdAt: '2024-01-15', thumbnail: '/assets/1.jpg', url: '/assets/1.jpg' },
  { id: 2, name: '设计源文件.psd', type: 'image', size: '15.8 MB', createdAt: '2024-01-15', thumbnail: '/assets/2.jpg', url: '/assets/2.jpg' },
  { id: 3, name: '用户协议.pdf', type: 'document', size: '1.2 MB', createdAt: '2024-01-14', thumbnail: null, url: '/assets/3.pdf' },
  { id: 4, name: '背景音乐.mp3', type: 'audio', size: '4.5 MB', createdAt: '2024-01-14', thumbnail: null, url: '/assets/4.mp3' },
  { id: 5, name: '宣传视频.mp4', type: 'video', size: '28.3 MB', createdAt: '2024-01-13', thumbnail: '/assets/5.jpg', url: '/assets/5.mp4' },
  { id: 6, name: '素材包.zip', type: 'archive', size: '156 MB', createdAt: '2024-01-13', thumbnail: null, url: '/assets/6.zip' },
  { id: 7, name: '活动海报.png', type: 'image', size: '3.1 MB', createdAt: '2024-01-12', thumbnail: '/assets/7.jpg', url: '/assets/7.jpg' },
  { id: 8, name: '品牌指南.pdf', type: 'document', size: '8.9 MB', createdAt: '2024-01-12', thumbnail: null, url: '/assets/8.pdf' },
];

// Toast 组件
function Toast({ message, onClose, icon }: { message: string; onClose: () => void; icon?: React.ReactNode }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
        {icon || <Check className="w-4 h-4 text-green-400" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const [assets, setAssets] = useState(ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; icon?: React.ReactNode } | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { collapsed } = useSidebar();

  // 筛选
  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || asset.type === filterType;
    return matchSearch && matchType;
  });

  // 全选
  const allSelected = filteredAssets.length > 0 && filteredAssets.every(asset => selectedAssets.has(asset.id));

  // 切换选择
  const toggleSelect = (id: number) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 全选切换
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(filteredAssets.map(asset => asset.id)));
    }
  };

  // 删除选中
  const deleteSelected = () => {
    setAssets(prev => prev.filter(asset => !selectedAssets.has(asset.id)));
    setSelectedAssets(new Set());
    setToast({ message: `已删除 ${selectedAssets.size} 个文件` });
  };

  // 复制链接
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setToast({ message: '链接已复制到剪贴板', icon: <Copy className="w-4 h-4 text-green-400" /> });
  };

  // 模拟上传
  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setShowUpload(false);
      setToast({ message: '文件上传成功' });
    }, 2000);
  };

  // 获取类型配置
  const getTypeConfig = (type: string) => {
    return FILE_TYPES[type as keyof typeof FILE_TYPES] || FILE_TYPES.image;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10">
      {/* 左侧统一侧边栏 */}
      <Sidebar />

      {/* 主内容区 - 响应侧边栏折叠状态 */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        {/* 统一顶部 */}
        <Header 
          title="资产库" 
          subtitle={`共 ${assets.length} 个文件`}
          rightContent={
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all"
            >
              <Upload className="w-4 h-4" />
              上传文件
            </button>
          }
        />

        <div className="p-8">
          {/* 工具栏 */}
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur opacity-20 group-focus-within:opacity-30 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文件名..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 筛选和操作 */}
            <div className="flex items-center gap-3">
              {/* 类型筛选 */}
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  全部
                </button>
                {Object.entries(FILE_TYPES).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterType(key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterType === key ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title={config.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* 视图切换 */}
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}>
                  <Grid3X3 className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100' : ''}`}>
                  <List className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* 批量删除 */}
              {selectedAssets.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  删除 ({selectedAssets.size})
                </button>
              )}
            </div>
          </div>

          {/* 内容区域 */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-500">暂无资产文件</h3>
              <p className="text-sm text-slate-400 mt-1">上传文件到资产库，方便管理和复用</p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all"
              >
                <Upload className="w-4 h-4" />
                上传文件
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredAssets.map((asset, index) => {
                const typeConfig = getTypeConfig(asset.type);
                const Icon = typeConfig.icon;
                const isSelected = selectedAssets.has(asset.id);
                
                return (
                  <div
                    key={asset.id}
                    className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isSelected 
                        ? 'border-orange-400 ring-2 ring-orange-100 shadow-lg' 
                        : 'border-slate-200/60 hover:shadow-xl hover:border-slate-200'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* 封面 */}
                    <div className={`aspect-square relative bg-gradient-to-br ${typeConfig.color}`}>
                      {asset.thumbnail ? (
                        <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      
                      {/* 选择框 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(asset.id); }}
                        className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-orange-500 border-orange-500' 
                            : 'bg-white/90 border-white/50 hover:border-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>

                      {/* 操作按钮 */}
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyLink(asset.url)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                          title="复制链接"
                        >
                          <Copy className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* 信息 */}
                    <div className="p-4">
                      <h3 className="font-medium text-slate-800 text-sm truncate">{asset.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">{asset.size}</span>
                        <span className="text-xs text-slate-400">{asset.createdAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {/* 表头 */}
              <div className="flex items-center gap-4 px-5 py-3 bg-slate-50/80 rounded-xl text-xs font-medium text-slate-500">
                <div className="w-5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="w-10">类型</div>
                <div className="flex-1">文件名</div>
                <div className="w-20">大小</div>
                <div className="w-24">上传时间</div>
                <div className="w-20">操作</div>
              </div>

              {/* 列表 */}
              {filteredAssets.map((asset, index) => {
                const typeConfig = getTypeConfig(asset.type);
                const Icon = typeConfig.icon;
                
                return (
                  <div
                    key={asset.id}
                    className="group flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-slate-200/60 hover:shadow-lg hover:border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-5">
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => toggleSelect(asset.id)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div className="w-10">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeConfig.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white/80" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 truncate">{asset.name}</h3>
                    </div>
                    <div className="w-20 text-sm text-slate-500">{asset.size}</div>
                    <div className="w-24 text-sm text-slate-400">{asset.createdAt}</div>
                    <div className="w-20 flex items-center gap-1">
                      <button
                        onClick={() => copyLink(asset.url)}
                        className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                        title="复制链接"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 上传弹窗 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">上传文件</h3>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* 上传区域 */}
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              uploading ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
            }`}>
              {uploading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-orange-500 animate-bounce" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">上传中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">拖拽文件到此处或点击上传</p>
                    <p className="text-xs text-slate-400 mt-1">支持 jpg, png, pdf, mp4 等格式，单文件不超过 200MB</p>
                  </div>
                  <input type="file" className="hidden" />
                  <button
                    onClick={handleUpload}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all"
                  >
                    选择文件
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} onClose={() => setToast(null)} icon={toast.icon} />}

      {/* 底部 - 响应侧边栏折叠状态 */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Footer />
      </div>
    </div>
  );
}
