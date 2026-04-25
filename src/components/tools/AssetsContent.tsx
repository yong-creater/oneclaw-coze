'use client';

import { useState } from 'react';
import { FolderOpen, Upload, Search, Grid3X3, List, Download, Trash2, Star, ArrowLeft, ImageIcon } from 'lucide-react';

// ==================== 资产库内容 ====================
export function AssetsContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);

  interface Asset {
    id: string;
    name: string;
    type: 'original' | 'retouch' | 'cover' | 'product';
    thumbnail: string;
    createdAt: string;
    size: string;
  }

  const categories = [
    { key: 'all', name: '全部' },
    { key: 'original', name: '原图' },
    { key: 'retouch', name: '修图' },
    { key: 'cover', name: '封面图' },
    { key: 'product', name: '商品图' },
  ];

  // 模拟数据
  const mockAssets: Asset[] = [
    { id: '1', name: '风景照片.jpg', type: 'original', thumbnail: '', createdAt: '2024-01-15', size: '2.5MB' },
    { id: '2', name: '人像精修.jpg', type: 'retouch', thumbnail: '', createdAt: '2024-01-14', size: '3.2MB' },
    { id: '3', name: '小红书封面.png', type: 'cover', thumbnail: '', createdAt: '2024-01-13', size: '1.8MB' },
    { id: '4', name: '商品白底图.jpg', type: 'product', thumbnail: '', createdAt: '2024-01-12', size: '1.2MB' },
  ];

  const displayAssets = assets.length > 0 ? assets : mockAssets;

  const filteredAssets = displayAssets.filter((asset) => {
    const matchCategory = category === 'all' || asset.type === category;
    const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </button>

      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>图片资产库</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>已保存 {filteredAssets.length} 张图片</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f97316', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500' }}>
            <Upload className="w-4 h-4" />
            上传图片
          </button>
        </div>
      </div>

      {/* 工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        {/* 搜索 */}
        <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索图片名称..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* 分类筛选 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: category === cat.key ? '#f97316' : '#e2e8f0',
                background: category === cat.key ? '#fff7ed' : 'white',
                color: category === cat.key ? '#f97316' : '#64748b',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 视图切换 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'grid' ? '#f1f5f9' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <Grid3X3 className="w-5 h-5" style={{ color: viewMode === 'grid' ? '#1e293b' : '#94a3b8' }} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'list' ? '#f1f5f9' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <List className="w-5 h-5" style={{ color: viewMode === 'list' ? '#1e293b' : '#94a3b8' }} />
          </button>
        </div>
      </div>

      {/* 图片列表 */}
      {filteredAssets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
            暂无图片
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            点击上方「上传图片」按钮添加
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ImageIcon className="w-10 h-10 text-slate-400" />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '4px 8px',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'white',
                }}>
                  {categories.find(c => c.key === asset.type)?.name || asset.type}
                </div>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {asset.name}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {asset.size} · {asset.createdAt}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button style={{ flex: 1, padding: '6px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Download className="w-3 h-3" />
                    下载
                  </button>
                  <button style={{ padding: '6px 8px', background: '#fef2f2', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>图片</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>类型</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>大小</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>日期</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#475569' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{asset.name}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                    {categories.find(c => c.key === asset.type)?.name || asset.type}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{asset.size}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{asset.createdAt}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer', marginRight: '8px' }}>
                      <Download className="w-3 h-3 inline" />
                    </button>
                    <button style={{ padding: '6px 12px', background: '#fef2f2', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 className="w-3 h-3 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 存储信息 */}
      <div style={{ marginTop: '24px', padding: '16px 20px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          存储空间使用
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '200px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '35%', height: '100%', background: '#f97316', borderRadius: '4px' }} />
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>350MB / 1GB</span>
        </div>
      </div>
    </div>
  );
}
