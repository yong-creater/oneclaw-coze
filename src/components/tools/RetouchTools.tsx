'use client';

import { useState } from 'react';
import { Wand2, Sliders, Palette, ChevronRight, ArrowLeft } from 'lucide-react';

// ==================== AI修图模块首页 ====================
export function RetouchIndex({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const tools = [
    {
      key: 'retouch-auto',
      name: 'AI一键精修',
      desc: '智能美化，一键出片',
      icon: Wand2,
      color: 'from-orange-400 to-amber-500',
    },
    {
      key: 'retouch-manual',
      name: '手动精细修图',
      desc: '精准调节参数',
      icon: Sliders,
      color: 'from-blue-400 to-cyan-500',
    },
    {
      key: 'retouch-filter',
      name: '滤镜与特效',
      desc: '丰富滤镜素材',
      icon: Palette,
      color: 'from-pink-400 to-rose-500',
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* 返回导航 */}
      <button
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI修图</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>智能美化图片，一键提升画质</p>

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

// ==================== AI一键精修 ====================
export function RetouchAuto({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState('natural');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const modes = [
    { key: 'natural', name: '自然模式', desc: '保留真实质感' },
    { key: '网红', name: '网红模式', desc: '增强磨皮美白' },
    { key: '胶片', name: '胶片模式', desc: '增加颗粒感' },
    { key: '清透', name: '清透模式', desc: '提升光影通透' },
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setResult(uploadedImage); // 模拟处理结果
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('retouch')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回AI修图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI一键精修</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>上传图片，AI自动识别并美化</p>

      {/* 精修模式选择 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>选择精修模式</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: mode === m.key ? '#f97316' : '#e2e8f0',
                background: mode === m.key ? '#fff7ed' : 'white',
                color: mode === m.key ? '#f97316' : '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: '600' }}>{m.name}</div>
              <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 上传区域 */}
      {!uploadedImage ? (
        <div style={{
          border: '2px dashed #e2e8f0',
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          background: '#fafafa',
          marginBottom: '24px',
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
            id="upload-input"
          />
          <label htmlFor="upload-input" style={{ cursor: 'pointer' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Wand2 className="w-8 h-8 text-orange-500" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              点击上传图片
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              支持 JPG/PNG/WEBP，单张≤20MB
            </div>
          </label>
        </div>
      ) : (
        /* 图片预览区 */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* 原图 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>原图</div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <img src={uploadedImage} alt="原图" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            </div>
          </div>

          {/* 精修后 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>精修后</div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              {processing ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '14px', color: '#64748b' }}>AI正在精修中...</div>
                </div>
              ) : result ? (
                <img src={result} alt="精修后" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>点击下方按钮开始精修</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {uploadedImage && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleProcess}
            disabled={processing}
            style={{
              padding: '12px 32px',
              background: processing ? '#94a3b8' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: processing ? 'not-allowed' : 'pointer',
            }}
          >
            {processing ? '精修中...' : '一键精修'}
          </button>
          {result && (
            <>
              <button style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#64748b' }}>
                下载图片
              </button>
              <button style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#64748b' }}>
                保存至资产库
              </button>
            </>
          )}
          <button
            onClick={() => { setUploadedImage(null); setResult(null); }}
            style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#64748b' }}
          >
            重新上传
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== 手动精细修图 ====================
export function RetouchManual({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [activeTool, setActiveTool] = useState('portrait');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, number>>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    skin: 0,
   美白: 0,
  });

  const toolGroups = [
    { key: 'portrait', name: '人像', tools: ['磨皮', '美白', '瘦脸', '大眼', '去黑眼圈'] },
    { key: 'landscape', name: '风景', tools: ['亮度', '对比度', '饱和度', '锐化', '色温'] },
    { key: 'detail', name: '细节', tools: ['裁剪', '旋转', '翻转', '去水印', '污点修复'] },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('retouch')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回AI修图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>手动精细修图</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>精准调节各项参数，打造专业效果</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* 左侧预览 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          {!uploadedImage ? (
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '80px', textAlign: 'center', background: '#fafafa' }}>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }} style={{ display: 'none' }} id="manual-upload" />
              <label htmlFor="manual-upload" style={{ cursor: 'pointer' }}>
                <Sliders className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div style={{ fontSize: '15px', color: '#64748b' }}>点击上传图片</div>
              </label>
            </div>
          ) : (
            <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <img src={uploadedImage} alt="预览" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
            </div>
          )}
        </div>

        {/* 右侧工具面板 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          {/* 工具分类 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {toolGroups.map((group) => (
              <button
                key={group.key}
                onClick={() => setActiveTool(group.key)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTool === group.key ? '#f97316' : '#f1f5f9',
                  color: activeTool === group.key ? 'white' : '#64748b',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* 参数调节 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(activeTool === 'portrait' ? ['磨皮', '美白', '瘦脸', '大眼'] : activeTool === 'landscape' ? ['亮度', '对比度', '饱和度', '锐化', '色温'] : ['裁剪', '旋转']).map((name) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>{name}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>{params[name] || 0}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={params[name] || 0}
                  onChange={(e) => setParams({ ...params, [name]: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f97316' }}
                />
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button style={{ flex: 1, padding: '10px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
              保存
            </button>
            <button style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}>
              还原
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 滤镜与特效 ====================
export function RetouchFilter({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('daily');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);

  const categories = [
    { key: 'daily', name: '日常滤镜' },
    { key: 'vintage', name: '复古胶片' },
    { key: 'ins', name: 'INS风' },
    { key: 'film', name: '胶片感' },
  ];

  const filters = {
    daily: ['自然', '清新', '柔和', '明亮', '暖阳', '冷调'],
    vintage: ['复古', '怀旧', '港风', '昭和', '欧陆'],
    ins: ['ins风', '韩系', '日系', '森系', '莫兰迪'],
    film: ['胶片', '颗粒', '电影感', '青橙', '黑金'],
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('retouch')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回AI修图
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>滤镜与特效</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>丰富滤镜素材，一键改变图片风格</p>

      {/* 分类切换 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeCategory === cat.key ? '#f97316' : '#e2e8f0',
              background: activeCategory === cat.key ? '#fff7ed' : 'white',
              color: activeCategory === cat.key ? '#f97316' : '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 滤镜网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {filters[activeCategory as keyof typeof filters]?.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            style={{
              background: selectedFilter === filter ? '#fff7ed' : 'white',
              border: '2px solid',
              borderColor: selectedFilter === filter ? '#f97316' : '#e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              height: '100px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${
                activeCategory === 'daily' ? '#fef3c7, #fed7aa' :
                activeCategory === 'vintage' ? '#d1d5db, #9ca3af' :
                activeCategory === 'ins' ? '#fce7f3, #fbcfe8' :
                '#1e293b, #475569'
              })`,
              marginBottom: '8px',
            }} />
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{filter}</div>
          </button>
        ))}
      </div>

      {/* 强度调节 */}
      {selectedFilter && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>滤镜强度</span>
            <span style={{ fontSize: '15px', color: '#64748b' }}>{intensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316' }}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button style={{ flex: 1, padding: '12px', background: '#f97316', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500' }}>
              应用滤镜
            </button>
            <button style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#64748b' }}>
              保存图片
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
