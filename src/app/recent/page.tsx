'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Calendar,
  Zap
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';
import { getToolCards, formatUsageCount, TOOL_CONFIGS } from '@/config/tools';

interface RecentItem {
  id: number;
  tool_id: string;
  tool_name: string;
  tool_description: string;
  tool_icon: string;
  tool_color: string;
  tool_category: string;
  tool_href: string;
  viewed_at: string;
}

export default function RecentPage() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { collapsed } = useSidebar();

  // 获取最近使用的工具（使用本地配置作为默认数据）
  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      // 尝试从 API 获取
      const res = await fetch('/api/user/history?limit=10');
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setRecentItems(data.data);
      } else {
        // 如果没有数据，使用默认数据（最近添加的工具）
        const defaultRecent = getToolCards().slice(0, 8).map((tool, idx) => ({
          id: idx,
          tool_id: tool.id,
          tool_name: tool.name,
          tool_description: tool.description,
          tool_icon: tool.icon,
          tool_color: tool.color,
          tool_category: tool.categoryName,
          tool_href: tool.href,
          viewed_at: new Date(Date.now() - idx * 3600000).toISOString(),
        }));
        setRecentItems(defaultRecent);
      }
    } catch (error) {
      console.error('获取最近使用失败:', error);
      // 使用默认数据
      const defaultRecent = getToolCards().slice(0, 8).map((tool, idx) => ({
        id: idx,
        tool_id: tool.id,
        tool_name: tool.name,
        tool_description: tool.description,
        tool_icon: tool.icon,
        tool_color: tool.color,
        tool_href: tool.href,
        tool_category: tool.categoryName,
        viewed_at: new Date(Date.now() - idx * 3600000).toISOString(),
      }));
      setRecentItems(defaultRecent);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // 删除单条记录
  const handleDelete = async (item: RecentItem) => {
    // 如果有真实记录，调用 API 删除
    if (item.id && typeof item.id === 'number') {
      try {
        await fetch(`/api/user/history?history_id=${item.id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
    setRecentItems(items => items.filter(i => i.id !== item.id));
  };

  // 清空所有记录
  const handleClearAll = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setRecentItems([]);
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="最近使用" subtitle={`${recentItems.length} 个工具`} />
        
        <div className="p-8">
          {recentItems.length > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                清空全部
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-400 animate-pulse" />
              </div>
              <p className="text-slate-500">加载中...</p>
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无使用记录</h3>
              <p className="text-slate-500 mb-6">开始使用工具，记录会在这里显示</p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                探索工具
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentItems.map((item, idx) => (
                <div
                  key={`${item.tool_id}-${idx}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                >
                  <Link href={item.tool_href || `/tools/${item.tool_id}`} className="block p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.tool_color || 'from-slate-100 to-gray-100'} flex items-center justify-center text-2xl`}>
                        {item.tool_icon || item.tool_name.slice(0, 2)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {item.tool_name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {item.tool_description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTime(item.viewed_at)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                        {item.tool_category}
                      </span>
                    </div>
                  </Link>
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
