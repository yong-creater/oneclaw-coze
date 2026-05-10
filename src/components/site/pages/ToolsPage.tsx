'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Image as ImageIcon, Camera, Layout } from 'lucide-react';
import BackToHome from '@/components/site/common/BackToHome';

/* ---------- 工具数据 ---------- */
interface Tool {
  slug: string;
  name: string;
  desc: string;
  cover: string;
  tags: string[];
  icon: React.ElementType;
}

const TOOLS: Tool[] = [
  {
    slug: 'product-generator',
    name: 'AI 商品图生成器',
    desc: '上传商品照片，一键生成高级感商业场景图，支持多风格多比例批量输出',
    cover: '/case-lipstick-main.png',
    tags: ['电商', '商品图', '批量'],
    icon: ImageIcon,
  },
  {
    slug: 'xiaohongshu-generator',
    name: '小红书封面生成器',
    desc: '智能生成小红书爆款封面，自动排版配色，提升笔记点击率',
    cover: '/demo-card-lifestyle.jpg',
    tags: ['小红书', '封面', '爆款'],
    icon: Layout,
  },
  {
    slug: 'ai-photo',
    name: 'AI 写真生成器',
    desc: '上传人像照片，生成专业级写真大片，多种风格一键切换',
    cover: '/demo-scene.jpg',
    tags: ['写真', '人像', '风格'],
    icon: Camera,
  },
];

/* ==================== 工具库页面 ==================== */
export default function ToolsPage() {
  const router = useRouter();

  return (
    <div className="os-page">
      <div className="os-page-inner">
        <BackToHome />
        <h1 className="os-page-title">工具库</h1>
        <p className="os-page-subtitle">专业 AI 创作工具，一键生成高质量内容</p>

        {/* 3列卡片网格 */}
        <div className="os-tool-grid">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.slug}
                className="os-tool-card"
                onClick={() => router.push(`/create?tool=${tool.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(`/create?tool=${tool.slug}`);
                }}
              >
                {/* 封面图 — 260px */}
                <div className="os-tool-card-img">
                  <img src={tool.cover} alt={tool.name} />
                </div>

                {/* 信息区 */}
                <div className="os-tool-card-body">
                  <div className="os-tool-card-title">{tool.name}</div>
                  <div className="os-tool-card-desc">{tool.desc}</div>
                  <div className="os-tool-card-tags">
                    {tool.tags.map((t) => (
                      <span key={t} className="os-card-tag">{t}</span>
                    ))}
                  </div>
                  {/* CTA — 54px 紫蓝渐变 */}
                  <button className="os-tool-card-cta" type="button">
                    <Sparkles style={{ width: 20, height: 20 }} />
                    立即生成
                    <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
