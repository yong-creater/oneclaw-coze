'use client';

import { useState } from 'react';
import { FileText, LayoutTemplate, ArrowLeft, ChevronRight, ImageIcon, Type, Palette } from 'lucide-react';

// ==================== 自媒体图片首页 ====================
export function SocialIndex({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const tools = [
    {
      key: 'cover-gen',
      name: 'AI封面生成',
      desc: '一键生成吸睛封面',
      icon: FileText,
      color: 'from-rose-400 to-pink-500',
    },
    {
      key: 'layout-tool',
      name: '图文排版工具',
      desc: '快速制作精美图文',
      icon: LayoutTemplate,
      color: 'from-violet-400 to-indigo-500',
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

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>自媒体图片</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>专为自媒体创作者设计的AI作图工具</p>

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

// ==================== AI封面生成 ====================
export function CoverGen({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [platform, setPlatform] = useState('xiaohongshu');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('simple');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const platforms = [
    { key: 'gongzhonghao', name: '公众号', size: '900×500' },
    { key: 'xiaohongshu', name: '小红书', size: '1:1 / 4:3' },
    { key: 'douyin', name: '抖音/视频号', size: '16:9' },
  ];

  const styles = [
    { key: 'simple', name: '简约风' },
    { key: 'ins', name: 'INS风' },
    { key: 'retro', name: '复古风' },
    { key: 'cute', name: '可爱风' },
    { key: 'tech', name: '科技风' },
    { key: '干货', name: '干货风' },
  ];

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setResults(['', '', '']);
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('social')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回自媒体图片
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>AI封面生成</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>输入主题关键词，AI生成吸睛封面</p>

      {/* 平台选择 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>选择平台</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {platforms.map((p) => (
            <button
              key={p.key}
              onClick={() => setPlatform(p.key)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: platform === p.key ? '#ec4899' : '#e2e8f0',
                background: platform === p.key ? '#fdf2f8' : 'white',
                color: platform === p.key ? '#ec4899' : '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <div>{p.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{p.size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
            封面主题
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：职场干货分享"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
            关键词
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如：职场、干货、高效"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* 风格选择 */}
        <div style={{ marginBottom: '20px' }}>
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
                  borderColor: style === s.key ? '#ec4899' : '#e2e8f0',
                  background: style === s.key ? '#fdf2f8' : 'white',
                  color: style === s.key ? '#ec4899' : '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          style={{
            width: '100%',
            padding: '14px',
            background: generating || !topic.trim() ? '#94a3b8' : '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: generating || !topic.trim() ? 'not-allowed' : 'pointer',
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
              <FileText className="w-5 h-5" />
              生成封面
            </>
          )}
        </button>
      </div>

      {/* 结果展示 */}
      {results.length > 0 && (
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            生成结果（3张不同样式）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {results.map((_, idx) => (
              <div key={idx} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '180px', background: 'linear-gradient(135deg, #fecdd3, #fda4af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon className="w-10 h-10 text-white opacity-50" />
                </div>
                <div style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, padding: '8px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px' }}>
                    下载
                  </button>
                  <button style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#64748b' }}>
                    编辑
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

// ==================== 图文排版工具 ====================
export function LayoutTool({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [platform, setPlatform] = useState('xiaohongshu');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const platforms = [
    { key: 'xiaohongshu', name: '小红书笔记' },
    { key: 'gongzhonghao', name: '公众号推文' },
    { key: 'douyin', name: '抖音图文' },
  ];

  const templates = [
    { id: '1', name: '干货分享', desc: '适合知识类内容' },
    { id: '2', name: '种草推荐', desc: '适合产品推荐' },
    { id: '3', name: '日常记录', desc: '适合生活分享' },
    { id: '4', name: '节日特辑', desc: '适合节日主题' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => setActiveTab('social')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回自媒体图片
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>图文排版工具</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>选择模板，快速制作精美图文内容</p>

      {/* 平台选择 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => setPlatform(p.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: platform === p.key ? '#8b5cf6' : '#e2e8f0',
              background: platform === p.key ? '#f5f3ff' : 'white',
              color: platform === p.key ? '#8b5cf6' : '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* 模板选择 */}
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>选择模板</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid',
              borderColor: selectedTemplate === t.id ? '#8b5cf6' : '#e2e8f0',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ height: '160px', background: 'linear-gradient(135deg, #ddd6fe, #c4b5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutTemplate className="w-10 h-10 text-white opacity-60" />
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{t.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* 使用模板按钮 */}
      {selectedTemplate && (
        <div style={{ marginTop: '24px' }}>
          <button style={{ width: '100%', padding: '14px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600' }}>
            使用此模板开始编辑
          </button>
        </div>
      )}
    </div>
  );
}
