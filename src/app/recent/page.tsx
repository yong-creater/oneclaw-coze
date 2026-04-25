'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, Grid3X3, FileText, Star, Trash2,
  Search, Filter, MoreHorizontal, Eye, Calendar,
  ChevronRight, Sparkles, X, FolderOpen
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 模拟最近打开数据
const RECENT_ITEMS = [
  { id: 1, name: '小红书封面-618大促', type: 'template', thumbnail: '/recent/1.svg', tool: 'xiaohongshu', createdAt: '2024-01-15 14:30', lastUsed: '2小时前', views: 12 },
  { id: 2, name: '产品主图设计', type: 'template', thumbnail: '/recent/2.svg', tool: 'productpage', createdAt: '2024-01-15 10:20', lastUsed: '昨天', views: 8 },
  { id: 3, name: '端午节海报', type: 'result', thumbnail: '/recent/3.svg', tool: 'festival-poster', createdAt: '2024-01-14 16:45', lastUsed: '昨天', views: 23 },
  { id: 4, name: '抠图-商品展示', type: 'result', thumbnail: '/recent/4.svg', tool: 'remove-bg', createdAt: '2024-01-14 11:10', lastUsed: '3天前', views: 45 },
  { id: 5, name: '头像制作-圣诞风格', type: 'result', thumbnail: '/recent/5.svg', tool: 'avatar-emoji', createdAt: '2024-01-13 20:30', lastUsed: '3天前', views: 67 },
  { id: 6, name: '菜单设计-咖啡店', type: 'template', thumbnail: '/recent/6.svg', tool: 'restaurant-menu', createdAt: '2024-01-13 15:00', lastUsed: '4天前', views: 5 },
  { id: 7, name: '抖音视频封面', type: 'template', thumbnail: '/recent/7.svg', tool: 'douyin', createdAt: '2024-01-12 18:20', lastUsed: '5天前', views: 34 },
  { id: 8, name: '简历形象照', type: 'result', thumbnail: '/recent/8.svg', tool: 'resume-photo', createdAt: '2024-01-11 09:30', lastUsed: '1周前', views: 89 },
];

// Toast 组件
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-green-400" />
        </div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function RecentPage() {
  const [items, setItems] = useState(RECENT_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { collapsed } = useSidebar();

  // 筛选
  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || item.type === filterType;
    return matchSearch && matchType;
  });

  // 全选
  const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedItems.has(item.id));

  // 切换选择
  const toggleSelect = (id: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 全选切换
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  // 删除选中
  const deleteSelected = () => {
    setItems(prev => prev.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    setShowDeleteConfirm(false);
    setToast(`已删除 ${selectedItems.size} 个项目`);
  };

  // 删除单个
  const deleteItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setToast('已删除');
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return <FileText className="w-4 h-4" />;
      case 'result': return <Grid3X3 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'template': return '模板';
      case 'result': return '作品';
      default: return '文件';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10">
      {/* 左侧统一侧边栏 */}
      <Sidebar />

      {/* 主内容区 - 响应侧边栏折叠状态 */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        {/* 统一顶部 */}
        <Header title="最近打开" subtitle={`共 ${items.length} 个项目`} showRightArea={false} />

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
                  placeholder="搜索最近打开..."
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
              {/* 筛选标签 */}
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200">
                {['all', 'template', 'result'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterType === type
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'all' ? '全部' : type === 'template' ? '模板' : '作品'}
                  </button>
                ))}
              </div>

              {/* 批量删除按钮 */}
              {selectedItems.size > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  删除 ({selectedItems.size})
                </button>
              )}
            </div>
          </div>

          {/* 内容区域 */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-500">暂无最近打开</h3>
              <p className="text-sm text-slate-400 mt-1">开始使用工具后，这里将显示你的历史记录</p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                探索工具
              </Link>
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
                <div className="flex-1">名称</div>
                <div className="w-20">类型</div>
                <div className="w-24">最近使用</div>
                <div className="w-16 text-center">浏览</div>
                <div className="w-12 text-center">操作</div>
              </div>

              {/* 列表 */}
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-slate-200/60 hover:shadow-lg hover:border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* 选择框 */}
                  <div className="w-5">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  {/* 封面和名称 */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${index % 2 === 0 ? 'from-orange-100 to-amber-100' : 'from-sky-100 to-blue-100'} flex items-center justify-center overflow-hidden`}>
                      <span className="text-2xl font-bold text-white/40">{item.name.slice(0, 1)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate group-hover:text-orange-500 transition-colors">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {item.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* 类型 */}
                  <div className="w-20">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.type === 'template' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-purple-50 text-purple-600'
                    }`}>
                      {getTypeIcon(item.type)}
                      {getTypeLabel(item.type)}
                    </span>
                  </div>

                  {/* 最近使用 */}
                  <div className="w-24">
                    <span className="text-sm text-slate-600">{item.lastUsed}</span>
                  </div>

                  {/* 浏览数 */}
                  <div className="w-16 flex items-center justify-center gap-1 text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-sm">{item.views}</span>
                  </div>

                  {/* 操作 */}
                  <div className="w-12 flex items-center justify-center gap-1">
                    <Link
                      href={`/tools/${item.tool}`}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">确认删除</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              确定要删除选中的 {selectedItems.size} 个项目吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={deleteSelected}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* 底部 - 响应侧边栏折叠状态 */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Footer />
      </div>
    </div>
  );
}
