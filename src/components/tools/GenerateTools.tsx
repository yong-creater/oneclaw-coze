'use client';

import { useState } from 'react';
import { Sparkles, Layers, Type, ImageIcon, ChevronRight, ArrowLeft, Wand2 } from 'lucide-react';

// ==================== AI生成模块首页 ====================
export function GenerateIndex({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const tools = [
    {
      key: 'text2img',
      name: '文生图',
      desc: '文字描述生成图片',
      icon: Type,
      color: 'from-violet-400 to-purple-500',
    },
    {
      key: 'img2img',
      name: '图生图',
      desc: '风格迁移创意转换',
      icon: Layers,
      color: 'from-teal-400 to-cyan-500',
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

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI生成</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>输入文字或上传图片，AI智能生成创意作品</p>

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

// ==================== 文生图 ====================
export function Text2Img({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const styles = [
    { key: 'realistic', name: '真实摄影' },
    { key: 'anime', name: '动漫风格' },
    { key: 'oil', name: '油画质感' },
    { key: 'watercolor', name: '水彩画' },
    { key: '3d', name: '3D渲染' },
  ];

  const sizes = [
    { key: '512x512', name: '512×512' },
    { key: '768x768', name: '768×768' },
    { key: '1024x1024', name: '1024×1024' },
    { key: '1024x1792', name: '竖版 1:1.75' },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setResults(['', '', '']); // 模拟3张生成结果
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('generate')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回AI生成
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>文生图</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>输入文字描述，AI生成精美图片</p>

      {/* 输入区域 */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片内容..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '15px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        {/* 风格选择 */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>选择风格</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {styles.map((s) => (
              <button
                key={s.key}
                onClick={() => setStyle(s.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: style === s.key ? '#f97316' : '#e2e8f0',
                  background: style === s.key ? '#fff7ed' : 'white',
                  color: style === s.key ? '#f97316' : '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 尺寸选择 */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>图片尺寸</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {sizes.map((s) => (
              <button
                key={s.key}
                onClick={() => setSize(s.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: size === s.key ? '#f97316' : '#e2e8f0',
                  background: size === s.key ? '#fff7ed' : 'white',
                  color: size === s.key ? '#f97316' : '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '14px',
            background: generating || !prompt.trim() ? '#94a3b8' : '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {generating ? (
            <>
              <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
              正在生成...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              开始生成
            </>
          )}
        </button>
      </div>

      {/* 结果展示 */}
      {results.length > 0 && (
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            生成结果（3张）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {results.map((_, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ height: '200px', background: 'linear-gradient(135deg, #d1d5db, #9ca3af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon className="w-12 h-12 text-white opacity-50" />
                </div>
                <div style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, padding: '8px', background: '#f97316', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px' }}>
                    下载
                  </button>
                  <button style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#64748b' }}>
                    收藏
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 图生图 ====================
export function Img2Img({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('anime');
  const [intensity, setIntensity] = useState(50);

  const styles = [
    { key: 'anime', name: '动漫风格' },
    { key: 'oil', name: '油画风格' },
    { key: 'watercolor', name: '水彩风格' },
    { key: 'sketch', name: '素描风格' },
    { key: '3d', name: '3D渲染' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('generate')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回AI生成
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>图生图</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>上传图片，AI转换风格</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 上传区域 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
          {!uploadedImage ? (
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '60px', textAlign: 'center', background: '#fafafa' }}>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }} style={{ display: 'none' }} id="img2img-upload" />
              <label htmlFor="img2img-upload" style={{ cursor: 'pointer' }}>
                <Layers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div style={{ fontSize: '15px', color: '#64748b' }}>点击上传图片</div>
              </label>
            </div>
          ) : (
            <div>
              <img src={uploadedImage} alt="原图" style={{ width: '100%', borderRadius: '12px' }} />
              <button
                onClick={() => setUploadedImage(null)}
                style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '14px', color: '#64748b', cursor: 'pointer' }}
              >
                重新上传
              </button>
            </div>
          )}
        </div>

        {/* 风格转换预览 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>转换风格</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {styles.map((s) => (
              <button
                key={s.key}
                onClick={() => setStyle(s.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: style === s.key ? '#f97316' : '#e2e8f0',
                  background: style === s.key ? '#fff7ed' : 'white',
                  color: style === s.key ? '#f97316' : '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
            转换强度: {intensity}%
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316', marginBottom: '20px' }}
          />

          <button
            disabled={!uploadedImage}
            style={{
              width: '100%',
              padding: '14px',
              background: uploadedImage ? '#f97316' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: uploadedImage ? 'pointer' : 'not-allowed',
            }}
          >
            <Layers className="w-5 h-5 inline mr-2" />
            开始转换
          </button>
        </div>
      </div>
    </div>
  );
}
