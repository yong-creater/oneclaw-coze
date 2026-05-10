'use client';

import { useRouter } from 'next/navigation';
import { Package, Camera, BookImage } from 'lucide-react';

/* ---------- tool data ---------- */
const TOOLS = [
  {
    slug: 'product-generator',
    name: 'AI 商品图生成器',
    desc: '上传商品图，生成高质感电商主图',
    tags: ['电商', '商品图', '白底图'],
    cover: '/tool-covers/product.jpg',
    icon: Package,
  },
  {
    slug: 'xiaohongshu-generator',
    name: '小红书封面生成器',
    desc: '一键生成爆款小红书封面',
    tags: ['小红书', '封面', '社交'],
    cover: '/tool-covers/xiaohongshu.jpg',
    icon: BookImage,
  },
  {
    slug: 'ai-photo',
    name: 'AI 写真生成器',
    desc: '生成氛围感写真大片',
    tags: ['写真', '人像', '氛围感'],
    cover: '/tool-covers/photo.jpg',
    icon: Camera,
  },
];

export default function ToolsPage() {
  const router = useRouter();

  return (
    <div className="os-page">
      <div className="os-page-inner">
        <h1 className="os-page-title">AI 创作工具</h1>
        <p className="os-page-subtitle">选择你想生成的内容，快速获得商业级结果</p>

        {/* 3 列卡片网格 */}
        <div className="os-tool-grid">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <div key={tool.slug} className="os-tool-card">
                {/* 封面图区 */}
                <div className="os-tool-card-img">
                  <img
                    src={tool.cover}
                    alt={tool.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* fallback: icon + 渐变底色 */}
                  <div className="os-tool-card-img-fallback">
                    <Icon style={{ width: 56, height: 56, color: 'rgba(123,97,255,0.35)' }} strokeWidth={1.2} />
                  </div>
                </div>

                {/* 信息区 */}
                <div className="os-tool-card-body">
                  <h3 className="os-tool-card-title">{tool.name}</h3>
                  <p className="os-tool-card-desc">{tool.desc}</p>
                  <div className="os-tool-card-tags">
                    {tool.tags.map(tag => (
                      <span key={tag} className="os-card-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* CTA 渐变按钮 */}
                <button
                  className="os-tool-card-cta"
                  onClick={() => router.push(`/create?tool=${tool.slug}`)}
                >
                  ✨ 开始创作
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
