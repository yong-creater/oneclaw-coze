'use client';

import { useState } from 'react';
import { ShoppingBag, ScanFace, Eraser, Layers, ArrowLeft, ChevronRight, ImageIcon } from 'lucide-react';

// ==================== 电商商品图首页 ====================
export function EcommerceIndex({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const tools = [
    {
      key: 'product-retouch',
      name: 'AI商品图精修',
      desc: '一键优化商品细节',
      icon: ScanFace,
      color: 'from-emerald-400 to-teal-500',
    },
    {
      key: 'white-bg',
      name: 'AI白底图生成',
      desc: '智能抠图生成白底',
      icon: Eraser,
      color: 'from-sky-400 to-blue-500',
    },
    {
      key: 'scene-gen',
      name: 'AI场景图合成',
      desc: '商品融入真实场景',
      icon: Layers,
      color: 'from-amber-400 to-orange-500',
    },
    {
      key: 'batch-process',
      name: 'AI批量处理',
      desc: '批量处理多张商品图',
      icon: ShoppingBag,
      color: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>电商商品图</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>专为电商场景设计的AI图片处理工具</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              onClick={() => setActiveTab(tool.key)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f97316';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${tool.color.split(' ')[1]} 0%, ${tool.color.split(' ')[3]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontWeight: '600', fontSize: '16px', color: '#1e293b', marginBottom: '6px' }}>
                {tool.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>{tool.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: '#f97316', fontSize: '13px' }}>
                立即使用
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== AI商品图精修 ====================
export function ProductRetouch({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [category, setCategory] = useState('clothing');
  const [processing, setProcessing] = useState(false);

  const categories = [
    { key: 'clothing', name: '服饰' },
    { key: 'beauty', name: '美妆' },
    { key: 'electronics', name: '家电' },
    { key: 'food', name: '食品' },
    { key: 'home', name: '家居' },
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).slice(0, 10 - uploadedImages.length).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setUploadedImages(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('ecommerce')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回电商商品图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI商品图精修</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>AI自动识别商品类型，一键优化商品细节</p>

      {/* 商品类型选择 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>选择商品类型</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: category === cat.key ? '#10b981' : '#e2e8f0',
                background: category === cat.key ? '#ecfdf5' : 'white',
                color: category === cat.key ? '#10b981' : '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 上传区域 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
      }}>
        {uploadedImages.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} id="product-upload" />
            <label htmlFor="product-upload" style={{ cursor: 'pointer' }}>
              <ScanFace className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                点击上传商品图
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                支持 JPG/PNG/WEBP，单张≤20MB，最多10张
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {uploadedImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button
                    onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {uploadedImages.length < 10 && (
                <label htmlFor="product-upload" style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  height: '150px',
                }}>
                  <span style={{ fontSize: '24px', color: '#94a3b8' }}>+</span>
                </label>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: processing ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer',
                }}
              >
                {processing ? '精修中...' : '一键精修'}
              </button>
              <button style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#64748b' }}>
                重新上传
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== AI白底图生成 ====================
export function WhiteBg({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('white');
  const [edgeOptimize, setEdgeOptimize] = useState(true);

  const bgColors = [
    { key: 'white', name: '纯白色', value: '#ffffff' },
    { key: 'cream', name: '米白色', value: '#faf8f5' },
    { key: 'gray', name: '灰白色', value: '#f5f5f5' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('ecommerce')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回电商商品图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI白底图生成</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>智能抠图，一键生成纯白底商品图</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 原图 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>上传商品图</div>
          {!uploadedImage ? (
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '60px', textAlign: 'center', background: '#fafafa' }}>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }} style={{ display: 'none' }} id="white-upload" />
              <label htmlFor="white-upload" style={{ cursor: 'pointer' }}>
                <Eraser className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div style={{ fontSize: '14px', color: '#64748b' }}>点击上传商品图</div>
              </label>
            </div>
          ) : (
            <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <img src={uploadedImage} alt="原图" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            </div>
          )}
        </div>

        {/* 白底图预览 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>白底图预览</div>
          <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div style={{ fontSize: '14px' }}>生成后显示结果</div>
            </div>
          </div>
        </div>
      </div>

      {/* 参数设置 */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>参数设置</div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>背景颜色</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {bgColors.map((bg) => (
              <button
                key={bg.key}
                onClick={() => setBgColor(bg.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: bgColor === bg.key ? '#3b82f6' : '#e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: bg.value, border: '1px solid #e2e8f0' }} />
                <span style={{ fontSize: '13px', color: '#475569' }}>{bg.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={edgeOptimize}
              onChange={(e) => setEdgeOptimize(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: '14px', color: '#475569' }}>开启AI边缘优化</span>
          </label>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginLeft: '28px' }}>
            智能优化抠图边缘，避免毛边、虚化
          </div>
        </div>

        <button
          disabled={!uploadedImage}
          style={{
            width: '100%',
            padding: '14px',
            background: uploadedImage ? '#3b82f6' : '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: uploadedImage ? 'pointer' : 'not-allowed',
          }}
        >
          生成白底图
        </button>
      </div>
    </div>
  );
}

// ==================== AI场景图合成 ====================
export function SceneGen({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scene, setScene] = useState('living');

  const scenes = [
    { key: 'living', name: '家居场景', sub: '卧室、客厅、书房' },
    { key: 'outfit', name: '穿搭场景', sub: '室内穿搭、户外街拍' },
    { key: 'makeup', name: '美妆场景', sub: '化妆台、梳妆台' },
    { key: 'food', name: '美食场景', sub: '餐桌、下午茶' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('ecommerce')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回电商商品图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI场景图合成</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>将商品融入真实使用场景</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 上传商品图 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>上传商品图</div>
          {!uploadedImage ? (
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '60px', textAlign: 'center', background: '#fafafa' }}>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }} style={{ display: 'none' }} id="scene-upload" />
              <label htmlFor="scene-upload" style={{ cursor: 'pointer' }}>
                <Layers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div style={{ fontSize: '14px', color: '#64748b' }}>点击上传商品图</div>
              </label>
            </div>
          ) : (
            <img src={uploadedImage} alt="商品图" style={{ width: '100%', borderRadius: '8px' }} />
          )}
        </div>

        {/* 场景选择 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>选择场景类型</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {scenes.map((s) => (
              <button
                key={s.key}
                onClick={() => setScene(s.key)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: scene === s.key ? '#f59e0b' : '#e2e8f0',
                  background: scene === s.key ? '#fffbeb' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '600', color: scene === s.key ? '#f59e0b' : '#475569' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{s.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={!uploadedImage}
        style={{
          width: '100%',
          marginTop: '24px',
          padding: '14px',
          background: uploadedImage ? '#f59e0b' : '#94a3b8',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: uploadedImage ? 'pointer' : 'not-allowed',
        }}
      >
        生成场景图
      </button>
    </div>
  );
}

// ==================== AI批量处理 ====================
export function BatchProcess({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [processType, setProcessType] = useState('retouch');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const processTypes = [
    { key: 'retouch', name: '批量精修' },
    { key: 'whitebg', name: '批量白底图' },
    { key: 'scene', name: '批量场景合成' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('ecommerce')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回电商商品图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI批量处理</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>一次性处理多张商品图，大幅提升效率</p>

      {/* 处理类型选择 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {processTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setProcessType(type.key)}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '2px solid',
              borderColor: processType === type.key ? '#8b5cf6' : '#e2e8f0',
              background: processType === type.key ? '#f5f3ff' : 'white',
              color: processType === type.key ? '#8b5cf6' : '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* 上传区域 */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <input type="file" accept="image/*" multiple style={{ display: 'none' }} id="batch-upload" />
        <label htmlFor="batch-upload" style={{ cursor: 'pointer' }}>
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
            点击批量上传商品图
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            支持 JPG/PNG/WEBP，最多10张
          </div>
        </label>
      </div>

      {uploadedImages.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
            已上传 {uploadedImages.length}/10 张
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, padding: '14px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600' }}>
              开始批量处理
            </button>
            <button style={{ padding: '14px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', color: '#64748b' }}>
              清空
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
